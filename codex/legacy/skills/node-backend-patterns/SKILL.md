---
name: node-backend-patterns
description: Node.js 后端开发模式，覆盖项目结构、核心模式、错误处理、安全实践、测试策略，兼顾个人开发与团队协作。
---

# Node.js 后端开发模式

适用于 Node.js/JavaScript/TypeScript 后端服务，强调可维护性、可测试性与安全性。

## 何时激活

- 新增或重构 API 路由
- 增加服务层/仓储层
- 优化错误处理与日志
- 上线前做配置与部署检查
- 设计项目结构

## 1. 项目结构

### 分层架构

```
src/
├── routes/           # 路由层：处理 HTTP 请求
│   ├── users.js
│   └── index.js
├── services/         # 服务层：业务逻辑
│   └── userService.js
├── repositories/     # 仓储层：数据访问
│   └── userRepository.js
├── models/           # 数据模型
│   └── User.js
├── middleware/       # 中间件
│   ├── auth.js
│   ├── errorHandler.js
│   └── validator.js
├── utils/            # 工具函数
│   └── logger.js
├── config/           # 配置
│   └── index.js
└── app.js            # 应用入口
```

### 职责划分

| 层级 | 职责 | 依赖 |
|------|------|------|
| Routes | 解析请求、调用服务、返回响应 | Services |
| Services | 业务逻辑、事务管理 | Repositories |
| Repositories | 数据库操作、查询封装 | Models |
| Middleware | 认证、授权、错误处理 | - |

## 2. 核心模式

### 路由薄、服务厚

```javascript
// routes/users.js - 路由只做参数提取和响应转换
import { Router } from 'express'
import { userService } from '../services/userService.js'
import { validateCreateUser } from '../middleware/validator.js'

const router = Router()

router.get('/:id', async (req, res, next) => {
  try {
    const user = await userService.findById(req.params.id)
    if (!user) {
      return res.status(404).json({ error: '用户不存在' })
    }
    res.json(user)
  } catch (error) {
    next(error)
  }
})

router.post('/', validateCreateUser, async (req, res, next) => {
  try {
    const user = await userService.create(req.body)
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
})

export default router
```

```javascript
// services/userService.js - 服务包含业务逻辑
import { userRepository } from '../repositories/userRepository.js'
import { hashPassword } from '../utils/crypto.js'

export const userService = {
  async findById(id) {
    if (!isValidId(id)) {
      throw new ValidationError('无效的用户 ID')
    }
    return userRepository.findById(id)
  },

  async create(data) {
    // 业务逻辑：密码哈希
    const hashedPassword = await hashPassword(data.password)

    // 业务逻辑：检查邮箱唯一性
    const existing = await userRepository.findByEmail(data.email)
    if (existing) {
      throw new ConflictError('邮箱已被注册')
    }

    return userRepository.create({
      ...data,
      password: hashedPassword
    })
  },

  async update(id, data) {
    const user = await this.findById(id)
    if (!user) {
      throw new NotFoundError('用户不存在')
    }

    // 业务逻辑：只能更新特定字段
    const allowedFields = ['name', 'avatar']
    const updateData = filterFields(data, allowedFields)

    return userRepository.update(id, updateData)
  }
}
```

### 依赖注入

```javascript
// 便于测试和解耦
function createUserService({ userRepository, emailService, logger }) {
  return {
    async create(data) {
      const user = await userRepository.create(data)
      await emailService.sendWelcome(user.email)
      logger.info('user-created', { id: user.id })
      return user
    }
  }
}

// 生产环境
import { userRepository } from '../repositories/index.js'
import { emailService } from '../services/emailService.js'
import { logger } from '../utils/logger.js'

export const userService = createUserService({
  userRepository,
  emailService,
  logger
})

// 测试环境
const mockRepo = { create: jest.fn() }
const mockEmail = { sendWelcome: jest.fn() }
const mockLogger = { info: jest.fn() }

const testService = createUserService({
  userRepository: mockRepo,
  emailService: mockEmail,
  logger: mockLogger
})
```

