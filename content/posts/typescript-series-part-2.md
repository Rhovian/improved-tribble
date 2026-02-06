---
title: "Interfaces and Type Aliases"
date: "2026-02-02"
excerpt: "Master TypeScript interfaces and type aliases for defining complex data structures."
tags: ["typescript", "tutorial"]
series:
  name: "TypeScript Deep Dive"
  slug: "typescript-deep-dive"
  part: 2
  total: 3
---

# Interfaces and Type Aliases

Now that we understand basic types, let's explore how to define complex data structures.

## Interfaces

Interfaces define the shape of an object:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  isActive?: boolean; // Optional property
}

const user: User = {
  id: 1,
  name: "Alice",
  email: "alice@example.com"
};
```

## Type Aliases

Type aliases create custom names for types:

```typescript
type ID = string | number;
type Status = "pending" | "active" | "completed";

interface Task {
  id: ID;
  status: Status;
  title: string;
}
```

## Extending Interfaces

Interfaces can extend other interfaces:

```typescript
interface Person {
  name: string;
  age: number;
}

interface Employee extends Person {
  employeeId: string;
  department: string;
}
```

## When to Use Which?

- Use **interfaces** for object shapes that might be extended
- Use **type aliases** for unions, primitives, and tuples

In the final part, we'll cover generics and advanced patterns.
