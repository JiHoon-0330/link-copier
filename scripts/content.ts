import { ChromeStorage } from "./chrome/storage";
import { ActiveTarget } from "./content/active-target";
import { HandleEventListeners } from "./content/handle-event-listeners";
import { ClickHandler, MouseOverHandler } from "./content/handler";
import { Tooltip } from "./content/tooltip";

const activeTarget = ActiveTarget.getInstance();
const mouseOverHandler = new MouseOverHandler(new Tooltip(), activeTarget);
const clickHandler = new ClickHandler(activeTarget);
const handleEventListeners = new HandleEventListeners({
  clickHandler: clickHandler,
  mouseoverHandler: mouseOverHandler,
});

new ChromeStorage(handleEventListeners.enableEventListeners);
