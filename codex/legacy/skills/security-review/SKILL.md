---
name: security-review
description: 安全审查流程与检查清单，涵盖常见漏洞检测、安全编码实践、密钥管理。
---

# 安全审查模式

适用于代码安全审计，帮助识别和修复常见安全漏洞。

## 何时激活

- 代码提交前的安全检查
- 认证/授权相关代码审查
- 处理用户输入的代码
- API 端点开发
- 数据库操作代码

## 1. OWASP Top 10 检查

### 1. 注入攻击

#### SQL 注入

```python
# 危险：SQL 注入
query = f"SELECT * FROM users WHERE id = '{user_id}'"

# 安全：参数化查询
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# 安全：ORM
user = User.query.filter_by(id=user_id).first()
```

```javascript
// 危险：SQL 注入
const query = `SELECT * FROM users WHERE id = '${userId}'`

// 安全：参数化查询
const query = 'SELECT * FROM users WHERE id = $1'
await db.query(query, [userId])

// 安全：ORM
const user = await User.findByPk(userId)
```

#### 命令注入

```python
# 危险：命令注入
import os
os.system(f"ping {user_input}")

# 安全：使用子进程参数列表
import subprocess
result = subprocess.run(['ping', '-c', '1', user_input], capture_output=True)
```

### 2. 失效的身份认证

```python
# 危险：弱密码策略
if password == stored_password:
    return token

# 安全：使用安全的密码验证
import bcrypt

def verify_password(plain_password: str, hashed: str) -> bool:
    return bcrypt.checkpw(plain_password.encode(), hashed.encode())

# 安全：JWT 配置
JWT_CONFIG = {
    'algorithm': 'HS256',
    'expires_in': '1h',  # 短期有效
    'refresh_expires_in': '7d'
}
```

### 3. 敏感数据暴露

```python
# 危险：明文存储密码
user.password = password

# 安全：哈希存储
import bcrypt
user.password_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt())

# 危险：日志中记录敏感信息
logger.info(f"User login: {email}, password: {password}")

# 安全：过滤敏感字段
logger.info(f"User login: {email}")
```

### 4. XML 外部实体（XXE）

```python
# 危险：解析未验证的 XML
from xml.etree import ElementTree
tree = ElementTree.parse(xml_file)

# 安全：禁用外部实体
from defusedxml import ElementTree
tree = ElementTree.parse(xml_file)
```

### 5. 失效的访问控制

```python
# 危险：仅检查是否登录
@require_login
def get_user(request, user_id):
    return User.get(user_id)

# 安全：检查资源所有权
@require_login
def get_user(request, user_id):
    user = User.get(user_id)
    if request.user.id != user.id and not request.user.is_admin:
        raise ForbiddenError()
    return user
```

### 6. 安全配置错误

```python
# 危险：调试模式开启
app.run(debug=True)

# 安全：生产环境关闭调试
app.run(debug=os.environ.get('FLASK_DEBUG', 'false').lower() == 'true')

# 危险：暴露详细错误
return {"error": str(e), "stack": traceback.format_exc()}

# 安全：通用错误信息
return {"error": "Internal server error"}, 500
```

### 7. 跨站脚本（XSS）

```javascript
// 危险：直接插入 HTML
element.innerHTML = userInput

// 安全：使用 textContent
element.textContent = userInput

// 安全：使用 DOMPurify
import DOMPurify from 'dompurify'
element.innerHTML = DOMPurify.sanitize(userInput)
```

### 8. 不安全的反序列化

```python
# 危险：pickle 反序列化不可信数据
import pickle
data = pickle.loads(untrusted_data)

# 安全：使用 JSON
import json
data = json.loads(untrusted_data)
```

### 9. 使用含有已知漏洞的组件

```bash
# 检查依赖漏洞
npm audit
pip-audit
go list -m -json all | nancy

# 及时更新依赖
npm update
pip install --upgrade package
```

### 10. 日志与监控不足

```python
# 安全：记录关键操作
logger.info("User login", {
    "user_id": user.id,
    "ip": request.ip,
    "user_agent": request.user_agent,
    "timestamp": datetime.utcnow().isoformat()
})

# 安全：记录失败尝试
logger.warning("Failed login attempt", {
    "email": email,
    "ip": request.ip,
    "reason": "invalid_password"
})
```

## 2. 密钥管理

### 检查清单

