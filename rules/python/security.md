---
paths:
  - "**/*.py"
  - "**/*.pyi"
---
# Python 安全规范

> 此文件扩展 [common/security.md](../common/security.md) 添加 Python 特定内容。

## 密钥管理

```python
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.environ["OPENAI_API_KEY"]  # 如果缺失会抛出 KeyError
# 或使用 get 提供默认值
api_key = os.environ.get("OPENAI_API_KEY")
if not api_key:
    raise ValueError("OPENAI_API_KEY 未配置")
```

## 安全扫描

- 使用 **bandit** 进行静态安全分析：
  ```bash
  bandit -r src/
  ```

## SQL 注入防护

```python
# 错误：f-string 拼接
query = f"SELECT * FROM users WHERE id = {user_id}"

# 正确：参数化查询
cursor.execute("SELECT * FROM users WHERE id = %s", (user_id,))

# 使用 ORM
user = User.query.filter_by(id=user_id).first()
```

## 输入验证

```python
from pydantic import BaseModel, EmailStr, validator

class UserRequest(BaseModel):
    email: EmailStr
    age: int
    
    @validator('age')
    def validate_age(cls, v):
        if v < 0 or v > 150:
            raise ValueError('年龄必须在 0-150 之间')
        return v
```

## 安全检查清单

- [ ] 无硬编码密钥
- [ ] SQL 查询参数化
- [ ] 用户输入验证（Pydantic）
- [ ] 文件路径验证（拒绝 ..）
- [ ] 禁用 eval/exec
- [ ] 安全反序列化
- [ ] 密码使用 bcrypt/argon2 哈希

## 常见漏洞防护

```python
# 命令注入防护
import subprocess
# 错误
os.system(f"ls {user_input}")
# 正确
subprocess.run(["ls", user_input], check=True)

# 路径遍历防护
from pathlib import Path
def safe_path(base_dir: Path, user_path: str) -> Path:
    full_path = (base_dir / user_path).resolve()
    if not str(full_path).startswith(str(base_dir.resolve())):
        raise ValueError("非法路径")
    return full_path
```

## 参考

详见技能：`django-security` 获取 Django 特定的安全指南（如适用）。
