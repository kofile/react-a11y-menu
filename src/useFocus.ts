import { useLayoutEffect, useState } from "react";

interface IFocus {
  reset: () => void;
  first: () => void;
  last: () => void;
  next: () => void;
  prev: () => void;
  nextChar: (char: string) => void;
}

enum Step {
  Unset,
  First,
  Last,
  Next,
  Prev,
  NextChar
}

type StepAction = [Step, string | null];

export function useFocus(menuRef: React.RefObject<HTMLDivElement>): IFocus {
  const [action, setAction] = useState<StepAction>([Step.Unset, null]);

  const reset = () => setAction([Step.Unset, null]);
  const first = () => setAction([Step.First, null]);
  const last = () => setAction([Step.Last, null]);
  const next = () => setAction([Step.Next, null]);
  const prev = () => setAction([Step.Prev, null]);
  const nextChar = (char: string) => setAction([Step.NextChar, char]);

  /**
   * NOTE: Only works for menus one level deep.
   */
  useLayoutEffect(() => {
    if (menuRef.current === null) {
      return;
    }

    const { current } = menuRef;
    const nodeList = current.querySelectorAll('[role="menuitem"]');
    const items = toHTMLElements(nodeList);
    const [step, matchChar] = action;
    const focused = document.activeElement;
    const focusedIndex = items.findIndex(item => item === focused);
    const firstIndex = 0;
    const lastIndex = items.length - 1;
    const unfocused = focusedIndex === -1;

    const focusFirst = () => items[firstIndex].focus();
    const focusLast = () => items[lastIndex].focus();
    const focusNext = () => items[focusedIndex + 1].focus();
    const focusPrev = () => items[focusedIndex - 1].focus();

    const focusNextChar = () => {
      if (matchChar === null) {
        return;
      }

      const remainingItems = items.slice(focusedIndex + 1);

      if (remainingItems.length > 0) {
        const nextMatchIndex = remainingItems.findIndex(startsWith(matchChar));

        if (nextMatchIndex !== -1) {
          return items[focusedIndex + nextMatchIndex + 1].focus();
        }
      }
    };

    if (items.length === 0) {
      return;
    }

    switch (step) {
      case Step.First:
        focusFirst();
        break;
      case Step.Last:
        focusLast();
        break;
      case Step.Next:
        if (unfocused || focusedIndex + 1 > lastIndex) {
          focusFirst();
        } else {
          focusNext();
        }
        break;
      case Step.Prev:
        if (unfocused || focusedIndex - 1 < firstIndex) {
          focusLast();
        } else {
          focusPrev();
        }
        break;
      case Step.NextChar:
        if (!unfocused) {
          focusNextChar();
        }
        break;
    }
  }, [menuRef.current, action]);

  return { reset, first, last, next, prev, nextChar };
}

function toHTMLElements(nodeList: NodeList): HTMLElement[] {
  return [...nodeList].reduce(
    (memo, node) => {
      if (isHTMLElement(node)) {
        return [...memo, node];
      }

      return memo;
    },
    [] as HTMLElement[]
  );
}

function isHTMLElement(maybeElem: any): maybeElem is HTMLElement {
  return "nodeType" in maybeElem && maybeElem.nodeType === Node.ELEMENT_NODE;
}

function startsWith(char: string) {
  return (element: HTMLElement) => {
    const text = element.textContent;

    if (text === null) {
      return false;
    }

    return text.toLowerCase().startsWith(char.toLowerCase());
  };
}
