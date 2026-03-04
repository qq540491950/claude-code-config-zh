---
name: api-design
description: REST API 设计模式，包括资源命名、状态码、分页、过滤、错误响应、版本控制和限流。
origin: ECC
---

# API 设计模式

设计一致、开发者友好的 REST API 的约定和最佳实践。

## 何时激活

- 设计新的 API 端点
- 审查现有 API 契约
- 添加分页、过滤或排序
- 为 API 实现错误处理
- 规划 API 版本策略
- 构建公开或合作伙伴 API

## 资源设计

### URL 结构

```
# 资源是名词，复数，小写，kebab-case
GET    /api/v1/users
GET    /api/v1/users/:id
POST   /api/v1/users
PUT    /api/v1/users/:id
PATCH  /api/v1/users/:id
DELETE /api/v1/users/:id

# 子资源表示关系
GET    /api/v1/users/:id/orders
POST   /api/v1/users/:id/orders

# 不映射到 CRUD 的操作（谨慎使用动词）
POST   /api/v1/orders/:id/cancel
POST   /api/v1/auth/login
POST   /api/v1/auth/refresh
```

### 命名规则

```
# 正确
/api/v1/team-members          # 多词资源用 kebab-case
/api/v1/orders?status=active  # 查询参数用于过滤
/api/v1/users/123/orders      # 嵌套资源表示所有权

# 错误
/api/v1/getUsers              # URL 中有动词
/api/v1/user                  # 单数（用复数）
/api/v1/team_members          # URL 中用 snake_case
/api/v1/users/123/getOrders   # 嵌套资源中有动词
```

## HTTP 方法和状态码

### 方法语义

| 方法 | 幂等 | 安全 | 用途 |
|------|------|------|------|
| GET | 是 | 是 | 获取资源 |
| POST | 否 | 否 | 创建资源，触发操作 |
| PUT | 是 | 否 | 完全替换资源 |
| PATCH | 否* | 否 | 部分更新资源 |
| DELETE | 是 | 否 | 删除资源 |

*PATCH 可通过正确实现实现幂等

### 状态码参考

```
# 成功
200 OK                    — GET、PUT、PATCH（有响应体）
201 Created               — POST（包含 Location 头）
204 No Content            — DELETE、PUT（无响应体）

# 客户端错误
400 Bad Request           — 验证失败，JSON 格式错误
401 Unauthorized          — 缺少或无效的身份验证
403 Forbidden             — 已认证但未授权
404 Not Found             — 资源不存在
409 Conflict              — 重复条目，状态冲突
422 Unprocessable Entity  — 语义无效（JSON 有效，数据错误）
429 Too Many Requests     — 超过限流

# 服务器错误
500 Internal Server Error — 意外失败（永不暴露详情）
502 Bad Gateway           — 上游服务失败
503 Service Unavailable   — 临时过载，包含 Retry-After
```

### 常见错误

```
# 错误：所有情况都返回 200
{ "status": 200, "success": false, "error": "未找到" }

# 正确：语义化使用 HTTP 状态码
HTTP/1.1 404 Not Found
{ "error": { "code": "not_found", "message": "用户不存在" } }

# 错误：验证错误返回 500
# 正确：返回 400 或 422 并带字段级详情

# 错误：创建资源返回 200
# 正确：返回 201 并带 Location 头
HTTP/1.1 201 Created
Location: /api/v1/users/abc-123
```

## 响应格式

### 成功响应

```json
{
  "data": {
    "id": "abc-123",
    "email": "alice@example.com",
    "name": "Alice",
    "created_at": "2025-01-15T10:30:00Z"
  }
}
```

### 集合响应（带分页）

```json
{
  "data": [
    { "id": "abc-123", "name": "Alice" },
    { "id": "def-456", "name": "Bob" }
  ],
  "meta": {
    "total": 142,
    "page": 1,
    "per_page": 20,
    "total_pages": 8
  },
  "links": {
    "self": "/api/v1/users?page=1&per_page=20",
    "next": "/api/v1/users?page=2&per_page=20",
    "last": "/api/v1/users?page=8&per_page=20"
  }
}
```

### 错误响应

```json
{
  "error": {
    "code": "validation_error",
    "message": "请求验证失败",
    "details": [
      {
        "field": "email",
        "message": "必须是有效的邮箱地址",
        "code": "invalid_format"
      },
      {
        "field": "age",
        "message": "必须在 0 到 150 之间",
        "code": "out_of_range"
      }
    ]
  }
}
```

## 分页

### 偏移分页（简单）

```
GET /api/v1/users?page=2&per_page=20

# 实现
SELECT * FROM users
ORDER BY created_at DESC
LIMIT 20 OFFSET 20;
```

**优点：** 易实现，支持"跳到第 N 页"
**缺点：** 大偏移量时慢（OFFSET 100000），并发插入时不一致

### 游标分页（可扩展）

```
GET /api/v1/users?cursor=eyJpZCI6MTIzfQ&limit=20

# 实现
SELECT * FROM users
WHERE id > :cursor_id
ORDER BY id ASC
LIMIT 21;  -- 多取一条判断 has_next
```

```json
{
  "data": [...],
  "meta": {
    "has_next": true,
    "next_cursor": "eyJpZCI6MTQzfQ"
  }
}
```

**优点：** 性能与位置无关，并发插入时稳定
**缺点：** 无法跳到任意页，游标不透明

### 使用场景

| 场景 | 分页类型 |
|------|---------|
| 管理后台，小数据集（<10K） | 偏移 |
| 无限滚动，信息流，大数据集 | 游标 |
| 公开 API | 游标（默认）+ 偏移（可选）|
| 搜索结果 | 偏移（用户期望页码）|

