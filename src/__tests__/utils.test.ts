import * as utils from "../utils";

test("returns true for html elements", () => {
  const element = document.createElement("div");

  expect(utils.isHTMLElement(element)).toBe(true);
});

test("returns false for non-html elements", () => {
  expect(utils.isHTMLElement(undefined)).toBe(false);
  expect(utils.isHTMLElement(null)).toBe(false);
  expect(utils.isHTMLElement(document)).toBe(false);
  expect(utils.isHTMLElement(window)).toBe(false);
});
