---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python 编码风格

> 此文件扩展 [common/coding-style.md](../common/coding-style.md) 添加 Python 特定内容。

## 标准

- 遵循 **PEP 8** 规范
- 所有函数签名使用**类型注解**

## 不可变性

优先使用不可变数据结构：

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

from typing import NamedTuple

class Point(NamedTuple):
    x: float
    y: float
```

## 格式化

- **black** 用于代码格式化
- **isort** 用于导入排序
- **ruff** 用于代码检查

## 命名规范

```python
# 模块和包：小写下划线
my_module.py

# 类：大驼峰
class UserService:
    pass

# 函数和变量：小写下划线
def get_user_by_id(user_id: str) -> User:
    pass

# 常量：大写下划线
MAX_CONNECTIONS = 100

# 私有属性：前缀下划线
self._internal_state = {}
```

## 参考

详见技能：`python-patterns` 获取全面的 Python 惯用法和模式。
