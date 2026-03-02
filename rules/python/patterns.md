---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python 设计模式

> 此文件扩展 [common/patterns.md](../common/patterns.md) 添加 Python 特定内容。

## Protocol（鸭子类型）

```python
from typing import Protocol

class Repository(Protocol):
    def find_by_id(self, id: str) -> dict | None: ...
    def save(self, entity: dict) -> dict: ...
```

## Dataclass 作为 DTO

```python
from dataclasses import dataclass

@dataclass
class CreateUserRequest:
    name: str
    email: str
    age: int | None = None
```

## 上下文管理器

使用 `with` 语句进行资源管理：

```python
# 文件操作
with open(path, 'r') as f:
    content = f.read()

# 数据库事务
with db.transaction():
    user = db.create_user(data)
    db.create_profile(user.id)
```

## 生成器模式

使用生成器进行延迟求值：

```python
def read_large_file(path: str) -> Iterator[str]:
    """逐行读取大文件"""
    with open(path) as f:
        for line in f:
            yield line.strip()
```

## 装饰器模式

```python
from functools import wraps
import time

def timer(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        print(f"{func.__name__} 耗时 {time.perf_counter() - start:.4f}s")
        return result
    return wrapper

@timer
def slow_function():
    time.sleep(1)
```

## 参考

详见技能：`python-patterns` 获取全面的模式，包括装饰器、并发和包组织。
