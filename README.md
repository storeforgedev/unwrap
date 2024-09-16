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
  "product", // Optional resource
);

// Guaranteed to exist.
const productTitle = product.title;
```

## Features

- Zero dependencies
- Tiny package size (~7kb)
- TypeScript types inferred from responses
- Compatible with [@shopify/api-codegen-preset](https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/api-codegen-preset)
- Throws an error if the response contains user errors
- Throws an error if any of the expected data is missing

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

If you want to access the entire operation, omit the last parameter. Note that the operation will not contain `userErrors`, since this is implicitely handled for you within the `unwrap` method.

```ts
import { unwrap } from "@storeforge/unwrap";

const productCreate = await unwrap(
  await admin.graphql(CREATE_PRODUCT_MUTATION),
  "productCreate",
);

const product = productCreate.product;
```
