import { t } from "@/__i18n__/i18n";
import type { ActiveTarget } from "./active-target";
import { DATA_ATTR } from "./constants";
import { Tooltip } from "./tooltip";
import { assertIsHTMLElement } from "./util";

export interface Handler {
  handler(e: MouseEvent): void;
}

export class ClickHandler implements Handler {
  private activeTarget: ActiveTarget;

  constructor(activeTarget: ActiveTarget) {
    this.activeTarget = activeTarget;
  }

  handler(e: MouseEvent) {
    const target = e.target;
    assertIsHTMLElement(target);

    if (Tooltip.isTooltip(target)) {
      const activeTargetData = this.activeTarget.getData();
      if (!activeTargetData) throw new Error("No active target data");
      target.textContent = t("copied");
      navigator.clipboard.writeText(activeTargetData.targetAnchor.href);
    }
  }
}

export class MouseOverHandler implements Handler {
  private tooltip: Tooltip;
  private activeTarget: ActiveTarget;

  constructor(tooltip: Tooltip, activeTarget: ActiveTarget) {
    this.tooltip = tooltip;
    this.activeTarget = activeTarget;
  }

  private removeTooltip() {
    this.tooltip.remove();
    this.activeTarget.removeData();
  }

  private isSameActiveTarget(targetAnchor: HTMLAnchorElement) {
    const activeTargetData = this.activeTarget.getData();
    if (!activeTargetData) return false;
    return activeTargetData.targetAnchor === targetAnchor;
  }

  private ensureAnchorId(target: HTMLElement) {
    if (target.hasAttribute(DATA_ATTR.ANCHOR_ID)) {
      const anchorId = target.getAttribute(DATA_ATTR.ANCHOR_ID);
      if (!anchorId) {
        throw new Error("Anchor ID is not set");
      }
      return anchorId;
    }

    const newAnchorId = crypto.randomUUID();
    target.setAttribute(DATA_ATTR.ANCHOR_ID, newAnchorId);
    return newAnchorId;
  }

  private getRects(target: HTMLElement) {
    const targetRects = target.getClientRects();
    if (targetRects.length === 1) {
      return Array.from(targetRects);
    }

    const range = document.createRange();
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const rects: DOMRect[] = [];

    while (walker.nextNode()) {
      range.selectNode(walker.currentNode);
      for (const rect of range.getClientRects()) {
        if (rect.width > 0 && rect.height > 0) {
          rects.push(rect);
        }
      }
    }

    if (rects.length === 0) {
      rects.push(target.getBoundingClientRect());
    }

    return rects;
  }

  private findClosestAnchor(target: HTMLElement) {
    return target instanceof HTMLAnchorElement ? target : target.closest("a");
  }

  handler(e: MouseEvent) {
    const target = e.target;
    assertIsHTMLElement(target);

    if (Tooltip.isTooltip(target)) {
      return;
    }

    const targetAnchor = this.findClosestAnchor(target);

    if (!targetAnchor) {
      this.removeTooltip();
      return;
    }

    if (this.isSameActiveTarget(targetAnchor)) {
      return;
    }

    const anchorId = this.ensureAnchorId(targetAnchor);
    const rects = this.getRects(targetAnchor);
    const tooltipPosition = Tooltip.calculatePosition(e, rects);

    if (tooltipPosition) {
      this.removeTooltip();
      const tooltip = this.tooltip.create(tooltipPosition, anchorId);
      document.body.appendChild(tooltip);
      this.activeTarget.setData({
        rects,
        anchorId,
        targetAnchor,
      });
    }
  }
}
