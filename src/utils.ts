export function isHTMLElement(maybeElem: any): maybeElem is HTMLElement {
  return (
    !!maybeElem &&
    "nodeType" in maybeElem &&
    maybeElem.nodeType === Node.ELEMENT_NODE
  );
}
