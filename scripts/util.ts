export function assertIsHTMLElement(
  target: unknown,
): asserts target is HTMLElement {
  if (!(target instanceof HTMLElement)) {
    throw new Error("Target is not an HTMLElement");
  }
}
