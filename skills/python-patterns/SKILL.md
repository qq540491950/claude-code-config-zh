---
name: python-patterns
description: Pythonic 惯用法、PEP 8 标准、类型提示和最佳实践，用于构建健壮、高效、可维护的 Python 应用程序。
---

# Python 开发模式

Pythonic 惯用法和最佳实践，用于构建健壮、高效、可维护的应用程序。

## 何时激活

- 编写新的 Python 代码
- 审查 Python 代码
- 重构现有 Python 代码
- 设计 Python 包/模块

## 核心原则

### 1. 可读性很重要

Python 优先考虑可读性。代码应该显而易见且易于理解。

```python
# 好：清晰可读
def get_active_users(users: list[User]) -> list[User]:
    """从提供的列表中返回活跃用户。"""
    return [user for user in users if user.is_active]


# 坏：聪明但令人困惑
def get_active_users(u):
    return [x for x in u if x.a]
```

### 2. 显式优于隐式

避免魔法；明确你的代码做什么。

### 3. EAFP - 请求原谅比许可更容易

Python 偏好异常处理而非检查条件。

```python
# 好：EAFP 风格
def get_value(dictionary: dict, key: str) -> Any:
    try:
        return dictionary[key]
    except KeyError:
        return default_value
```

## 类型提示

### 基本类型注解

```python
from typing import Optional, List, Dict, Any

def process_user(
    user_id: str,
    data: Dict[str, Any],
    active: bool = True
) -> Optional[User]:
    """处理用户并返回更新的 User 或 None。"""
    if not active:
        return None
    return User(user_id, data)
```

### 现代类型提示（Python 3.9+）

```python
# Python 3.9+ - 使用内置类型
def process_items(items: list[str]) -> dict[str, int]:
    return {item: len(item) for item in items}
```

### Protocol 鸭子类型

```python
from typing import Protocol

class Renderable(Protocol):
    def render(self) -> str:
        """将对象渲染为字符串。"""

def render_all(items: list[Renderable]) -> str:
    """渲染所有实现 Renderable protocol 的项目。"""
    return "\n".join(item.render() for item in items)
```

## 错误处理模式

### 特定异常处理

```python
# 好：捕获特定异常
def load_config(path: str) -> Config:
    try:
        with open(path) as f:
            return Config.from_json(f.read())
    except FileNotFoundError as e:
        raise ConfigError(f"配置文件未找到: {path}") from e
    except json.JSONDecodeError as e:
        raise ConfigError(f"配置 JSON 无效: {path}") from e
```

### 异常链

```python
def process_data(data: str) -> Result:
    try:
        parsed = json.loads(data)
    except json.JSONDecodeError as e:
        # 链接异常以保留追溯
        raise ValueError(f"解析数据失败: {data}") from e
```

### 自定义异常层次

```python
class AppError(Exception):
    """所有应用错误的基类异常。"""
    pass

class ValidationError(AppError):
    """输入验证失败时抛出。"""
    pass

class NotFoundError(AppError):
    """请求的资源未找到时抛出。"""
    pass
```

## 上下文管理器

### 资源管理

```python
# 好：使用上下文管理器
def process_file(path: str) -> str:
    with open(path, 'r') as f:
        return f.read()
```

### 自定义上下文管理器

```python
from contextlib import contextmanager

@contextmanager
def timer(name: str):
    """计时代码块的上下文管理器。"""
    start = time.perf_counter()
    yield
    elapsed = time.perf_counter() - start
    print(f"{name} 耗时 {elapsed:.4f} 秒")

# 使用
with timer("数据处理"):
    process_large_dataset()
```

## 推导式和生成器

### 列表推导式

```python
# 好：简单转换使用列表推导式
names = [user.name for user in users if user.is_active]

# 复杂推导式应该展开
# 坏：太复杂
result = [x * 2 for x in items if x > 0 if x % 2 == 0]

# 好：使用生成器函数
def filter_and_transform(items: Iterable[int]) -> list[int]:
    result = []
    for x in items:
        if x > 0 and x % 2 == 0:
            result.append(x * 2)
    return result
```

### 生成器表达式

```python
# 好：生成器用于延迟求值
total = sum(x * x for x in range(1_000_000))

# 坏：创建大的中间列表
total = sum([x * x for x in range(1_000_000)])
```

## 数据类

