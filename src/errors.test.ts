import { it, expect } from "vitest";

import { UserErrorsException } from "./errors";

it("returns an array of formatted errors", () => {
  const error = new UserErrorsException([
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
  const error = new UserErrorsException([{ field: ["password"] }]);

  expect(error.formattedUserErrors).toEqual([
    "password: Error does not have a message.",
  ]);
});
