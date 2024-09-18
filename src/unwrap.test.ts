import { it, expect, describe } from "vitest";

import type { GraphQLResponse } from "./types";

import { unwrap } from "./unwrap";

/**
 * Some API clients, like the Admin API client returned from the @shopify/shopify-app-remix
 * package return fetch responses rather than just the data.
 *
 * These types of responses need to be unwrapped in a different way to other clients which
 * return just the data object.
 *
 * @see https://shopify.dev/docs/api/shopify-app-remix/v3/guide-admin#graphql-api
 */
describe("fetch response", () => {
  it("returns only given operation from data", async () => {
    const unwrapped = await unwrap(
      mockFetchResponse(MOCK_RESPONSE_SUCCESS),
      "productCreate",
    );

    expect(unwrapped).toEqual({
      product: {
        title: "Cotton T-Shirt",
        id: "gid://shopify/Product/5070746714248",
      },
    });
  });

  it("returns only given resource from data", async () => {
    const unwrapped = await unwrap(
      mockFetchResponse(MOCK_RESPONSE_SUCCESS),
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
      unwrap(mockFetchResponse(MOCK_RESPONSE_NO_DATA), "productCreate"),
    ).rejects.toThrowError("No data returned in shopify response.");
  });

  it("throws exception when operation does not exist in response", async () => {
    await expect(() =>
      unwrap(mockFetchResponse(MOCK_RESPONSE_NO_OPERATION), "productCreate"),
    ).rejects.toThrowError(
      `Operation "productCreate" does not exist in shopify response.`,
    );
  });

  it("throws exception when resource does not exist in response", async () => {
    await expect(() =>
      unwrap(
        mockFetchResponse(MOCK_RESPONSE_NO_RESOURCE),
        "productCreate",
        "product",
      ),
    ).rejects.toThrowError(
      `Resource "product" does not exist in shopify response.`,
    );
  });

  it("throws exception when user errors returned in response", async () => {
    await expect(() =>
      unwrap(mockFetchResponse(MOCK_RESPONSE_USER_ERRORS), "productCreate"),
    ).rejects.toThrowError("User errors returned in shopify response.");
  });
});

/**
 * With the given data, make a mock fetch response.
 * This is how the admin API client returns data to the user.
 */
function mockFetchResponse<T>(data: T): GraphQLResponse<T> {
  return {
    json: () => Promise.resolve({ data }),
  } as GraphQLResponse<T>;
}

/**
 * Response type for the productCreate mutation.
 */
type MockProductCreate = {
  productCreate?: {
    product?: { id: string; title: string } | null;
    userErrors?: { field: string; message: string }[];
  } | null;
} | null;

const MOCK_RESPONSE_SUCCESS: MockProductCreate = {
  productCreate: {
    product: {
      title: "Cotton T-Shirt",
      id: "gid://shopify/Product/5070746714248",
    },
    userErrors: [],
  },
};

const MOCK_RESPONSE_NO_DATA: MockProductCreate = null;

const MOCK_RESPONSE_USER_ERRORS: MockProductCreate = {
  productCreate: {
    product: null,
    userErrors: [{ field: "handle", message: "Handle already exists" }],
  },
};

const MOCK_RESPONSE_NO_OPERATION: MockProductCreate = {};

const MOCK_RESPONSE_NO_RESOURCE: MockProductCreate = {
  productCreate: {},
};
