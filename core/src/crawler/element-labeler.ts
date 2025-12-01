import type { Page, ElementHandle } from "playwright";

export interface LabeledElement {
  x: number;
  y: number;
  text: string;
  type: string;
  ariaLabel: string;
}

interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
  width: number;
  height: number;
}

interface ElementMetadata {
  element: Element;
  isInteractive: boolean;
  area: number;
  bounds: Bounds[];
  text: string;
  type: string;
  ariaLabel: string;
}

export class ElementLabeler {
  static async labelElements(
    page: Page,
    elementHandles: ElementHandle<HTMLElement>[],
  ): Promise<LabeledElement[]> {
    return page.evaluate((elementsCount) => {
      const elements = Array.from(document.querySelectorAll("a")).slice(
        0,
        elementsCount,
      );

      const labeler = {
        generateRandomColor(): string {
          const hexDigits = "0123456789ABCDEF";
          let color = "#";
          for (let i = 0; i < 6; i++) {
            color += hexDigits[Math.floor(Math.random() * 16)];
          }
          return color;
        },

        checkIfInteractive(element: Element): boolean {
          const tagName = element.tagName;
          const htmlElement = element as HTMLElement;
          const hasClickHandler = htmlElement.onclick !== null;
          const hasPointerCursor =
            window.getComputedStyle(htmlElement).cursor === "pointer";

          return (
            tagName === "INPUT" ||
            tagName === "TEXTAREA" ||
            tagName === "SELECT" ||
            tagName === "BUTTON" ||
            tagName === "A" ||
            hasClickHandler ||
            hasPointerCursor ||
            tagName === "IFRAME" ||
            tagName === "VIDEO"
          );
        },

        getViewportDimensions() {
          return {
            width: Math.max(
              document.documentElement.clientWidth || 0,
              window.innerWidth || 0,
            ),
            height: Math.max(
              document.documentElement.clientHeight || 0,
              window.innerHeight || 0,
            ),
          };
        },

        isElementVisibleAtCenter(
          element: Element,
          centerX: number,
          centerY: number,
        ): boolean {
          const elementAtCenter = document.elementFromPoint(centerX, centerY);
          return (
            elementAtCenter === element || element.contains(elementAtCenter)
          );
        },

        constrainBoundsToViewport(
          boundingRect: DOMRect,
          viewportWidth: number,
          viewportHeight: number,
        ) {
          const constrainedBounds = {
            left: Math.max(0, boundingRect.left),
            top: Math.max(0, boundingRect.top),
            right: Math.min(viewportWidth, boundingRect.right),
            bottom: Math.min(viewportHeight, boundingRect.bottom),
          };

          return {
            ...constrainedBounds,
            width: constrainedBounds.right - constrainedBounds.left,
            height: constrainedBounds.bottom - constrainedBounds.top,
          };
        },

        calculateVisibleBounds(element: Element) {
          const viewport = this.getViewportDimensions();

          return [...element.getClientRects()]
            .filter((rect) => {
              const centerX = rect.left + rect.width / 2;
              const centerY = rect.top + rect.height / 2;
              return this.isElementVisibleAtCenter(element, centerX, centerY);
            })
            .map((rect) =>
              this.constrainBoundsToViewport(
                rect,
                viewport.width,
                viewport.height,
              ),
            );
        },

        calculateTotalArea(bounds: Bounds[]) {
          return bounds.reduce(
            (total, bound) => total + bound.width * bound.height,
            0,
          );
        },

        extractElementMetadata(element: Element) {
          const textContent = (element.textContent || "")
            .trim()
            .replace(/\s{2,}/g, " ");
          const tagName = element.tagName.toLowerCase();
          const ariaLabel = element.getAttribute("aria-label") || "";

          const visibleBounds = this.calculateVisibleBounds(element);
          const totalArea = this.calculateTotalArea(visibleBounds);

          return {
            element,
            isInteractive: this.checkIfInteractive(element),
            area: totalArea,
            bounds: visibleBounds,
            text: textContent,
            type: tagName,
            ariaLabel,
          };
        },

        filterByInteractivityAndSize(elements: ElementMetadata[]) {
          const minAreaThreshold = 20;
          return elements.filter(
            (el) => el.isInteractive && el.area >= minAreaThreshold,
          );
        },

        removeNestedElements(elements: ElementMetadata[]) {
          return elements.filter(
            (current) =>
              !elements.some(
                (other) =>
                  current.element.contains(other.element) && current !== other,
              ),
          );
        },

        createLabelOverlay(
          bounds: Bounds,
          labelText: string,
          color: string,
        ): HTMLElement {
          const overlay = document.createElement("div");
          overlay.style.outline = `2px dashed ${color}`;
          overlay.style.position = "fixed";
          overlay.style.left = `${bounds.left}px`;
          overlay.style.top = `${bounds.top}px`;
          overlay.style.width = `${bounds.width}px`;
          overlay.style.height = `${bounds.height}px`;
          overlay.style.pointerEvents = "none";
          overlay.style.boxSizing = "border-box";
          overlay.style.zIndex = "2147483647";

          const badge = document.createElement("span");
          badge.textContent = labelText;
          badge.style.position = "absolute";
          badge.style.top = "-19px";
          badge.style.left = "0px";
          badge.style.background = color;
          badge.style.color = "white";
          badge.style.padding = "2px 4px";
          badge.style.fontSize = "12px";
          badge.style.borderRadius = "2px";
          overlay.appendChild(badge);

          return overlay;
        },

        markElements(elements: Element[]) {
          const processedElements = elements.map((el) =>
            this.extractElementMetadata(el),
          );

          let interactiveElements =
            this.filterByInteractivityAndSize(processedElements);
          interactiveElements = this.removeNestedElements(interactiveElements);

          interactiveElements.forEach((element, index) => {
            element.bounds.forEach((bounds: Bounds) => {
              const color = this.generateRandomColor();
              const overlay = this.createLabelOverlay(
                bounds,
                index.toString(),
                color,
              );
              document.body.appendChild(overlay);
            });
          });

          return interactiveElements.flatMap((element) =>
            element.bounds.map((bounds: Bounds) => ({
              x: (bounds.left + bounds.right) / 2,
              y: (bounds.top + bounds.bottom) / 2,
              type: element.type,
              text: element.text,
              ariaLabel: element.ariaLabel,
            })),
          );
        },
      };

      return labeler.markElements(elements);
    }, elementHandles.length);
  }
}
