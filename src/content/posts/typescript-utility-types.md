---
title: "[테스트 글] TypeScript 유틸리티 타입 완벽 가이드"
description: "TypeScript의 내장 유틸리티 타입들을 실제 예제와 함께 알아봅니다. Partial, Required, Pick, Omit 등 자주 사용하는 타입들을 마스터하세요."
date: 2024-01-15
tags: ["typescript", "javascript", "타입시스템"]
draft: false
---

TypeScript를 사용하다 보면 기존 타입을 변형해서 새로운 타입을 만들어야 할 때가 많습니다. 이럴 때 유틸리티 타입을 활용하면 코드 중복을 줄이고 타입 안전성을 높일 수 있습니다.

## 기본 타입 정의

먼저 예제에서 사용할 기본 타입을 정의하겠습니다.

```typescript
interface User {
  id: number;
  name: string;
  email: string;
  age: number;
  createdAt: Date;
}
```

## Partial\<T\>

모든 프로퍼티를 선택적으로 만듭니다. 업데이트 함수에서 유용합니다.

```typescript
type PartialUser = Partial<User>;

// 결과:
// {
//   id?: number;
//   name?: string;
//   email?: string;
//   age?: number;
//   createdAt?: Date;
// }

function updateUser(id: number, updates: Partial<User>) {
  // 일부 필드만 업데이트 가능
}

updateUser(1, { name: '홍길동' }); // OK
updateUser(1, { age: 25, email: 'new@email.com' }); // OK
```

## Required\<T\>

`Partial`의 반대입니다. 모든 프로퍼티를 필수로 만듭니다.

```typescript
interface Config {
  host?: string;
  port?: number;
  secure?: boolean;
}

type RequiredConfig = Required<Config>;

// 모든 필드가 필수가 됨
const config: RequiredConfig = {
  host: 'localhost',
  port: 3000,
  secure: true,
};
```

## Pick\<T, K\>

특정 프로퍼티만 선택합니다. API 응답에서 필요한 필드만 추출할 때 유용합니다.

```typescript
type UserPreview = Pick<User, 'id' | 'name'>;

// 결과:
// {
//   id: number;
//   name: string;
// }

function getUserPreview(user: User): UserPreview {
  return {
    id: user.id,
    name: user.name,
  };
}
```

## Omit\<T, K\>

`Pick`의 반대입니다. 특정 프로퍼티를 제외합니다.

```typescript
type UserWithoutId = Omit<User, 'id' | 'createdAt'>;

// 결과:
// {
//   name: string;
//   email: string;
//   age: number;
// }

// 새 사용자 생성 시 id와 createdAt은 서버에서 생성
function createUser(data: UserWithoutId): User {
  return {
    ...data,
    id: generateId(),
    createdAt: new Date(),
  };
}
```

## Record\<K, T\>

키 타입과 값 타입을 지정하여 객체 타입을 만듭니다.

```typescript
type UserRole = 'admin' | 'user' | 'guest';

const rolePermissions: Record<UserRole, string[]> = {
  admin: ['read', 'write', 'delete'],
  user: ['read', 'write'],
  guest: ['read'],
};

// 인덱스 시그니처 대신 사용
type UserMap = Record<string, User>;
```

## Readonly\<T\>

모든 프로퍼티를 읽기 전용으로 만듭니다.

```typescript
const frozenUser: Readonly<User> = {
  id: 1,
  name: '홍길동',
  email: 'hong@example.com',
  age: 30,
  createdAt: new Date(),
};

frozenUser.name = '김철수'; // 컴파일 에러!
```

## 실전 활용 예제

여러 유틸리티 타입을 조합하여 사용하는 실전 예제입니다.

```typescript
// API 응답 타입
interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 사용자 생성 요청 타입 (id, createdAt 제외)
type CreateUserRequest = Omit<User, 'id' | 'createdAt'>;

// 사용자 업데이트 요청 타입 (모든 필드 선택적, id 제외)
type UpdateUserRequest = Partial<Omit<User, 'id' | 'createdAt'>>;

// 사용자 목록 응답 타입 (일부 필드만)
type UserListItem = Pick<User, 'id' | 'name' | 'email'>;
type UserListResponse = ApiResponse<UserListItem[]>;

// 실제 사용
async function fetchUsers(): Promise<UserListResponse> {
  const response = await fetch('/api/users');
  return response.json();
}
```

## 마무리

유틸리티 타입은 TypeScript의 강력한 기능 중 하나입니다. 적절히 활용하면:

- 코드 중복 감소
- 타입 안전성 향상
- 유지보수성 개선

다음 포스트에서는 조건부 타입과 `infer` 키워드에 대해 알아보겠습니다.

## 참고 자료

- [TypeScript 공식 문서 - Utility Types](https://www.typescriptlang.org/docs/handbook/utility-types.html)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)
