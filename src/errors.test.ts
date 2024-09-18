import { it, expect } from "vitest";

import { UserErrorsException } from "./errors";

it("returns an array of formatted errors", () => {
  const error = new UserErrorsException([
    { field: ["password"], message: "Password is incorrect." },
  ]);

  expect(error.formattedUserErrors).toEqual([
    {
      code: null,
      field: "password",
      message: "Password is incorrect.",
      userError: { field: ["password"], message: "Password is incorrect." },
    },
  ]);
});

it("return default message when cannot be resolved", () => {
  const error = new UserErrorsException([{ field: ["password"] }]);

  expect(error.formattedUserErrors).toEqual([
    {
      code: null,
      field: "password",
      message: "No message could be resolved.",
      userError: { field: ["password"] },
    },
  ]);
});
