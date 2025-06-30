import { CLASS_NAME, DATA_ATTR } from "./constants";

abstract class TooltipChild {
  abstract create(): HTMLElement;
}

export class TooltipButton extends TooltipChild {
  create(): HTMLElement {
    const button = document.createElement("button");
    button.classList.add(CLASS_NAME.TOOLTIP_BUTTON);
    button.textContent = "Copy Link!";
    return button;
  }
}

interface TooltipPosition {
  top: number;
  left: number;
  bottom: number;
  mouseTopGap: number;
}

export class Tooltip {
  private tooltipChild: TooltipChild;

  static isTooltip(target: HTMLElement): target is HTMLDivElement {
    return (
      target.classList.contains(CLASS_NAME.TOOLTIP) ||
      !!target.closest(`.${CLASS_NAME.TOOLTIP}`)
    );
  }

  static calculatePosition(
    e: MouseEvent,
    rects: DOMRect[],
  ): TooltipPosition | null {
    if (rects.length === 1) {
      const rect = rects[0];
      const checkX = rect.left <= e.clientX && rect.right >= e.clientX;
      const checkY = rect.top <= e.clientY && rect.bottom >= e.clientY;
      if (checkX && checkY) {
        return {
          top: rect.top,
          left: e.clientX,
          bottom: rect.bottom,
          mouseTopGap: rect.top - e.clientY,
        };
      }
    }

    const positions: TooltipPosition[] = [];
    for (const rect of rects) {
      const checkX = rect.left <= e.clientX && rect.right >= e.clientX;
      if (checkX) {
        positions.push({
          mouseTopGap: rect.top - e.clientY,
          top: rect.top,
          bottom: rect.bottom,
          left: e.clientX,
        });
      }
    }

    if (!positions.length) {
      return null;
    }

    return positions.sort(
      (a, b) => Math.abs(a.mouseTopGap) - Math.abs(b.mouseTopGap),
    )[0];
  }

  constructor(tooltipChild: TooltipChild = new TooltipButton()) {
    this.tooltipChild = tooltipChild;
  }

  create(tooltipPosition: TooltipPosition, anchorId: string) {
    const { top, left, bottom } = tooltipPosition;
    const tooltip = document.createElement("div");
    tooltip.setAttribute(DATA_ATTR.TOOLTIP_ID, anchorId);
    tooltip.classList.add(CLASS_NAME.TOOLTIP);
    if (top < 40) {
      tooltip.classList.add(CLASS_NAME.TOOLTIP_BOTTOM);
      tooltip.style.top = `${bottom}px`;
    } else {
      tooltip.style.top = `${top}px`;
    }
    tooltip.style.left = `${left}px`;
    const child = this.tooltipChild.create();
    tooltip.appendChild(child);
    return tooltip;
  }

  remove() {
    const tooltip = document.querySelector(`.${CLASS_NAME.TOOLTIP}`);
    if (tooltip) {
      tooltip.remove();
    }
  }
}
