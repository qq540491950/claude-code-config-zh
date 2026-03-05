# 性能优化指南

> 此文件定义性能优化原则、监控指标和常见瓶颈，适用于所有编程语言。

## 性能优化原则

### 1. 先测量，后优化

**原则：** 不要凭直觉优化，先收集数据

```
测量 → 分析 → 优化 → 验证
```

**步骤：**
1. 确定性能基准
2. 识别瓶颈
3. 针对性优化
4. 验证优化效果

### 2. 关注关键路径

**原则：** 优化对用户体验影响最大的部分

**优先级：**
1. 用户可见的延迟
2. 资源密集型操作
3. 频繁执行的代码

### 3. 避免过早优化

**原则：** 正确性 > 可读性 > 性能

**优化时机：**
- 性能测试显示问题
- 用户反馈性能问题
- 监控指标异常

## 性能指标

### 响应时间

| 类型 | 目标 | 说明 |
|------|------|------|
| API 响应 | < 200ms | P95 延迟 |
| 页面加载 | < 3s | 首次内容渲染 |
| 数据库查询 | < 50ms | 单次查询 |
| 静态资源 | < 100ms | CDN 响应 |

### 吞吐量

| 类型 | 说明 |
|------|------|
| QPS | 每秒请求数 |
| TPS | 每秒事务数 |
| 并发数 | 同时处理请求数 |

### 资源使用

| 类型 | 目标 | 说明 |
|------|------|------|
| CPU | < 70% | 平均使用率 |
| 内存 | < 80% | 使用率 |
| 磁盘 I/O | < 70% | 使用率 |
| 网络 | < 50% | 带宽使用 |

## 常见瓶颈

### 1. 数据库瓶颈

**症状：**
- 查询响应慢
- 连接池耗尽
- 死锁频繁

**优化策略：**

**Python (SQLAlchemy):**
```python
# 错误：N+1 查询问题
users = session.query(User).all()
for user in users:
    print(user.orders)  # 每次循环都查询

# 正确：使用 eager loading
users = session.query(User).options(
    joinedload(User.orders)
).all()
```

**TypeScript (Prisma):**
```typescript
// 错误：N+1 查询
const users = await prisma.user.findMany();
for (const user of users) {
  const posts = await prisma.post.findMany({
    where: { userId: user.id }
  });
}

// 正确：使用 include
const users = await prisma.user.findMany({
  include: { posts: true }
});
```

**索引优化：**
```sql
-- 为常用查询条件添加索引
CREATE INDEX idx_user_email ON users(email);
CREATE INDEX idx_order_user_id ON orders(user_id);

-- 复合索引（注意顺序）
CREATE INDEX idx_order_user_status ON orders(user_id, status);
```

### 2. 内存瓶颈

**症状：**
- 内存持续增长
- GC 频繁
- OOM 错误

**优化策略：**

**Python:**
```python
# 错误：一次性加载大量数据
def process_large_file(path):
    with open(path) as f:
        data = f.readlines()  # 全部加载到内存
    return [process(line) for line in data]

# 正确：使用生成器
def process_large_file(path):
    with open(path) as f:
        for line in f:  # 逐行处理
            yield process(line)
```

**JavaScript:**
```javascript
// 错误：累积大量数据
const results = [];
for (let i = 0; i < 1000000; i++) {
  results.push(process(i));
}

// 正确：流式处理
function* processRange(start, end) {
  for (let i = start; i < end; i++) {
    yield process(i);
  }
}

for (const result of processRange(0, 1000000)) {
  // 逐个处理
}
```

### 3. CPU 瓶颈

**症状：**
- CPU 使用率高
- 响应延迟
- 请求超时

**优化策略：**

**Python (使用多进程):**
```python
from concurrent.futures import ProcessPoolExecutor

def cpu_intensive_task(n):
    # CPU 密集型任务
    return sum(i * i for i in range(n))

def parallel_process(items):
    with ProcessPoolExecutor() as executor:
        results = executor.map(cpu_intensive_task, items)
    return list(results)
```

**Node.js (使用 Worker):**
```javascript
// main.js
const { Worker } = require('worker_threads');

function runInWorker(data) {
  return new Promise((resolve, reject) => {
    const worker = new Worker('./worker.js', {
      workerData: data
    });
    worker.on('message', resolve);
    worker.on('error', reject);
  });
}
```

### 4. 网络瓶颈

**症状：**
- API 调用慢
- 超时频繁
- 带宽饱和

**优化策略：**

