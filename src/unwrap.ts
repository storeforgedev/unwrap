import type {
  Resource,
  Operation,
  ResourceKey,
  OperationKey,
  GraphQLResponse,
} from "./types";

/**
 * Unwrap the given operation or resource from the GraphQL response.
 * Throw if there are user errors rather than including them in the data.
 */
export async function unwrap<
  T extends GraphQLResponse,
  O extends OperationKey<T>,
>(response: T, operation: O): Promise<Operation<T, O>>;
export async function unwrap<
  T extends GraphQLResponse,
  O extends OperationKey<T>,
  R extends ResourceKey<T, O>,
>(response: T, operation: O, resource: R): Promise<Resource<T, O, R>>;
export async function unwrap<
  T extends GraphQLResponse,
  O extends OperationKey<T>,
  R extends ResourceKey<T, O>,
>(
  response: T,
  operation: O,
  resource?: R,
): Promise<Operation<T, O> | Resource<T, O, R>> {
  const json = await response.json();

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
    /** @todo Include the actual errors in a readable way */
    throw new Error("User errors returned in shopify response.");
  }

  delete _operation["userErrors"];

  if (!resource) return _operation;

  const _resource = json.data[operation][resource];

  if (!_resource) {
    throw new Error(
      `Resource "${String(resource)}" does not exist in shopify response.`,
    );
  }

  return _resource;
}