## 过滤、排序和搜索

### 过滤

```
# 简单等值
GET /api/v1/orders?status=active&customer_id=abc-123

# 比较运算符（使用括号表示法）
GET /api/v1/products?price[gte]=10&price[lte]=100
GET /api/v1/orders?created_at[after]=2025-01-01

# 多值（逗号分隔）
GET /api/v1/products?category=electronics,clothing

# 嵌套字段（点表示法）
GET /api/v1/orders?customer.country=CN
```

### 排序

```
# 单字段（前缀 - 表示降序）
GET /api/v1/products?sort=-created_at

# 多字段（逗号分隔）
GET /api/v1/products?sort=-featured,price,-created_at
```

### 全文搜索

```
# 搜索查询参数
GET /api/v1/products?q=无线+耳机

# 字段特定搜索
GET /api/v1/users?email=alice
```

### 稀疏字段集

```
# 只返回指定字段（减少负载）
GET /api/v1/users?fields=id,name,email
```

## 认证和授权

### 基于令牌的认证

```
# Authorization 头中的 Bearer 令牌
GET /api/v1/users
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

# API 密钥（用于服务器间通信）
GET /api/v1/data
X-API-Key: sk_live_abc123
```

### 授权模式

```typescript
// 资源级：检查所有权
app.get("/api/v1/orders/:id", async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ error: { code: "not_found" } });
  if (order.userId !== req.user.id) return res.status(403).json({ error: { code: "forbidden" } });
  return res.json({ data: order });
});

// 基于角色：检查权限
app.delete("/api/v1/users/:id", requireRole("admin"), async (req, res) => {
  await User.delete(req.params.id);
  return res.status(204).send();
});
```

## 限流

### 响应头

```
HTTP/1.1 200 OK
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1640000000

# 超限时
HTTP/1.1 429 Too Many Requests
Retry-After: 60
{
  "error": {
    "code": "rate_limit_exceeded",
    "message": "超过限流，60 秒后重试。"
  }
}
```

### 限流层级

| 层级 | 限制 | 窗口 | 用途 |
|------|------|------|------|
| 匿名 | 30/分钟 | 按 IP | 公开端点 |
| 已认证 | 100/分钟 | 按用户 | 标准 API 访问 |
| 高级 | 1000/分钟 | 按 API 密钥 | 付费 API 计划 |
| 内部 | 10000/分钟 | 按服务 | 服务间通信 |

## 版本控制

### URL 路径版本控制（推荐）

```
/api/v1/users
/api/v2/users
```

**优点：** 明确，易路由，可缓存
**缺点：** URL 在版本间变化

### 版本策略

```
1. 从 /api/v1/ 开始 — 需要时才版本化
2. 最多维护 2 个活跃版本（当前 + 上一版本）
3. 弃用时间线：
   - 公告弃用（公开 API 提前 6 个月通知）
   - 添加 Sunset 头：Sunset: Sat, 01 Jan 2026 00:00:00 GMT
   - 弃用日期后返回 410 Gone
4. 非破坏性更改不需要新版本：
   - 向响应添加新字段
   - 添加新的可选查询参数
   - 添加新端点
5. 破坏性更改需要新版本：
   - 删除或重命名字段
   - 更改字段类型
   - 更改 URL 结构
   - 更改认证方法
```

## 实现模式

### TypeScript (Next.js API Route)

```typescript
import { z } from "zod";
import { NextRequest, NextResponse } from "next/server";

const createUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(1).max(100),
});

export async function POST(req: NextRequest) {
  const body = await req.json();
  const parsed = createUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({
      error: {
        code: "validation_error",
        message: "请求验证失败",
        details: parsed.error.issues.map(i => ({
          field: i.path.join("."),
          message: i.message,
          code: i.code,
        })),
      },
    }, { status: 422 });
  }

  const user = await createUser(parsed.data);

  return NextResponse.json(
    { data: user },
    {
      status: 201,
      headers: { Location: `/api/v1/users/${user.id}` },
    },
  );
}
```

### Node.js (Express)

```typescript
import express from 'express';
import { body, validationResult } from 'express-validator';

const app = express();
app.use(express.json());

app.post('/api/v1/users',
  body('email').isEmail(),
  body('name').trim().notEmpty(),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({
        error: {
          code: 'validation_error',
          message: '请求验证失败',
          details: errors.array().map(e => ({
            field: e.param,
            message: e.msg,
            code: 'invalid'
          }))
        }
      });
    }

    const user = await createUser(req.body);

    res.status(201)
      .location(`/api/v1/users/${user.id}`)
      .json({ data: user });
  }
);
```

## API 设计检查清单

发布新端点前：

- [ ] 资源 URL 遵循命名约定（复数、kebab-case、无动词）
- [ ] 使用正确的 HTTP 方法（GET 用于读取，POST 用于创建等）
- [ ] 返回适当的状态码（不是所有情况都返回 200）
- [ ] 使用 schema 验证输入（Zod、Joi）
- [ ] 错误响应遵循标准格式并带代码和消息
- [ ] 列表端点实现分页（游标或偏移）
- [ ] 需要认证（或明确标记为公开）
- [ ] 检查授权（用户只能访问自己的资源）
- [ ] 配置限流
- [ ] 响应不泄露内部详情（堆栈跟踪、SQL 错误）
- [ ] 与现有端点命名一致（camelCase vs snake_case）
- [ ] 更新文档（OpenAPI/Swagger 规范）
