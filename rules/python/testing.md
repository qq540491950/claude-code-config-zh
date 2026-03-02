---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python 测试规范

> 此文件扩展 [common/testing.md](../common/testing.md) 添加 Python 特定内容。

## 框架

使用 **pytest** 作为测试框架。

## 覆盖率

```bash
pytest --cov=src --cov-report=term-missing
pytest --cov=src --cov-report=html
```

## 测试组织

使用 `pytest.mark` 进行测试分类：

```python
import pytest

@pytest.mark.unit
def test_calculate_total():
    ...

@pytest.mark.integration
def test_database_connection():
    ...

@pytest.mark.slow
def test_large_dataset():
    ...
```

## Fixture 使用

```python
@pytest.fixture
def sample_user():
    return User(name="测试用户", email="test@example.com")

def test_user_creation(sample_user):
    assert sample_user.name == "测试用户"
```

## 参数化测试

```python
@pytest.mark.parametrize("input,expected", [
    ("hello", "HELLO"),
    ("World", "WORLD"),
    ("", ""),
])
def test_uppercase(input, expected):
    assert input.upper() == expected
```

## 测试结构

```python
class TestUserService:
    """用户服务测试类"""
    
    def test_create_user(self, db_session):
        """测试创建用户"""
        # 安排
        user_data = {"name": "Alice", "email": "alice@example.com"}
        
        # 执行
        user = UserService.create(user_data)
        
        # 断言
        assert user.id is not None
        assert user.name == "Alice"
    
    def test_get_user_not_found(self, db_session):
        """测试获取不存在的用户"""
        with pytest.raises(NotFoundError):
            UserService.get_by_id("non-existent-id")
```

## 参考

详见技能：`python-testing` 获取详细的 pytest 模式和 fixture。
