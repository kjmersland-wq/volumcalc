import { expect, test } from "bun:test";
import { PURCHASES_ENABLED } from "./purchases";

test("purchases remain disabled after payment provider removal", () => {
  expect(PURCHASES_ENABLED).toBe(false);
});