### 配置管理

```javascript
// config/index.js
const requiredEnvVars = [
  'NODE_ENV',
  'PORT',
  'DATABASE_URL',
  'JWT_SECRET'
]

function validateEnv() {
  const missing = requiredEnvVars.filter(key => !process.env[key])
  if (missing.length > 0) {
    throw new Error(`缺少环境变量: ${missing.join(', ')}`)
  }
}

// 启动时验证
validateEnv()

export const config = {
  env: process.env.NODE_ENV,
  port: parseInt(process.env.PORT, 10),
  database: {
    url: process.env.DATABASE_URL,
    poolSize: parseInt(process.env.DB_POOL_SIZE || '10', 10)
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || '1h'
  }
}
```

## 3. 错误处理

### 统一错误类

```javascript
// utils/errors.js
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message)
    this.statusCode = statusCode
    this.code = code
    this.isOperational = true
    Error.captureStackTrace(this, this.constructor)
  }
}

class ValidationError extends AppError {
  constructor(message) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

class NotFoundError extends AppError {
  constructor(message = '资源不存在') {
    super(message, 404, 'NOT_FOUND')
  }
}

class UnauthorizedError extends AppError {
  constructor(message = '未授权') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

class ForbiddenError extends AppError {
  constructor(message = '禁止访问') {
    super(message, 403, 'FORBIDDEN')
  }
}

class ConflictError extends AppError {
  constructor(message) {
    super(message, 409, 'CONFLICT')
  }
}

export {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError
}
```

### 错误中间件

```javascript
// middleware/errorHandler.js
import { AppError } from '../utils/errors.js'
import { logger } from '../utils/logger.js'

export function errorHandler(err, req, res, next) {
  // 记录错误
  logger.error('请求错误', {
    error: err.message,
    stack: err.stack,
    requestId: req.id,
    path: req.path,
    method: req.method
  })

  // 已知错误
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      requestId: req.id
    })
  }

  // 未知错误
  res.status(500).json({
    error: '服务器内部错误',
    code: 'INTERNAL_ERROR',
    requestId: req.id
  })
}

// 404 处理
export function notFoundHandler(req, res) {
  res.status(404).json({
    error: '路由不存在',
    code: 'NOT_FOUND',
    path: req.path
  })
}
```

### 错误响应格式

```javascript
// 成功响应
{
  "data": { ... },
  "meta": {
    "total": 100,
    "page": 1,
    "limit": 20
  }
}

// 错误响应
{
  "error": "用户不存在",
  "code": "NOT_FOUND",
  "requestId": "req-123"
}
```

## 4. 数据验证

### 输入验证中间件

```javascript
// middleware/validator.js
import { ValidationError } from '../utils/errors.js'

export function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true
    })

    if (error) {
      const messages = error.details.map(d => d.message).join(', ')
      return next(new ValidationError(messages))
    }

    req.body = value
    next()
  }
}

// 使用
import Joi from 'joi'

const createUserSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(8).required(),
  age: Joi.number().integer().min(0).max(150)
})

router.post('/', validate(createUserSchema), userController.create)
```

### Zod 验证

```javascript
import { z } from 'zod'

const createUserSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z.string().min(8),
  age: z.number().int().min(0).max(150).optional()
})

export function validateZod(schema) {
  return (req, res, next) => {
    try {
      req.body = schema.parse(req.body)
      next()
    } catch (error) {
      next(new ValidationError(error.errors.map(e => e.message).join(', ')))
    }
  }
}
```

## 5. 日志与监控

### 结构化日志

```javascript
// utils/logger.js
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  formatters: {
    level: (label) => ({ level: label })
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  ...(process.env.NODE_ENV === 'development' && {
    transport: {
      target: 'pino-pretty',
      options: { colorize: true }
    }
  })
})

// 使用
logger.info('用户登录', { userId: user.id, ip: req.ip })
logger.error('数据库连接失败', { error: err.message })
```

### 请求追踪

