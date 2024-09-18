import { it, expect, describe } from "vitest";

import type { ClientResponse } from "./types";

import { unwrap } from "./unwrap";

/**
 * Some API clients, like the Admin API client returned from the @shopify/shopify-app-remix
 * package return fetch responses rather than just the GraphQL response object.
 *
 * These types of responses need to be unwrapped first.
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

  it("throws exception when customer user errors returned in response", async () => {
    await expect(() =>
      unwrap(
        mockFetchResponse(MOCK_RESPONSE_CUSTOMER_USER_ERRORS),
        "customerAccessTokenCreate",
      ),
    ).rejects.toThrowError(
      "Customer user errors returned in shopify response.",
    );
  });
});

/**
 * Some API clients, like the @shopify/storefront-api-client package implicitly unwrap the
 * fetch response and directly return the GraphQL response object.
 *
 * @see https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client
 */
describe("object response", () => {
  it("returns only given operation from data", async () => {
    const unwrapped = await unwrap(
      mockObjectResponse(MOCK_RESPONSE_SUCCESS),
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
      mockObjectResponse(MOCK_RESPONSE_SUCCESS),
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
      unwrap(mockObjectResponse(MOCK_RESPONSE_NO_DATA), "productCreate"),
    ).rejects.toThrowError("No data returned in shopify response.");
  });

  it("throws exception when operation does not exist in response", async () => {
    await expect(() =>
      unwrap(mockObjectResponse(MOCK_RESPONSE_NO_OPERATION), "productCreate"),
    ).rejects.toThrowError(
      `Operation "productCreate" does not exist in shopify response.`,
    );
  });

  it("throws exception when resource does not exist in response", async () => {
    await expect(() =>
      unwrap(
        mockObjectResponse(MOCK_RESPONSE_NO_RESOURCE),
        "productCreate",
        "product",
      ),
    ).rejects.toThrowError(
      `Resource "product" does not exist in shopify response.`,
    );
  });

  it("throws exception when user errors returned in response", async () => {
    await expect(() =>
      unwrap(mockObjectResponse(MOCK_RESPONSE_USER_ERRORS), "productCreate"),
    ).rejects.toThrowError("User errors returned in shopify response.");
  });

  it("throws exception when customer user errors returned in response", async () => {
    await expect(() =>
      unwrap(
        mockObjectResponse(MOCK_RESPONSE_CUSTOMER_USER_ERRORS),
        "customerAccessTokenCreate",
      ),
    ).rejects.toThrowError(
      "Customer user errors returned in shopify response.",
    );
  });
});

/**
 * With the given data, make a mock fetch response.
 * This is how the admin API client returns data to the user.
 */
function mockFetchResponse<T>(data: T) {
  return {
    json: () => Promise.resolve({ data }),
  } as ClientResponse<T>;
}

/**
 * With the given data, make a mock fetch response.
 * This is how the storefront API client returns data to the user.
 */
function mockObjectResponse<T>(data: T) {
  return { data } as ClientResponse<T>;
}

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

type MockCustomerAccessTokenCreate = {
  customerAccessTokenCreate?: {
    customerAccessToken?: { accessToken: string } | null;
    customerUserErrors?: { code?: string; field: string[]; message: string }[];
  } | null;
} | null;

const MOCK_RESPONSE_CUSTOMER_USER_ERRORS: MockCustomerAccessTokenCreate = {
  customerAccessTokenCreate: {
    customerAccessToken: null,
    customerUserErrors: [
      { field: ["password"], message: "Password is incorrect" },
    ],
  },
};
