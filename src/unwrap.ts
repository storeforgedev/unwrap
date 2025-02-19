import type {
  Resource,
  Operation,
  ResourceKey,
  OperationKey,
  GraphQLError,
  ClientResponse,
  DataFromClientResponse,
} from "./types";

import {
  isClientResponseFetch,
  isClientResponseObject,
  isClientResponseMerged,
} from "./types";

import {
  GraphQLErrorsException,
  CoreUserErrorsException,
  CustomerUserErrorsException,
} from "./errors";

/**
 * Unwrap the given operation or resource from the GraphQL response.
 * Throw if there are user errors rather than including them in the data.
 */
export async function unwrap<T extends ClientResponse>(
  response: T,
): Promise<DataFromClientResponse<T>>;
export async function unwrap<
  T extends ClientResponse,
  O extends OperationKey<T>,
>(response: T, operation: O): Promise<Operation<T, O>>;
export async function unwrap<
  T extends ClientResponse,
  O extends OperationKey<T>,
  R extends ResourceKey<T, O>,
>(response: T, operation: O, resource: R): Promise<Resource<T, O, R>>;
export async function unwrap<
  T extends ClientResponse,
  O extends OperationKey<T>,
  R extends ResourceKey<T, O>,
>(
  response: T,
  operation?: O,
  resource?: R,
): Promise<DataFromClientResponse<T> | Operation<T, O> | Resource<T, O, R>> {
  // Resolve data and errors from client response.
  const {
    data,
    errors,
  }: {
    errors?: GraphQLError[] | null | undefined;
    data?: DataFromClientResponse<T> | null | undefined;
  } = await (async () => {
    if (isClientResponseFetch(response)) {
      const { data, errors } = await response.json();
      return { data, errors };
    }

    if (isClientResponseObject(response)) {
      const { data, errors } = response;
      return { data, errors };
    }

    if (isClientResponseMerged(response)) {
      // @ts-expect-error
      const { errors, ...restData } = response ?? {};

      return {
        errors,
        data:
          0 < Object.keys(restData).length
            ? (restData as DataFromClientResponse<T>)
            : null,
      };
    }

    return {};
  })();

  if (errors && 0 < errors.length) {
    throw new GraphQLErrorsException(errors);
  }

  if (!data) {
    throw new Error("No data returned in shopify response.");
  }

  if (!operation) return data;

  const _operation = data[operation];

  if (!_operation) {
    throw new Error(
      `Operation "${String(operation)}" does not exist in shopify response.`,
    );
  }

  // "Customer" user errors are returned by customer mutations like customerAccessTokenCreate.
  if (
    _operation.customerUserErrors &&
    0 < _operation.customerUserErrors.length
  ) {
    throw new CustomerUserErrorsException(_operation.customerUserErrors);
  }

  // User errors are returned by all mutations.
  if (_operation.userErrors && 0 < _operation.userErrors.length) {
    throw new CoreUserErrorsException(_operation.userErrors);
  }

  const { userErrors, customerUserErrors, ...rest } = _operation;

  if (!resource) return rest;

  const _resource = rest[resource];

  if (!_resource) {
    throw new Error(
      `Resource "${String(resource)}" does not exist in shopify response.`,
    );
  }

  return _resource;
}
