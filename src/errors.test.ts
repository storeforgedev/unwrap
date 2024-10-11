import { it, expect } from "vitest";

import { CoreUserErrorsException, CustomerUserErrorsException } from "./errors";

it("returns an array of formatted errors", () => {
  const error = new CoreUserErrorsException([
    {
      field: ["email"],
      code: "UNIDENTIFIED_CUSTOMER",
      message: "Unidentified customer.",
    },
  ]);

  expect(error.formattedUserErrors).toEqual([
    "email: Unidentified customer. (UNIDENTIFIED_CUSTOMER)",
  ]);
});

it("return default message when cannot be resolved", () => {
  const error = new CoreUserErrorsException([{ field: ["password"] }]);

  expect(error.formattedUserErrors).toEqual([
    "password: Error does not have a message.",
  ]);
});

it("sets message for user errors exception", () => {
  const error = new CoreUserErrorsException([{ field: ["password"] }]);
  expect(error.message).toBe("User errors returned in shopify response.");
});

it("sets message for customer user errors exception", () => {
  const error = new CustomerUserErrorsException([{ field: ["password"] }]);
  expect(error.message).toBe(
    "Customer user errors returned in shopify response.",
  );
});
