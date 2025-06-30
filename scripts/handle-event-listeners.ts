import type { Handler } from "./handler";

export class HandleEventListeners {
  private abortController: AbortController | null = null;
  private mouseoverHandler: Handler;
  private clickHandler: Handler;

  constructor(handlers: {
    mouseoverHandler: Handler;
    clickHandler: Handler;
  }) {
    this.mouseoverHandler = handlers.mouseoverHandler;
    this.clickHandler = handlers.clickHandler;
  }

  private bindHandler(handler: Handler) {
    return handler.handler.bind(handler);
  }

  addEventListeners() {
    this.abortController = new AbortController();
    document.addEventListener(
      "mouseover",
      this.bindHandler(this.mouseoverHandler),
      this.abortController,
    );
    document.addEventListener(
      "click",
      this.bindHandler(this.clickHandler),
      this.abortController,
    );
  }

  removeEventListeners() {
    this.abortController?.abort();
    this.abortController = null;
  }

  enableEventListeners(enable: boolean) {
    if (enable) {
      this.addEventListeners();
    } else {
      this.removeEventListeners();
    }
  }
}
