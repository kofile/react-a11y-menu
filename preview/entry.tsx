import * as React from "react";
import { render } from "react-dom";
import { Menu } from "../src/index";

render(
  <Menu id="my-menu">
    {({ menu, control, isOpen, item }) => (
      <>
        <button {...control}>Menu</button>
        {isOpen && (
          <ul {...menu}>
            <li {...item}>Apple</li>
            <li {...item}>Bananas</li>
            <li {...item}>Clementine</li>
            <li {...item}>Avocado</li>
            <li {...item}>Bee Honey</li>
            <li {...item}>Chives</li>
          </ul>
        )}
      </>
    )}
  </Menu>,
  document.getElementById("app")
);
