import type {
  Resource,
  Operation,
  ResourceKey,
  OperationKey,
  ClientResponse,
  GraphQLResponse,
} from "./types";

import { UserErrorsException } from "./errors";

/**
 * Unwrap the given operation or resource from the GraphQL response.
 * Throw if there are user errors rather than including them in the data.
 */
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
  operation: O,
  resource?: R,
): Promise<Operation<T, O> | Resource<T, O, R>> {
  // If response is a fetch response, unwrap it first.
  const json = (
    "json" in response ? await response.json() : response
  ) as GraphQLResponse;

  if (!json.data) {
    throw new Error("No data returned in shopify response.");
  }

  const _operation = json.data[operation];

  if (!_operation) {
    throw new Error(
      `Operation "${String(operation)}" does not exist in shopify response.`,
    );
  }

  if (_operation.userErrors && 0 < _operation.userErrors.length) {
    throw new UserErrorsException(_operation.userErrors);
  }

  // "Customer" user errors are returned by customer mutations like customerAccessTokenCreate.
  if (
    _operation.customerUserErrors &&
    0 < _operation.customerUserErrors.length
  ) {
    throw new UserErrorsException(_operation.customerUserErrors);
  }

  delete _operation["userErrors"];
  delete _operation["customerUserErrors"];

  if (!resource) return _operation;

  const _resource = json.data[operation][resource];

  if (!_resource) {
    throw new Error(
      `Resource "${String(resource)}" does not exist in shopify response.`,
    );
  }

  return _resource;
}
