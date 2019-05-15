import * as React from "react";
import {
  cleanup,
  fireEvent,
  render,
  RenderResult
} from "react-testing-library";
import { Menu } from "..";
import { isHTMLElement } from "../utils";

const keys = {
  downArrow: { key: "ArrowDown", keyCode: 40 },
  end: { key: "End", keyCode: 35 },
  enter: { key: "Enter", keyCode: 13 },
  escape: { key: "Escape", keyCode: 27 },
  f: { key: "F", keyCode: 70 },
  home: { key: "Home", keyCode: 36 },
  space: { key: " ", keyCode: 32 },
  upArrow: { key: "ArrowUp", keyCode: 38 }
};

afterEach(cleanup);

describe("with a valid menu", () => {
  let result: RenderResult;
  let menuControl: HTMLElement;

  beforeEach(() => {
    result = render(
      <>
        <span>content outside menu</span>
        <Menu id="test">
          {({ control, item, menu, isOpen }) => (
            <>
              <button {...control}>Menu</button>
              {isOpen && (
                <ul {...menu}>
                  <li {...item}>One</li>
                  <li {...item}>Two</li>
                  <li {...item}>Five</li>
                  <li {...item}>Eight</li>
                  <li {...item}>Nine</li>
                  <li {...item}>Fifty</li>
                </ul>
              )}
            </>
          )}
        </Menu>
      </>
    );

    menuControl = result.getByText("Menu");

    menuControl.focus();
  });

  describe("mouse navigation", () => {
    test("clicking on control opens menu", () => {
      fireEvent.click(menuControl);

      expect(document.activeElement).toEqual(getFirstItem(result));
    });

    test("clicking on control closes menu if menu was open", () => {
      fireEvent.click(menuControl);
      fireEvent.click(menuControl);

      expect(document.activeElement).toEqual(menuControl);
      expect(() => {
        result.getByRole("menu");
      }).toThrow();
    });

    test("clicking outside of control/menu closes menu if menu was open", () => {
      fireEvent.click(menuControl);

      expect(document.activeElement).toEqual(getFirstItem(result));

      fireEvent.click(result.getByText("content outside menu"));

      expect(() => {
        result.getByRole("menu");
      }).toThrow();
    });
  });

  describe("keyboard navigation", () => {
    test("Enter opens the menu and focuses the first item", () => {
      fireEvent.keyDown(menuControl, keys.enter);

      expect(document.activeElement).toEqual(getFirstItem(result));
    });

    test("Space opens the menu and focuses the first item", () => {
      fireEvent.keyDown(menuControl, keys.space);

      expect(document.activeElement).toEqual(getFirstItem(result));
    });

    test("Down Arrow opens the menu and focuses the first item", () => {
      fireEvent.keyDown(menuControl, keys.downArrow);

      expect(document.activeElement).toEqual(getFirstItem(result));
    });

    test("Up Arrow opens the menu and focuses the last item", () => {
      fireEvent.keyDown(menuControl, keys.upArrow);

      expect(document.activeElement).toEqual(getLastItem(result));
    });

    test("Escape on a menu item closes the menu and refocuses the menu control", () => {
      fireEvent.keyDown(menuControl, keys.enter);
      fireEvent.keyDown(getCurrentActiveItem(), keys.escape);

      expect(document.activeElement).toBe(menuControl);
      expect(() => {
        result.getByRole("menu");
      }).toThrow();
    });

    test("Down arrow moves to next item", () => {
      fireEvent.keyDown(menuControl, keys.enter);
      fireEvent.keyDown(getCurrentActiveItem(), keys.downArrow);

      expect(document.activeElement).toBe(result.getByText("Two"));
    });

    test("Down arrow wraps to the first item if at the end of the item list", () => {
      fireEvent.keyDown(menuControl, keys.upArrow);
      fireEvent.keyDown(getCurrentActiveItem(), keys.downArrow);

      expect(document.activeElement).toBe(getFirstItem(result));
    });

    test("Up arrow wraps to the last item if at the beginning of the item list", () => {
      fireEvent.keyDown(menuControl, keys.enter);
      fireEvent.keyDown(getCurrentActiveItem(), keys.upArrow);

      expect(document.activeElement).toBe(getLastItem(result));
    });

    test("Up arrow moves to the previous item", () => {
      fireEvent.keyDown(menuControl, keys.enter);
      fireEvent.keyDown(getCurrentActiveItem(), keys.upArrow);
      fireEvent.keyDown(getCurrentActiveItem(), keys.upArrow);

      expect(document.activeElement).toBe(result.getByText("Nine"));
    });

    test("Home moves to the first item", () => {
      fireEvent.keyDown(menuControl, keys.enter);
      fireEvent.keyDown(getCurrentActiveItem(), keys.home);

      expect(document.activeElement).toBe(getFirstItem(result));
    });

    test("End moves to the last item", () => {
      fireEvent.keyDown(menuControl, keys.enter);
      fireEvent.keyDown(getCurrentActiveItem(), keys.end);

      expect(document.activeElement).toBe(getLastItem(result));
    });

    test("a-z moves to next item that start with a-z", () => {
      fireEvent.keyDown(menuControl, keys.enter);
      fireEvent.keyDown(getCurrentActiveItem(), keys.f);

      expect(document.activeElement).toBe(result.getByText("Five"));

      fireEvent.keyDown(getCurrentActiveItem(), keys.f);

      expect(document.activeElement).toBe(result.getByText("Fifty"));
    });
  });
});

function getCurrentActiveItem() {
  const element = document.activeElement;

  if (isHTMLElement(element)) {
    return element;
  }

  throw new Error("Nothing currently focused!");
}

function getFirstItem(result: RenderResult) {
  return result.getByText("One");
}

function getLastItem(result: RenderResult) {
  return result.getByText("Fifty");
}
