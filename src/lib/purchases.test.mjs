import { expect, test } from "bun:test";
import { PURCHASES_ENABLED } from "./purchases";

test("purchases are enabled with the built-in payments provider", () => {
  expect(PURCHASES_ENABLED).toBe(true);
});
