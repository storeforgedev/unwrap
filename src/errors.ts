/**
 * Thrown when user errors are encountered in GraphQL response.
 */
export class UserErrorsException extends Error {
  constructor(readonly userErrors: UserError[]) {
    super("User errors returned in shopify response.");
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
 * Combined type for the various user errors returned by Shopify.
 */
export interface UserError {
  code?: string;
  message?: string;
  field?: string | string[];
}
