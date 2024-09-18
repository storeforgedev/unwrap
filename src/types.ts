/**
 * GraphQL response object expected for all requests.
 * @see https://github.com/Shopify/shopify-app-js/blob/main/packages/api-clients/graphql-client/src/graphql-client/types.ts#L36
 */
export type GraphQLResponse<TData = any> = {
  data?: TData;
  errors?: unknown;
  headers?: Headers;
  extensions?: Record<string, any>;
};

/**
 * Some API clients, like the Admin API client returned from the @shopify/shopify-app-remix
 * package return fetch responses rather than just the GraphQL response object.
 *
 * These types of responses need to be unwrapped first.
 *
 * @see https://shopify.dev/docs/api/shopify-app-remix/v3/guide-admin#graphql-api
 */
export type ClientResponseFetch<TData = any> = Omit<Response, "json"> & {
  json: () => Promise<GraphQLResponse<TData>>;
};

/**
 * Return true if the client response is a ClientResponseFetch.
 */
export function isClientResponseFetch(
  clientResponse: ClientResponse,
): clientResponse is ClientResponseFetch {
  return "json" in clientResponse;
}

/**
 * Some API clients, like the @shopify/storefront-api-client package implicitly unwrap the
 * fetch response and directly return the GraphQL response object.
 *
 * @see https://github.com/Shopify/shopify-app-js/tree/main/packages/api-clients/storefront-api-client
 */
export type ClientResponseObject<TData = any> = GraphQLResponse<TData>;

/**
 * Return true if the client response is a ClientResponseObject.
 */
export function isClientResponseObject(
  clientResponse: ClientResponse,
): clientResponse is ClientResponseObject {
  return "data" in clientResponse;
}

/**
 * Some API clients, like the Storefront client packaged with Hydrogen, return the data attribute
 * from the GraphQL response, merged with the errors object.
 *
 * @see https://shopify.dev/docs/storefronts/headless/hydrogen/data-fetching
 */
export type ClientResponseMerged<TData = any> = GraphQLResponse<TData>["data"] &
  Pick<GraphQLResponse<TData>, "errors">;

/**
 * Return true if the client response is a ClientResponseMerged.
 */
export function isClientResponseMerged(
  clientResponse: ClientResponse,
): clientResponse is ClientResponseMerged {
  return (
    !("data" in clientResponse) &&
    !("json" in clientResponse) &&
    // Has at least one key which is not "errors".
    0 < Object.keys(clientResponse).filter((key) => "errors" !== key).length
  );
}

/**
 * Shopify API clients return a variety of responses.
 */
export type ClientResponse<TData = any> =
  | ClientResponseFetch<TData>
  | ClientResponseObject<TData>
  | ClientResponseMerged<TData>;

/**
 * Return true if the given object has the given key.
 */
type HasKey<T, K extends PropertyKey> = K extends keyof T ? true : false;

/**
 * Given a client response, extract the data attribute.
 */
export type DataFromClientResponse<T extends ClientResponse> =
  HasKey<T, "json"> extends true
    ? T extends ClientResponseFetch
      ? NonNullable<Awaited<ReturnType<T["json"]>>["data"]>
      : never
    : HasKey<T, "data"> extends true
      ? T extends ClientResponseObject
        ? NonNullable<T["data"]>
        : never
      : T extends ClientResponseMerged
        ? Omit<T, "errors">
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
