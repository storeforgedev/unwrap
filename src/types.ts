/**
 * Fetch response with a generic data type.
 */
export type ResponseWithType<T = any> = Omit<Response, "json"> & {
  json: () => Promise<T>;
};

/**
 * Fetch response with GraphQL shape.
 * @see https://github.com/Shopify/shopify-app-js/blob/main/packages/api-clients/graphql-client/src/graphql-client/types.ts#L36
 */
export type GraphQLResponse<TData = any> = ResponseWithType<{
  data?: TData;
  errors?: {
    message?: string;
    response?: Response;
    graphQLErrors?: any[];
    networkStatusCode?: number;
  };
  headers?: Headers;
  extensions?: Record<string, any>;
}>;

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
