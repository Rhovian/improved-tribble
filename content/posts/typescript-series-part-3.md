---
title: "Generics and Advanced Patterns"
date: "2026-02-03"
excerpt: "Unlock the full power of TypeScript with generics and advanced type patterns."
tags: ["typescript", "tutorial", "advanced"]
series:
  name: "TypeScript Deep Dive"
  slug: "typescript-deep-dive"
  part: 3
  total: 3
---

# Generics and Advanced Patterns

Generics allow you to write reusable, type-safe code that works with any type.

## Basic Generics

A generic function that works with any type:

```typescript
function identity<T>(value: T): T {
  return value;
}

const num = identity(42);        // type: number
const str = identity("hello");   // type: string
```

## Generic Constraints

Constrain generics to specific shapes:

```typescript
interface HasLength {
  length: number;
}

function logLength<T extends HasLength>(item: T): void {
  console.log(item.length);
}

logLength("hello");     // OK
logLength([1, 2, 3]);   // OK
logLength(42);          // Error: number doesn't have length
```

## Utility Types

TypeScript includes powerful built-in utility types:

```typescript
interface User {
  id: number;
  name: string;
  email: string;
}

// Make all properties optional
type PartialUser = Partial<User>;

// Make all properties required
type RequiredUser = Required<User>;

// Pick specific properties
type UserPreview = Pick<User, "id" | "name">;

// Omit specific properties
type UserWithoutEmail = Omit<User, "email">;
```

## Conditional Types

Types that depend on conditions:

```typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>;  // true
type B = IsString<number>;  // false
```

## Conclusion

You've now learned the core concepts of TypeScript! Keep practicing and exploring the type system to write safer, more maintainable code.