**并发请求：**
```python
import asyncio
import aiohttp

async def fetch_urls(urls):
    async with aiohttp.ClientSession() as session:
        tasks = [fetch_one(session, url) for url in urls]
        return await asyncio.gather(*tasks)

async def fetch_one(session, url):
    async with session.get(url) as response:
        return await response.text()
```

**请求缓存：**
```typescript
const cache = new Map<string, Promise<Response>>();

async function fetchWithCache(url: string): Promise<Response> {
  if (cache.has(url)) {
    return cache.get(url)!;
  }
  const promise = fetch(url);
  cache.set(url, promise);
  return promise;
}
```

## 缓存策略

### 缓存层级

```
┌─────────────────────────────────────┐
│           浏览器缓存                  │  最快
├─────────────────────────────────────┤
│           CDN 缓存                    │
├─────────────────────────────────────┤
│           应用缓存 (内存)              │
├─────────────────────────────────────┤
│           分布式缓存 (Redis)           │
├─────────────────────────────────────┤
│           数据库缓存                  │  最慢
└─────────────────────────────────────┘
```

### 缓存模式

**Cache Aside (旁路缓存):**
```python
def get_user(user_id: str) -> User:
    # 1. 先查缓存
    cached = cache.get(f"user:{user_id}")
    if cached:
        return cached

    # 2. 缓存未命中，查数据库
    user = db.get_user(user_id)

    # 3. 写入缓存
    cache.set(f"user:{user_id}", user, ttl=300)
    return user

def update_user(user: User) -> None:
    # 1. 更新数据库
    db.update_user(user)
    # 2. 删除缓存（下次读取时重建）
    cache.delete(f"user:{user.id}")
```

**Write Through (写穿透):**
```python
def update_user(user: User) -> None:
    # 同时更新缓存和数据库
    cache.set(f"user:{user.id}", user, ttl=300)
    db.update_user(user)
```

### 缓存失效策略

| 策略 | 说明 | 适用场景 |
|------|------|---------|
| TTL | 固定过期时间 | 大多数场景 |
| LRU | 最近最少使用 | 内存有限 |
| LFU | 最不常用 | 访问模式稳定 |
| FIFO | 先进先出 | 简单场景 |

## 异步处理

### 消息队列

**适用场景：**
- 耗时操作
- 削峰填谷
- 解耦服务

**Python (Celery):**
```python
from celery import Celery

app = Celery('tasks', broker='redis://localhost:6379/0')

@app.task
def send_email(to: str, subject: str, body: str):
    # 异步发送邮件
    ...

# 调用
send_email.delay('user@example.com', 'Hello', '...')
```

**Node.js (Bull):**
```javascript
const Queue = require('bull');

const emailQueue = new Queue('email', 'redis://localhost:6379');

emailQueue.process(async (job) => {
  const { to, subject, body } = job.data;
  // 发送邮件
});

// 添加任务
emailQueue.add({
  to: 'user@example.com',
  subject: 'Hello',
  body: '...'
});
```

## 性能监控

### 关键指标

**应用指标：**
- 请求响应时间 (P50, P95, P99)
- 错误率
- 吞吐量

**系统指标：**
- CPU 使用率
- 内存使用率
- 磁盘 I/O
- 网络 I/O

### 监控工具

| 类型 | 工具 |
|------|------|
| APM | Datadog, New Relic, Sentry |
| 指标 | Prometheus, Grafana |
| 日志 | ELK Stack, Loki |
| 追踪 | Jaeger, Zipkin |

### 性能分析

**Python:**
```python
import cProfile
import pstats

# 分析函数
cProfile.run('main()', 'profile.stats')
stats = pstats.Stats('profile.stats')
stats.sort_stats('cumulative')
stats.print_stats(20)
```

**Node.js:**
```bash
# 生成 CPU Profile
node --prof app.js

# 分析结果
node --prof-process isolate-*.log
```

## 性能检查清单

### 代码层面

- [ ] 避免同步阻塞操作
- [ ] 使用连接池
- [ ] 批量操作替代循环单次操作
- [ ] 合理使用缓存
- [ ] 避免 N+1 查询

### 数据库层面

- [ ] 索引覆盖常用查询
- [ ] 避免 SELECT *
- [ ] 使用分页限制结果集
- [ ] 读写分离（如适用）

### 网络层面

- [ ] 启用压缩
- [ ] 使用 CDN
- [ ] 减少 HTTP 请求
- [ ] 使用 HTTP/2

### 基础设施

- [ ] 水平扩展能力
- [ ] 负载均衡
- [ ] 自动伸缩
- [ ] 监控告警
