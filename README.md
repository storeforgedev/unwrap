> Tiny utility for "unwrapping" Shopify GraphQL responses and handling user errors

[![NPM Version](https://img.shields.io/npm/v/%40storeforge%2Funwrap)](https://npmjs.com/@storeforge/unwrap)
![NPM License](https://img.shields.io/npm/l/%40storeforge%2Funwrap)
![NPM Downloads](https://img.shields.io/npm/dm/%40storeforge%2Funwrap)

Shopify GraphQL responses require numerous defensive checks before safely accessing properties. These include checking that the data, operation and resources are defined, and checking that there are no user errors.

<details>

<summary>With these checks in place, your code might look like this (expand)...</summary>

```ts
const response = await admin.graphql(CREATE_PRODUCT_MUTATION);

const json = await response.json();

if (!json.data) {
  throw new Error("No data returned in response.");
}

if (!json.data.productCreate) {
  throw new Error("No operation returned in response.");
}

if (0 < json.data.productCreate.userErrors.length) {
  throw new Error("User errors returned in response.");
}

if (!json.data.productCreate.product) {
  throw new Error("No resource returned in response.");
}

// Phew, we finally have a safe product to use.
const product = json.data.productCreate.product;
```

</details>

With `@storeforge/unwrap`, you can safely unwrap GraphQL responses in a fully type-safe way, with minimal boilerplate.

```ts
import { unwrap } from "@storeforge/unwrap";

const product = await unwrap(
  await admin.graphql(CREATE_PRODUCT_MUTATION),
  "productCreate", // Operation
  "product", // Resource
);

// Guaranteed to exist.
const productTitle = product.title;
```

## Features

- 🪶 Zero dependencies
- 📦 Tiny package size (~7kb)
- ✔️ Works with all Shopify GraphQL clients
- 🧩 TypeScript types inferred from responses
- 🪃 Throws an error if the response contains user errors
- 🪃 Throws an error if any of the expected data is missing

## Install

```
npm install @storeforgedev/unwrap
```

## Usage

To safely unwrap the response, wrap the GraphQL response with the `unwrap` method.

```ts
import { unwrap } from "@storeforge/unwrap";

const product = await unwrap(
  await admin.graphql(CREATE_PRODUCT_MUTATION),
  "productCreate",
  "product",
);
```

If you want to access the entire operation, omit the last parameter. Note that the operation will not contain `userErrors`, since this is implicitly handled for you within the `unwrap` method.

```ts
import { unwrap } from "@storeforge/unwrap";

const productCreate = await unwrap(
  await admin.graphql(CREATE_PRODUCT_MUTATION),
  "productCreate",
);
```

If you want to access the entire data object, omit both parameters. In this format, you need to check for `userErrors` yourself.

```ts
import { unwrap } from "@storeforge/unwrap";

const data = await unwrap(await admin.graphql(CREATE_PRODUCT_MUTATION));
```

## GraphQL errrors

When a GraphQL operation returns GraphQL errors, a `GraphQLErrorsException` error will be thrown.

The message for the error will be set to the message of the first GraphQL error if possible.

```ts
import { unwrap, GraphQLErrorsException } from "@storeforge/unwrap";

try {
  const productCreate = await unwrap(
    await admin.graphql(CREATE_PRODUCT_MUTATION),
    "productCreate",
  );
} catch (e) {
  if (e instanceof GraphQLErrorsException) {
    // You can access the raw GraphQL errors using the errors attribute if needed.
    return { errors: e.errors };
  }

  throw e;
}
```

## User errors

When a GraphQL operation returns `userErrors` or `customerUserErrors`, a `UserErrorsException` error will be thrown. This means you don't need to worry about checking for user errors in your own code, although you should ideally catch them.

If you need to differentiate the error types, a `CoreUserErrorsException` is thrown for `userErrors`, while a `CustomerUserErrorsException` is thrown for `customerUserErrors`. However, they both extend `UserErrorsException` and have the same properties.

```ts
import { unwrap, UserErrorsException } from "@storeforge/unwrap";

try {
  const productCreate = await unwrap(
    await admin.graphql(CREATE_PRODUCT_MUTATION),
    "productCreate",
  );
} catch (e) {
  if (e instanceof UserErrorsException) {
    /**
     * You can access a simple array of error strings using the
     * formattedUserErrors accessor.
     */
    return { errors: e.formattedUserErrors };

    /**
     * Alternatively, you can access the raw user errors, which may
     * have an inconsistent shape depending on the mutation.
     */
    return { errors: e.userErrors };
  }

  throw e;
}
```
