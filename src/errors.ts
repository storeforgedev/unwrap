/**
 * Thrown when user errors are encountered in GraphQL response.
 */
export class UserErrorsException extends Error {
  constructor(readonly errors: UserError[]) {
    super("User errors returned in shopify response.");
  }

  /**
   * Return an array of formatted errors.
   */
  get formattedUserErrors() {
    return this.errors.map(
      (userError): FormattedUserError => ({
        userError,
        code: userError.code ?? null,
        field: Array.isArray(userError.field)
          ? userError.field.join(".")
          : (userError.field ?? null),
        message: userError.message ?? "No message could be resolved.",
      }),
    );
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

/**
 * User error formatted in a consistent way.
 */
export interface FormattedUserError {
  message: string;
  code: string | null;
  field: string | null;
  userError: UserError;
}
