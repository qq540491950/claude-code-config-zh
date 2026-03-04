# 跨语言设计模式

> 此文件定义适用于所有编程语言的通用设计模式和最佳实践。

## 创建型模式

### 1. 工厂模式 (Factory Pattern)

**用途：** 创建对象时不暴露创建逻辑

**Python 示例：**
```python
from dataclasses import dataclass
from typing import Protocol

class Animal(Protocol):
    def speak(self) -> str: ...

@dataclass(frozen=True)
class Dog:
    def speak(self) -> str:
        return "汪汪"

@dataclass(frozen=True)
class Cat:
    def speak(self) -> str:
        return "喵喵"

def create_animal(animal_type: str) -> Animal:
    animals = {"dog": Dog, "cat": Cat}
    if animal_type not in animals:
        raise ValueError(f"Unknown animal: {animal_type}")
    return animals[animal_type]()
```

**TypeScript 示例：**
```typescript
interface Animal {
  speak(): string;
}

class Dog implements Animal {
  speak() { return "汪汪"; }
}

class Cat implements Animal {
  speak() { return "喵喵"; }
}

function createAnimal(type: string): Animal {
  const animals: Record<string, new () => Animal> = {
    dog: Dog,
    cat: Cat,
  };
  const AnimalClass = animals[type];
  if (!AnimalClass) {
    throw new Error(`Unknown animal: ${type}`);
  }
  return new AnimalClass();
}
```

### 2. 建造者模式 (Builder Pattern)

**用途：** 分步骤创建复杂对象

**Python 示例：**
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class RequestConfig:
    url: str
    method: str
    headers: dict
    timeout: int
    retries: int

class RequestBuilder:
    def __init__(self, url: str):
        self._url = url
        self._method = "GET"
        self._headers = {}
        self._timeout = 30
        self._retries = 3

    def method(self, method: str) -> "RequestBuilder":
        self._method = method
        return self

    def header(self, key: str, value: str) -> "RequestBuilder":
        self._headers = {**self._headers, key: value}
        return self

    def timeout(self, seconds: int) -> "RequestBuilder":
        self._timeout = seconds
        return self

    def build(self) -> RequestConfig:
        return RequestConfig(
            url=self._url,
            method=self._method,
            headers=self._headers,
            timeout=self._timeout,
            retries=self._retries,
        )
```

## 结构型模式

### 3. 适配器模式 (Adapter Pattern)

**用途：** 使不兼容的接口能够协同工作

**TypeScript 示例：**
```typescript
// 旧接口
interface LegacyLogger {
  logMessage(msg: string): void;
}

// 新接口
interface Logger {
  log(level: string, message: string): void;
}

// 适配器
class LoggerAdapter implements Logger {
  constructor(private legacy: LegacyLogger) {}

  log(level: string, message: string): void {
    this.legacy.logMessage(`[${level}] ${message}`);
  }
}
```

### 4. 装饰器模式 (Decorator Pattern)

**用途：** 动态添加功能而不修改原有结构

**Python 示例：**
```python
from functools import wraps
import time

