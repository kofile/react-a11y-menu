# react-a11y-menu

[![npm status](https://flat.badgen.net/npm/v/react-a11y-menu)](https://www.npmjs.com/package/react-a11y-menu)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square)](https://github.com/semantic-release/semantic-release)
[![ci status](https://flat.badgen.net/travis/neezer/react-a11y-menu)](https://travis-ci.org/neezer/react-a11y-menu)

An zero-dependency, accessible React menu component.

Basically a React port of https://www.w3.org/TR/wai-aria-practices/examples/menu-button/menu-button-actions.html

NOTE: v4 is a breaking change from v3.

## Requires

- React ^16.8 (the one with hooks)

## Usage

```jsx
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
</Menu>
```

- The `id` prop on `Menu` is required.
- You must spread `control` on your the element you want to interact with to open and close your menu.
- Control menu hiding/displaying with the `isOpen` boolean.
- You must spread `menu` on the element that contains your `menuitems`.
- You must spread `item` on each `menuitem` in your `menu`.

NOTE: Exported code is ES6.

## Behavior

| Element with Focus | Key / Mouse Action | Result                                                                                         |
| ------------------ | ------------------ | ---------------------------------------------------------------------------------------------- |
| Menu Control       | Click              | If menu is closed, open the menu & focus the first menu item. If menu is open, close the menu. |
| DOM outside menu   | Click              | Close the menu.                                                                                |
| Menu Control       | <kbd>Enter</kbd>   | Open the menu & focus the first menu item                                                      |
| Menu Control       | <kbd>Space</kbd>   | Open the menu & focus the first menu item                                                      |
| Menu Control       | <kbd>↓</kbd>       | Open the menu & focus the first menu item                                                      |
| Menu Control       | <kbd>↑</kbd>       | Open the menu & focus the last menu item                                                       |
| Menu Item          | <kbd>Escape</kbd>  | Close the menu & focus the Menu Control                                                        |
| Menu Item          | <kbd>↓</kbd>       | Focus the next menu item; if at the end, focus the first menu item                             |
| Menu Item          | <kbd>↑</kbd>       | Focus the previous menu item; if at the beginning, focus the last menu item                    |
| Menu Item          | <kbd>Home</kbd>    | Focus the first menu item                                                                      |
| Menu Item          | <kbd>End</kbd>     | Focus the last menu item                                                                       |
| Menu Item          | <kbd>a-z</kbd>     | Focus the next menu item that begins with the letter; if none exist, do nothing                |

## Author

[neezer](https://github.com/neezer)

## Publishing

Publishing of this package is not automated. To publish, make sure you have a valid `NPM_TOKEN` and `GITHUB_TOKEN` set, set `CI=true`, and run `npm run release`. All changes must be published to the remote GitHub repository before running the publish script.

**IMPORTANT**: The release script will automatically tag the newer version on NPM and GitHub _**and**_ make local changes to both `package.json` and `package-lock.json`. _**DO NOT COMMIT THESE CHANGES**_. If we had CI running this properly, these changes would be ignored automatically.
