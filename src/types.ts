import type { ClientResponse } from "@shopify/graphql-client";

/**
 * Fetch response with a generic data type.
 */
export type ResponseWithType<T = any> = Omit<Response, "json"> & {
  json: () => Promise<T>;
};

/**
 * Fetch response with GraphQL shape.
 */
export type GraphQLResponse<TData = any> = ResponseWithType<
  ClientResponse<TData>
>;

/**
 * Given a GraphQL response, extract the data attribute.
 */
export type DataFromGraphQLResponse<T extends GraphQLResponse> = NonNullable<
  Awaited<ReturnType<T["json"]>>["data"]
>;

/**
 * Extract potential operation keys from response.
 */
export type OperationKey<T extends GraphQLResponse> =
  keyof DataFromGraphQLResponse<T>;

/**
 * Extract operation with given key from response.
 */
export type Operation<
  T extends GraphQLResponse,
  O extends OperationKey<T>,
> = Omit<NonNullable<DataFromGraphQLResponse<T>[O]>, "userErrors">;

/**
 * Extract potential resource keys from response.
 */
export type ResourceKey<
  T extends GraphQLResponse,
  O extends OperationKey<T>,
> = keyof Operation<T, O>;

/**
 * Extract resource with given key from response.
 */
export type Resource<
  T extends GraphQLResponse,
  O extends OperationKey<T>,
  R extends ResourceKey<T, O>,
> = NonNullable<Operation<T, O>[R]>;
