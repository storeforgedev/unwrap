import { it, expect } from "vitest";

import type { GraphQLResponse } from "./types";

import { unwrap } from "./unwrap";

it("returns only given operation from data", async () => {
  const unwrapped = await unwrap(MOCK_RESPONSE_SUCCESS, "productCreate");

  expect(unwrapped).toEqual({
    product: {
      title: "Cotton T-Shirt",
      id: "gid://shopify/Product/5070746714248",
    },
  });
});

it("returns only given resource from data", async () => {
  const unwrapped = await unwrap(
    MOCK_RESPONSE_SUCCESS,
    "productCreate",
    "product",
  );

  expect(unwrapped).toEqual({
    title: "Cotton T-Shirt",
    id: "gid://shopify/Product/5070746714248",
  });
});

it("throws exception when no data returned in response", async () => {
  await expect(() =>
    unwrap(MOCK_RESPONSE_NO_DATA, "productCreate"),
  ).rejects.toThrowError("No data returned in shopify response.");
});

it("throws exception when operation does not exist in response", async () => {
  await expect(() =>
    unwrap(MOCK_RESPONSE_NO_OPERATION, "productCreate"),
  ).rejects.toThrowError(
    `Operation "productCreate" does not exist in shopify response.`,
  );
});

it("throws exception when resource does not exist in response", async () => {
  await expect(() =>
    unwrap(MOCK_RESPONSE_NO_RESOURCE, "productCreate", "product"),
  ).rejects.toThrowError(
    `Resource "product" does not exist in shopify response.`,
  );
});

it("throws exception when user errors returned in response", async () => {
  await expect(() =>
    unwrap(MOCK_RESPONSE_USER_ERRORS, "productCreate"),
  ).rejects.toThrowError("User errors returned in shopify response.");
});

type MockProductCreate = {
  productCreate?: {
    product?: { id: string; title: string } | null;
    userErrors: { field: string; message: string }[];
  } | null;
} | null;

const MOCK_RESPONSE_SUCCESS = {
  json: () =>
    Promise.resolve({
      data: {
        productCreate: {
          product: {
            title: "Cotton T-Shirt",
            id: "gid://shopify/Product/5070746714248",
          },
          userErrors: [],
        } as MockProductCreate,
      },
    }),
} as GraphQLResponse<MockProductCreate>;

const MOCK_RESPONSE_NO_DATA = {
  json: () =>
    Promise.resolve({
      data: null,
    }),
} as GraphQLResponse<MockProductCreate>;

const MOCK_RESPONSE_USER_ERRORS = {
  json: () =>
    Promise.resolve({
      data: {
        productCreate: {
          product: null,
          userErrors: [{ field: "handle", message: "Handle already exists" }],
        } as MockProductCreate,
      },
    }),
} as GraphQLResponse<MockProductCreate>;

const MOCK_RESPONSE_NO_OPERATION = {
  json: () =>
    Promise.resolve({
      data: {},
    }),
} as GraphQLResponse<MockProductCreate>;

const MOCK_RESPONSE_NO_RESOURCE = {
  json: () =>
    Promise.resolve({
      data: {
        productCreate: {},
      },
    }),
} as GraphQLResponse<MockProductCreate>;
