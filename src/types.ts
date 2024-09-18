/**
 * GraphQL response object expected for all requests.
 * @see https://github.com/Shopify/shopify-app-js/blob/main/packages/api-clients/graphql-client/src/graphql-client/types.ts#L36
 */
export type GraphQLResponse<TData = any> = {
  data?: TData;
  errors?: {
    message?: string;
    response?: Response;
    graphQLErrors?: any[];
    networkStatusCode?: number;
  };
  headers?: Headers;
  extensions?: Record<string, any>;
};

/**
 * Fetch response with a generic data type.
 */
export type FetchResponseWithType<T = any> = Omit<Response, "json"> & {
  json: () => Promise<T>;
};

/**
 * A client response could be just the GraphQL response object, or it could be a fetch
 * response containing that object, depending on the client.
 */
export type ClientResponse<TData = any> =
  | GraphQLResponse<TData>
  | FetchResponseWithType<GraphQLResponse<TData>>;

/**
 * Given a client response, extract the data attribute.
 */
export type DataFromClientResponse<T extends ClientResponse> =
  T extends FetchResponseWithType<GraphQLResponse>
    ? NonNullable<Awaited<ReturnType<T["json"]>>["data"]>
    : T extends GraphQLResponse
      ? NonNullable<T["data"]>
      : never;

/**
 * Extract potential operation keys from response.
 */
export type OperationKey<T extends ClientResponse> =
  keyof DataFromClientResponse<T>;

/**
 * Extract operation with given key from response.
 */
export type Operation<
  T extends ClientResponse,
  O extends OperationKey<T>,
> = Omit<NonNullable<DataFromClientResponse<T>[O]>, "userErrors">;

/**
 * Extract potential resource keys from response.
 */
export type ResourceKey<
  T extends ClientResponse,
  O extends OperationKey<T>,
> = keyof Operation<T, O>;

/**
 * Extract resource with given key from response.
 */
export type Resource<
  T extends ClientResponse,
  O extends OperationKey<T>,
  R extends ResourceKey<T, O>,
> = NonNullable<Operation<T, O>[R]>;
