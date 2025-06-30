import { ActiveTarget } from "./active-target";
import { ChromeStorage } from "./chrome/storage";
import { HandleEventListeners } from "./handle-event-listeners";
import { ClickHandler, MouseOverHandler } from "./handler";
import { Tooltip } from "./tooltip";

const activeTarget = ActiveTarget.getInstance();
const mouseOverHandler = new MouseOverHandler(new Tooltip(), activeTarget);
const clickHandler = new ClickHandler(activeTarget);
const handleEventListeners = new HandleEventListeners({
  clickHandler: clickHandler,
  mouseoverHandler: mouseOverHandler,
});

new ChromeStorage(handleEventListeners);
