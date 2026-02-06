---
title: "Getting Started with TypeScript"
date: "2026-02-01"
excerpt: "Learn the basics of TypeScript and why it's become essential for modern web development."
tags: ["typescript", "tutorial"]
series:
  name: "TypeScript Deep Dive"
  slug: "typescript-deep-dive"
  part: 1
  total: 3
---

# Getting Started with TypeScript

![TypeScript Logo](/blog/typescript-logo.svg)

TypeScript has become the standard for building large-scale JavaScript applications. In this series, we'll explore TypeScript from the ground up.

## Why TypeScript?

TypeScript adds static typing to JavaScript, catching errors at compile time rather than runtime:

```typescript
// JavaScript - error at runtime
function greet(name) {
  return "Hello, " + name.toUpperCase();
}
greet(42); // Runtime error!

// TypeScript - error at compile time
function greet(name: string): string {
  return "Hello, " + name.toUpperCase();
}
greet(42); // Compile error: Argument of type 'number' is not assignable
```

## Setting Up

Install TypeScript globally:

```bash
npm install -g typescript
```

Create a `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true
  }
}
```

## Basic Types

TypeScript provides several basic types:

- `string` - text values
- `number` - numeric values
- `boolean` - true/false
- `array` - lists of values
- `object` - key-value pairs

In the next part, we'll dive into interfaces and type aliases.
