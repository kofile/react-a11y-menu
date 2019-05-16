import * as React from "react";
import { useFocus } from "./useFocus";
import { isHTMLElement } from "./utils";

interface IChildProps {
  readonly menu: {
    readonly role: "menu";
    readonly "aria-labelledby": string;
  };
  readonly control: {
    readonly id: string;
    readonly onClick: React.MouseEventHandler;
    readonly onKeyDown: React.KeyboardEventHandler;
    readonly "aria-haspopup": boolean;
    readonly "aria-expanded": boolean;
  };
  readonly item: {
    readonly role: "menuitem";
    readonly tabIndex?: number;
    readonly onKeyDown: React.KeyboardEventHandler;
  };
  readonly isOpen: boolean;
}

type ChildFunc = (props: IChildProps) => React.ReactElement;

interface IProps {
  readonly id: string;
  readonly open?: boolean;
  readonly children: ChildFunc;
  readonly className?: string;
}

export const Menu: React.FunctionComponent<IProps> = props => {
  const { id, children, open: willStartOpen = false } = props;

  if (!isChildFunction(children)) {
    throw new Error("children to <Menu /> must be a function!");
  }

  const menuRef = React.useRef(null);
  const [isOpen, setOpen] = React.useState(willStartOpen);
  const [shouldClose, setShouldClose] = React.useState(false);
  const focus = useFocus(menuRef);

  const open = () => {
    setOpen(true);
    focus.first();
    setShouldClose(false);
  };

  const close = () => {
    setOpen(false);
    focus.reset();
    setShouldClose(true);
  };

  React.useLayoutEffect(() => {
    const menuControl = document.getElementById(id);

    if (shouldClose && isHTMLElement(menuControl)) {
      menuControl.focus();
    }
  }, [shouldClose]);

  const toggleOpen = isOpen ? close : open;

  const menuKeyDown: React.KeyboardEventHandler = event => {
    const { key } = event;

    switch (key) {
      case "Enter":
      case " ":
      case "ArrowDown":
        event.preventDefault();
        open();
        focus.first();
        break;

      case "ArrowUp":
        event.preventDefault();
        open();
        focus.last();
        break;
    }
  };

  const itemKeyDown: React.KeyboardEventHandler = event => {
    const { key, keyCode } = event;

    switch (key) {
      case "Escape":
        event.preventDefault();
        close();
        break;
      case "ArrowDown":
        event.preventDefault();
        focus.next();
        break;
      case "ArrowUp":
        event.preventDefault();
        focus.prev();
        break;
      case "Home":
        event.preventDefault();
        focus.first();
        break;
      case "End":
        event.preventDefault();
        focus.last();
        break;
      default:
        if (keyCode >= 65 && keyCode <= 90) {
          event.preventDefault();
          focus.nextChar(key);
        }
    }
  };

  React.useLayoutEffect(() => {
    const clickOutsideToClose: EventListenerOrEventListenerObject = event => {
      const menu = menuRef.current;
      const { target } = event;

      if (isHTMLElement(menu) && isHTMLElement(target)) {
        if (menu.contains(target)) {
          return;
        }

        close();
      }
    };

    window.addEventListener("click", clickOutsideToClose, false);

    return () => {
      window.removeEventListener("click", clickOutsideToClose, false);
    };
  }, []);

  return (
    <div ref={menuRef} className={props.className}>
      {children({
        control: {
          "aria-expanded": isOpen,
          "aria-haspopup": true,
          id,
          onClick: toggleOpen,
          onKeyDown: menuKeyDown
        },
        isOpen,
        item: {
          onKeyDown: itemKeyDown,
          role: "menuitem",
          tabIndex: -1
        },
        menu: {
          "aria-labelledby": id,
          role: "menu"
        }
      })}
    </div>
  );
};

function isChildFunction(maybeFunc: any): maybeFunc is ChildFunc {
  return Function.prototype.isPrototypeOf(maybeFunc);
}