```javascript
// middleware/requestId.js
import { v4 as uuid } from 'uuid'

export function requestIdMiddleware(req, res, next) {
  req.id = req.headers['x-request-id'] || uuid()
  res.setHeader('x-request-id', req.id)
  next()
}
```

## 6. 安全实践

### 认证中间件

```javascript
// middleware/auth.js
import jwt from 'jsonwebtoken'
import { UnauthorizedError } from '../utils/errors.js'
import { config } from '../config/index.js'

export function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return next(new UnauthorizedError('未提供认证令牌'))
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, config.jwt.secret)
    req.user = decoded
    next()
  } catch (error) {
    next(new UnauthorizedError('令牌无效或已过期'))
  }
}

export function requireRole(role) {
  return (req, res, next) => {
    if (req.user.role !== role) {
      return next(new ForbiddenError('权限不足'))
    }
    next()
  }
}
```

### 安全头

```javascript
import helmet from 'helmet'

app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
  }
}))
```

### 请求限流

```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每个 IP 最多 100 次请求
  message: { error: '请求过于频繁，请稍后重试', code: 'RATE_LIMITED' }
})

app.use('/api', limiter)
```

## 7. 测试策略

### 单元测试

```javascript
import { describe, it, expect, beforeEach, jest } from 'vitest'
import { createUserService } from './userService.js'

describe('UserService', () => {
  let service
  let mockRepo

  beforeEach(() => {
    mockRepo = {
      findById: jest.fn(),
      create: jest.fn(),
      findByEmail: jest.fn()
    }
    service = createUserService({ userRepository: mockRepo })
  })

  it('应该创建用户', async () => {
    mockRepo.findByEmail.mockResolvedValue(null)
    mockRepo.create.mockResolvedValue({ id: 1, email: 'test@example.com' })

    const result = await service.create({
      email: 'test@example.com',
      password: 'password123'
    })

    expect(result.id).toBe(1)
    expect(mockRepo.create).toHaveBeenCalled()
  })

  it('邮箱重复应该抛出错误', async () => {
    mockRepo.findByEmail.mockResolvedValue({ id: 1 })

    await expect(service.create({
      email: 'test@example.com',
      password: 'password123'
    })).rejects.toThrow('邮箱已被注册')
  })
})
```

### 集成测试

```javascript
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { app } from '../app.js'
import { setupTestDB, teardownTestDB } from '../test/helpers.js'

describe('User API', () => {
  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  it('POST /api/users 应该创建用户', async () => {
    const response = await request(app)
      .post('/api/users')
      .send({
        name: 'Alice',
        email: 'alice@example.com',
        password: 'password123'
      })
      .expect(201)

    expect(response.body).toHaveProperty('id')
    expect(response.body.name).toBe('Alice')
  })
})
```

## 8. 部署检查清单

```markdown
## 部署前检查

### 环境配置
- [ ] 所有必需环境变量已设置
- [ ] 数据库连接已验证
- [ ] 日志级别正确（非 debug）

### 安全检查
- [ ] 无硬编码密钥
- [ ] JWT_SECRET 足够长（>= 32 字符）
- [ ] CORS 配置正确
- [ ] 安全头已设置

### 性能检查
- [ ] 数据库连接池配置合理
- [ ] 静态资源已压缩
- [ ] 限流已配置

### 监控
- [ ] 错误追踪已配置（Sentry 等）
- [ ] 日志聚合已配置
- [ ] 健康检查端点可用

### 备份
- [ ] 数据库备份策略已配置
- [ ] 回滚步骤已准备
```

## 交付检查清单

- [ ] 接口路径和方法语义清晰
- [ ] 参数校验完善，错误码一致
- [ ] 日志不包含敏感信息
- [ ] 关键逻辑有单元/集成测试
- [ ] 文档已同步（接口/配置/命令）
- [ ] 错误处理完整
- [ ] 安全检查通过

## 参考

- `javascript-patterns` - JavaScript 核心模式
- `security-review` - 安全审查流程
- `rules/javascript/` - JavaScript 规则