def measure_time(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start = time.perf_counter()
        result = func(*args, **kwargs)
        end = time.perf_counter()
        print(f"{func.__name__} 执行时间: {end - start:.4f}秒")
        return result
    return wrapper

@measure_time
def process_data(data: list) -> list:
    return [x * 2 for x in data]
```

### 5. 代理模式 (Proxy Pattern)

**用途：** 控制对对象的访问

**TypeScript 示例：**
```typescript
interface DataService {
  getData(id: string): Promise<string>;
}

class RealDataService implements DataService {
  async getData(id: string): Promise<string> {
    // 实际的数据获取逻辑
    return `data-${id}`;
  }
}

class CachingProxy implements DataService {
  private cache = new Map<string, string>();

  constructor(private realService: DataService) {}

  async getData(id: string): Promise<string> {
    if (this.cache.has(id)) {
      return this.cache.get(id)!;
    }
    const data = await this.realService.getData(id);
    this.cache.set(id, data);
    return data;
  }
}
```

## 行为型模式

### 6. 策略模式 (Strategy Pattern)

**用途：** 定义一系列算法，让它们可以互换

**Python 示例：**
```python
from typing import Protocol

class SortStrategy(Protocol):
    def sort(self, data: list) -> list: ...

class QuickSort:
    def sort(self, data: list) -> list:
        if len(data) <= 1:
            return data
        pivot = data[len(data) // 2]
        left = [x for x in data if x < pivot]
        middle = [x for x in data if x == pivot]
        right = [x for x in data if x > pivot]
        return self.sort(left) + middle + self.sort(right)

class MergeSort:
    def sort(self, data: list) -> list:
        if len(data) <= 1:
            return data
        mid = len(data) // 2
        left = self.sort(data[:mid])
        right = self.sort(data[mid:])
        return self._merge(left, right)

    def _merge(self, left: list, right: list) -> list:
        result = []
        i = j = 0
        while i < len(left) and j < len(right):
            if left[i] <= right[j]:
                result.append(left[i])
                i += 1
            else:
                result.append(right[j])
                j += 1
        return result + left[i:] + right[j:]

class Sorter:
    def __init__(self, strategy: SortStrategy):
        self._strategy = strategy

    def set_strategy(self, strategy: SortStrategy) -> None:
        self._strategy = strategy

    def sort(self, data: list) -> list:
        return self._strategy.sort(data)
```

### 7. 观察者模式 (Observer Pattern)

**用途：** 定义对象间的一对多依赖关系

**TypeScript 示例：**
```typescript
type EventHandler<T> = (data: T) => void;

class EventEmitter<T> {
  private handlers = new Set<EventHandler<T>>();

  subscribe(handler: EventHandler<T>): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  emit(data: T): void {
    this.handlers.forEach(handler => handler(data));
  }
}

// 使用示例
const events = new EventEmitter<string>();
const unsubscribe = events.subscribe(msg => console.log(msg));
events.emit("Hello!");
unsubscribe();
```

### 8. 命令模式 (Command Pattern)

**用途：** 将请求封装为对象

**TypeScript 示例：**
```typescript
interface Command {
  execute(): void;
  undo(): void;
}

class TextEditor {
  private content = "";

  write(text: string): void {
    this.content += text;
  }

  delete(count: number): string {
    const deleted = this.content.slice(-count);
    this.content = this.content.slice(0, -count);
    return deleted;
  }

  getContent(): string {
    return this.content;
  }
}

class WriteCommand implements Command {
  constructor(
    private editor: TextEditor,
    private text: string
  ) {}

  execute(): void {
    this.editor.write(this.text);
  }

  undo(): void {
    this.editor.delete(this.text.length);
  }
}
```

## 函数式模式

### 9. 不可变数据结构

**原则：** 始终返回新对象，永不修改原对象

**Python 示例：**
```python
from dataclasses import dataclass

@dataclass(frozen=True)
class User:
    name: str
    email: str

def update_email(user: User, new_email: str) -> User:
    return User(name=user.name, email=new_email)
```

**TypeScript 示例：**
```typescript
interface User {
  readonly name: string;
  readonly email: string;
}

function updateEmail(user: User, newEmail: string): User {
  return { ...user, email: newEmail };
}
```

### 10. 函数组合

**用途：** 将多个函数组合成一个

**JavaScript 示例：**
```javascript
const compose = (...fns) => x => fns.reduceRight((v, f) => f(v), x);

const trim = str => str.trim();
const toLower = str => str.toLowerCase();
const split = separator => str => str.split(separator);

const processString = compose(
  split(' '),
  toLower,
  trim
);

processString("  HELLO WORLD  "); // ["hello", "world"]
```

## 依赖注入

### 构造函数注入

**TypeScript 示例：**
```typescript
interface Logger {
  log(message: string): void;
}

interface Database {
  find(id: string): Promise<User>;
}

class UserService {
  constructor(
    private logger: Logger,
    private db: Database
  ) {}

  async getUser(id: string): Promise<User> {
    this.logger.log(`Getting user: ${id}`);
    return this.db.find(id);
  }
}
```

**Python 示例：**
```python
from typing import Protocol

class Logger(Protocol):
    def log(self, message: str) -> None: ...

class Database(Protocol):
    async def find(self, id: str) -> "User": ...

class UserService:
    def __init__(self, logger: Logger, db: Database):
        self._logger = logger
        self._db = db

    async def get_user(self, id: str) -> "User":
        self._logger.log(f"Getting user: {id}")
        return await self._db.find(id)
```

## 错误处理模式

### Result 类型

**TypeScript 示例：**
```typescript
type Result<T, E = Error> =
  | { success: true; value: T }
  | { success: false; error: E };

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return { success: false, error: "Division by zero" };
  }
  return { success: true, value: a / b };
}

const result = divide(10, 2);
if (result.success) {
  console.log(result.value);
} else {
  console.error(result.error);
}
```

**Python 示例：**
```python
from dataclasses import dataclass
from typing import Generic, TypeVar, Union

T = TypeVar("T")
E = TypeVar("E")

@dataclass(frozen=True)
class Success(Generic[T]):
    value: T
    success: bool = True

@dataclass(frozen=True)
class Failure(Generic[E]):
    error: E
    success: bool = False

Result = Union[Success[T], Failure[E]]

def divide(a: float, b: float) -> Result[float, str]:
    if b == 0:
        return Failure("Division by zero")
    return Success(a / b)
```

## 模式选择指南

| 场景 | 推荐模式 |
|------|---------|
| 创建复杂对象 | 建造者模式 |
| 需要灵活创建对象 | 工厂模式 |
| 扩展对象功能 | 装饰器模式 |
| 控制对象访问 | 代理模式 |
| 算法可互换 | 策略模式 |
| 事件处理 | 观察者模式 |
| 操作可撤销 | 命令模式 |
| 依赖解耦 | 依赖注入 |
| 错误处理 | Result 类型 |
