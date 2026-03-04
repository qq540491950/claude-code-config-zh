# Vue + Node 应用 — 项目 CLAUDE.md

> Vue 前端 + Node.js 后端应用示例。
> 复制到项目根目录并根据你的应用自定义。

## 项目概述

**前端技术栈:** Vue 3 (Composition API), TypeScript, Vite, Pinia, Vue Router, Tailwind CSS

**后端技术栈:** Node.js, Express/Fastify, TypeScript, PostgreSQL/MySQL, Redis

**架构:** 前后端分离，RESTful API，JWT 认证

## 关键规则

### 前端 (Vue)

- 使用 Composition API + `<script setup>` 语法
- 组件命名：PascalCase（如 `UserProfile.vue`）
- 组合式函数放在 `composables/`，命名以 `use` 开头
- Props 必须定义类型，使用 `defineProps<T>()`
- 所有 API 调用放在 `services/` 或 `api/` 目录

### 后端 (Node.js)

- 使用 async/await，不使用回调
- 所有路由必须有错误处理中间件
- 环境变量使用 `process.env`，定义在 `.env` 文件
- 输入验证使用 Zod 或 Joi
- 数据库查询使用参数化，防止 SQL 注入

### 数据库

- 迁移文件放在 `migrations/` 目录
- 使用 ORM（Prisma/TypeORM）或查询构建器
- 所有查询必须有分页限制
- 敏感数据必须加密存储

### 认证

- JWT 放在 HttpOnly Cookie 中
- Token 过期时间：Access Token 15分钟，Refresh Token 7天
- 所有受保护路由验证 Token
- 密码使用 bcrypt 哈希

### 代码风格

- 代码或注释中不使用表情符号
- 使用不可变模式 — 展开运算符，永不修改原对象
- 函数保持 50 行以内
- 使用 ESLint + Prettier 格式化

## 文件结构

### 前端
```
src/
  components/
    ui/              # 基础 UI 组件
    forms/           # 表单组件
    layout/          # 布局组件
  views/             # 页面组件
  composables/       # 组合式函数
    useAuth.ts
    useApi.ts
  stores/            # Pinia stores
    user.ts
    app.ts
  router/            # 路由配置
  services/          # API 服务
    api.ts
    auth.ts
  types/             # TypeScript 类型
  utils/             # 工具函数
```

### 后端
```
src/
  controllers/       # 路由控制器
  services/           # 业务逻辑
  repositories/       # 数据访问
  models/             # 数据模型
  middlewares/        # 中间件
    auth.ts
    errorHandler.ts
    validate.ts
  routes/             # 路由定义
  validators/         # 输入验证
  types/              # TypeScript 类型
  utils/              # 工具函数
  config/             # 配置
migrations/           # 数据库迁移
```

## 关键模式

### Vue 组合式函数

```typescript
// composables/useAuth.ts
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { authApi } from '@/services/auth'

export function useAuth() {
  const user = ref<User | null>(null)
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const router = useRouter()

  const isAuthenticated = computed(() => !!user.value)

  async function login(email: string, password: string) {
    isLoading.value = true
    error.value = null

    try {
      const response = await authApi.login({ email, password })
      user.value = response.user
      router.push('/dashboard')
    } catch (e) {
      error.value = e instanceof Error ? e.message : '登录失败'
    } finally {
      isLoading.value = false
    }
  }

  async function logout() {
    await authApi.logout()
    user.value = null
    router.push('/login')
  }

  return {
    user,
    isLoading,
    error,
    isAuthenticated,
    login,
    logout
  }
}
```

### Express 路由模式

```typescript
// routes/users.ts
import { Router } from 'express'
import { validate } from '@/middlewares/validate'
import { userController } from '@/controllers/user'
import { createUserSchema, updateUserSchema } from '@/validators/user'

const router = Router()

router.get('/', userController.list)
router.get('/:id', userController.getById)
router.post('/', validate(createUserSchema), userController.create)
router.put('/:id', validate(updateUserSchema), userController.update)
router.delete('/:id', userController.delete)

export default router
```

### 服务层模式

```typescript
// services/user.ts
import { UserRepository } from '@/repositories/user'
import { hashPassword, comparePassword } from '@/utils/crypto'
import { UserError } from '@/types/errors'

export class UserService {
  constructor(private userRepo: UserRepository) {}

  async create(data: CreateUserData): Promise<User> {
    // 检查邮箱是否已存在
    const existing = await this.userRepo.findByEmail(data.email)
    if (existing) {
      throw new UserError('EMAIL_TAKEN', '邮箱已被注册')
    }

    // 哈希密码
    const hashedPassword = await hashPassword(data.password)

    // 创建用户
    return this.userRepo.create({
      ...data,
      password: hashedPassword
    })
  }

  async authenticate(email: string, password: string): Promise<User> {
    const user = await this.userRepo.findByEmail(email)
    if (!user) {
      throw new UserError('INVALID_CREDENTIALS', '邮箱或密码错误')
    }

    const isValid = await comparePassword(password, user.password)
    if (!isValid) {
      throw new UserError('INVALID_CREDENTIALS', '邮箱或密码错误')
    }

    return user
  }
}
```

### 错误处理中间件

```typescript
// middlewares/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { AppError } from '@/types/errors'

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
) {
  console.error('Error:', err)

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      error: err.message,
      code: err.code
    })
  }

  // 验证错误
  if (err.name === 'ZodError') {
    return res.status(400).json({
      success: false,
      error: '输入验证失败',
      details: err
    })
  }

  // 未知错误
  return res.status(500).json({
    success: false,
    error: '服务器内部错误'
  })
}
```

## 环境变量

### 前端
```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=MyApp
```

### 后端
```bash
# 服务
PORT=3000
NODE_ENV=development

# 数据库
DATABASE_URL=postgresql://user:pass@localhost:5432/myapp

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# 日志
LOG_LEVEL=debug
```

## 测试策略

```bash
/ucc-tdd                    # 新功能的单元 + 集成测试
/ucc-e2e                    # Playwright E2E 测试
/ucc-test-coverage          # 验证 80%+ 覆盖率
```

### 前端测试命令
```bash
# 单元测试
vitest run

# 测试监视模式
vitest watch

# 覆盖率
vitest run --coverage
```

### 后端测试命令
```bash
# 单元测试
npm run test

# 集成测试
npm run test:integration

# 覆盖率
npm run test:coverage
```

## 工作流

```bash
# 规划功能
/ucc-plan "添加用户个人资料编辑功能"

# TDD 开发
/ucc-tdd

# 提交前
/ucc-code-review

# 发布前
/ucc-e2e
/ucc-test-coverage
```

## Git 工作流

- `feat:` 新功能，`fix:` Bug 修复，`refactor:` 代码重构
- 从 `main` 创建功能分支，需要 PR
- CI 运行：lint、type-check、单元测试、E2E 测试
- 部署：PR 创建预览环境，合并到 `main` 后部署生产环境