### 数据类

```python
from dataclasses import dataclass, field
from datetime import datetime

@dataclass
class User:
    """用户实体，自动生成 __init__, __repr__, __eq__。"""
    id: str
    name: str
    email: str
    created_at: datetime = field(default_factory=datetime.now)
    is_active: bool = True

# 使用
user = User(
    id="123",
    name="Alice",
    email="alice@example.com"
)
```

### 带验证的数据类

```python
@dataclass
class User:
    email: str
    age: int

    def __post_init__(self):
        # 验证邮箱格式
        if "@" not in self.email:
            raise ValueError(f"无效邮箱: {self.email}")
        # 验证年龄范围
        if self.age < 0 or self.age > 150:
            raise ValueError(f"无效年龄: {self.age}")
```

## 装饰器

### 函数装饰器

```python
import functools
import time

def timer(func: Callable) -> Callable:
    """计时函数执行的装饰器。"""
    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        elapsed = time.perf_counter() - start
        print(f"{func.__name__} 耗时 {elapsed:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
```

### 参数化装饰器

```python
def repeat(times: int):
    """多次重复函数的装饰器。"""
    def decorator(func: Callable) -> Callable:
        @functools.wraps(func)
        def wrapper(*args, **kwargs):
            results = []
            for _ in range(times):
                results.append(func(*args, **kwargs))
            return results
        return wrapper
    return decorator

@repeat(times=3)
def greet(name: str) -> str:
    return f"你好, {name}!"
```

## 并发模式

### 线程用于 I/O 密集任务

```python
import concurrent.futures

def fetch_all_urls(urls: list[str]) -> dict[str, str]:
    """使用线程并发获取多个 URL。"""
    with concurrent.futures.ThreadPoolExecutor(max_workers=10) as executor:
        future_to_url = {executor.submit(fetch_url, url): url for url in urls}
        results = {}
        for future in concurrent.futures.as_completed(future_to_url):
            url = future_to_url[future]
            try:
                results[url] = future.result()
            except Exception as e:
                results[url] = f"错误: {e}"
    return results
```

### Async/Await 用于并发 I/O

```python
import asyncio

async def fetch_async(url: str) -> str:
    """异步获取 URL。"""
    import aiohttp
    async with aiohttp.ClientSession() as session:
        async with session.get(url) as response:
            return await response.text()

async def fetch_all(urls: list[str]) -> dict[str, str]:
    """并发获取多个 URL。"""
    tasks = [fetch_async(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)
    return dict(zip(urls, results))
```

## 常用命令

```bash
# 代码格式化
black .
isort .

# 代码检查
ruff check .
pylint mypackage/

# 类型检查
mypy .

# 测试
pytest --cov=mypackage --cov-report=html

# 安全扫描
bandit -r .

# 依赖管理
pip-audit
safety check
```

## Python 惯用法速查

| 惯用法 | 描述 |
|-------|------|
| EAFP | 请求原谅比许可更容易 |
| 上下文管理器 | 使用 `with` 进行资源管理 |
| 列表推导式 | 用于简单转换 |
| 生成器 | 用于延迟求值和大数据集 |
| 类型提示 | 注解函数签名 |
| 数据类 | 自动生成方法的数据容器 |
| `__slots__` | 用于内存优化 |
| f-strings | 用于字符串格式化（Python 3.6+） |
| `pathlib.Path` | 用于路径操作（Python 3.4+） |
| `enumerate` | 用于循环中的索引-元素对 |

## 要避免的反模式

```python
# 坏：可变默认参数
def append_to(item, items=[]):
    items.append(item)
    return items

# 好：使用 None 并创建新列表
def append_to(item, items=None):
    if items is None:
        items = []
    items.append(item)
    return items

# 坏：用 type() 检查类型
if type(obj) == list:
    process(obj)

# 好：使用 isinstance
if isinstance(obj, list):
    process(obj)

# 坏：用 == 比较 None
if value == None:
    process()

# 好：使用 is
if value is None:
    process()

# 坏：裸 except
try:
    risky_operation()
except:
    pass

# 好：特定异常
try:
    risky_operation()
except SpecificError as e:
    logger.error(f"操作失败: {e}")
```

**记住**：Python 代码应该是可读的、显式的，并遵循最小惊讶原则。如有疑问，优先考虑清晰而非聪明。