```markdown
## 密钥检查

- [ ] 无硬编码 API 密钥
- [ ] 无硬编码数据库密码
- [ ] 无硬编码 JWT 密钥
- [ ] 敏感配置使用环境变量
- [ ] .env 文件已加入 .gitignore
- [ ] 生产环境密钥已轮换
```

### 正确做法

```python
import os

# 从环境变量读取
API_KEY = os.environ.get('API_KEY')
if not API_KEY:
    raise ValueError('API_KEY environment variable not set')

# 使用 secrets 模块生成安全密钥
import secrets
API_KEY = secrets.token_urlsafe(32)
```

### 检测硬编码密钥

```regex
# 常见密钥模式
(password|passwd|pwd)\s*[=:]\s*['"][^'"]+['"]
(api_key|apikey|api-key)\s*[=:]\s*['"][^'"]+['"]
(secret|token)\s*[=:]\s*['"][^'"]+['"]
(aws_access_key|aws_secret)\s*[=:]\s*['"][^'"]+['"]
```

## 3. 输入验证

### 验证原则

1. **白名单优于黑名单**：明确允许的格式，而非禁止的格式
2. **在边界验证**：所有外部输入在进入系统时验证
3. **类型严格**：确保输入符合预期类型
4. **长度限制**：防止缓冲区溢出和 DoS

### Zod 验证示例

```typescript
import { z } from 'zod'

const userSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().max(255),
  name: z.string().min(1).max(100),
  age: z.number().int().min(0).max(150).optional(),
  role: z.enum(['user', 'admin']).default('user')
})

// 安全解析（失败抛出错误）
const user = userSchema.parse(input)

// 安全解析（失败返回 null）
const user = userSchema.safeParse(input)
if (!user.success) {
  console.error(user.error)
}
```

## 4. API 安全

### 认证头检查

```javascript
// 安全：验证 Authorization 头
function extractToken(req) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Invalid authorization header')
  }
  return authHeader.split(' ')[1]
}
```

### 速率限制

```javascript
import rateLimit from 'express-rate-limit'

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 分钟
  max: 100, // 每 IP 最多 100 次请求
  standardHeaders: true,
  legacyHeaders: false,
})

app.use('/api', limiter)
```

### CORS 配置

```javascript
import cors from 'cors'

app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || [],
  credentials: true,
  maxAge: 86400,
}))
```

## 5. 安全审查清单

### 代码审查清单

```markdown
## 安全审查清单

### 认证与授权
- [ ] 密码使用安全哈希存储
- [ ] JWT 有合理的过期时间
- [ ] 敏感操作需要二次验证
- [ ] 会话有合理的超时设置

### 输入验证
- [ ] 所有用户输入已验证
- [ ] 文件上传已限制类型和大小
- [ ] URL 参数已验证
- [ ] JSON 请求体已验证

### 数据保护
- [ ] 敏感数据已加密存储
- [ ] 传输使用 HTTPS
- [ ] 日志不包含敏感信息
- [ ] 错误不暴露内部细节

### 访问控制
- [ ] API 有认证保护
- [ ] 资源访问有权限检查
- [ ] 管理功能有额外保护
- [ ] 速率限制已配置

### 配置安全
- [ ] 调试模式已关闭
- [ ] 安全头已设置
- [ ] 依赖无已知漏洞
- [ ] 敏感配置不在代码中
```

### 安全头设置

```javascript
import helmet from 'helmet'

app.use(helmet())
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', 'https:'],
  }
}))
```

## 6. 审查流程

### 审查步骤

1. **识别敏感代码**：认证、授权、数据处理、外部调用
2. **检查输入验证**：所有外部数据是否有验证
3. **检查数据处理**：是否有注入风险
4. **检查输出处理**：是否有 XSS 风险
5. **检查配置安全**：密钥管理、安全头

### 输出格式

```markdown
## 安全审查报告

### 严重问题 (Critical)
| 文件 | 行号 | 问题 | 建议 |
|------|------|------|------|
| auth.ts | 42 | SQL 注入风险 | 使用参数化查询 |

### 重要问题 (High)
| 文件 | 行号 | 问题 | 建议 |
|------|------|------|------|
| config.ts | 10 | 硬编码密钥 | 使用环境变量 |

### 建议改进 (Medium)
| 文件 | 行号 | 问题 | 建议 |
|------|------|------|------|
| api.js | 100 | 缺少速率限制 | 添加 rate-limit 中间件 |
```

## 参考

- `rules/common/security.md` - 通用安全规则
- `rules/javascript/security.md` - JavaScript 安全规则
- `rules/common/security.md` - 通用安全规则（团队统一）
