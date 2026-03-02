---
description: 全面的 Python 代码审查，检查 PEP 8 合规、类型提示、安全性和 Pythonic 惯用法。调用 python-reviewer 代理。
---

# Python 代码审查

此命令调用 **python-reviewer** 代理进行全面的 Python 特定代码审查。

## 命令功能

1. **识别 Python 变更**：通过 `git diff` 查找修改的 `.py` 文件
2. **运行静态分析**：执行 `ruff`、`mypy`、`pylint`、`black --check`
3. **安全扫描**：检查 SQL 注入、命令注入、不安全反序列化
4. **类型安全审查**：分析类型提示和 mypy 错误
5. **Pythonic 代码检查**：验证代码遵循 PEP 8 和 Python 最佳实践
6. **生成报告**：按严重程度分类问题

## 何时使用

以下情况使用 `/python-review`：
- 编写或修改 Python 代码后
- 提交 Python 变更前
- 审查包含 Python 代码的 Pull Request
- 入职新的 Python 代码库
- 学习 Pythonic 模式和惯用法

## 审查类别

### 关键（必须修复）
- SQL/命令注入漏洞
- 不安全的 eval/exec 使用
- Pickle 不安全反序列化
- 硬编码凭据
- YAML 不安全加载
- 裸 except 隐藏错误

### 高优先级（应该修复）
- 公共函数缺少类型提示
- 可变默认参数
- 静默吞掉异常
- 资源未使用上下文管理器
- C 风格循环而非推导式
- 使用 type() 而非 isinstance()
- 无锁竞态条件

### 中优先级（考虑）
- PEP 8 格式违规
- 公共函数缺少 docstring
- 使用 print 而非 logging
- 低效字符串操作
- 魔法数字无命名常量
- 未使用 f-string 格式化
- 不必要的列表创建

## 自动检查

```bash
# 类型检查
mypy .

# 代码检查和格式化
ruff check .
black --check .
isort --check-only .

# 安全扫描
bandit -r .

# 依赖审计
pip-audit
safety check

# 测试
pytest --cov=app --cov-report=term-missing
```

## 批准标准

| 状态 | 条件 |
|--------|-----------|
| ✅ 批准 | 无关键或高优先级问题 |
| ⚠️ 警告 | 仅有中优先级问题（可谨慎合并） |
| ❌ 阻止 | 发现关键或高优先级问题 |

## 框架特定审查

### Django 项目
审查器检查：
- N+1 查询问题（使用 `select_related` 和 `prefetch_related`）
- 模型变更缺少迁移
- 可以用 ORM 却使用原始 SQL
- 多步操作缺少 `transaction.atomic()`

### FastAPI 项目
审查器检查：
- CORS 配置错误
- Pydantic 模型用于请求验证
- 响应模型正确性
- 正确的 async/await 使用
- 依赖注入模式

### Flask 项目
审查器检查：
- 上下文管理（应用上下文、请求上下文）
- 正确的错误处理
- Blueprint 组织
- 配置管理

## 与其他命令集成

- 先用 `/tdd` 确保测试通过
- 非 Python 特定问题用 `/code-review`
- 提交前用 `/python-review`
- 如静态分析工具失败用 `/build-fix`

## 相关

- 代理：`agents/python-reviewer.md`
- 技能：`skills/python-patterns/`、`skills/python-testing/`

## 常见修复

### 添加类型提示
```python
# 之前
def calculate(x, y):
    return x + y

# 之后
from typing import Union

def calculate(x: Union[int, float], y: Union[int, float]) -> Union[int, float]:
    return x + y
```

### 使用上下文管理器
```python
# 之前
f = open("file.txt")
data = f.read()
f.close()

# 之后
with open("file.txt") as f:
    data = f.read()
```

### 使用列表推导式
```python
# 之前
result = []
for item in items:
    if item.active:
        result.append(item.name)

# 之后
result = [item.name for item in items if item.active]
```

### 修复可变默认参数
```python
# 之前
def append(value, items=[]):
    items.append(value)
    return items

# 之后
def append(value, items=None):
    if items is None:
        items = []
    items.append(value)
    return items
```

### 使用 f-string（Python 3.6+）
```python
# 之前
name = "Alice"
greeting = "Hello, " + name + "!"

# 之后
greeting = f"Hello, {name}!"
```

### 修复循环中字符串拼接
```python
# 之前
result = ""
for item in items:
    result += str(item)

# 之后
result = "".join(str(item) for item in items)
```
