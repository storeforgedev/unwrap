import type { UserError, GraphQLError } from "./types";

/**
 * Exception thrown when a GraphQL error occurs.
 * The exception message will be extracted from the first GraphQL error if possible.
 */
export class GraphQLErrorsException extends Error {
  constructor(readonly errors: GraphQLError[]) {
    const message =
      errors[0]?.message ?? "Shopify returned one or more GraphQL errors.";

    super(message);
  }
}

/**
 * User error exception from which others extend.
 */
export abstract class UserErrorsException extends Error {
  constructor(
    message: string,
    readonly userErrors: UserError[],
  ) {
    super(message);
  }

  /**
   * Return an array of formatted errors.
   */
  get formattedUserErrors(): string[] {
    return this.userErrors.map((userError): string => {
      const field = Array.isArray(userError.field)
        ? userError.field.join(".")
        : (userError.field ?? null);

      return [
        field ? `${field}:` : null,
        userError.message ?? "Error does not have a message.",
        userError.code ? `(${userError.code})` : null,
      ]
        .filter(Boolean)
        .join(" ");
    });
  }
}

/**
 * Thrown when user errors are encountered in GraphQL response.
 */
export class CoreUserErrorsException extends UserErrorsException {
  constructor(userErrors: UserError[]) {
    super("User errors returned in shopify response.", userErrors);
  }
}

/**
 * Thrown when customer user errors are encountered in GraphQL response.
 */
export class CustomerUserErrorsException extends UserErrorsException {
  constructor(userErrors: UserError[]) {
    super("Customer user errors returned in shopify response.", userErrors);
  }
}
