export function calcOffset(element) {
  let totalOffsetX = 0;
  let totalOffsetY = 0;
  let currentElement = element;
  do {
    totalOffsetX += currentElement.offsetLeft - currentElement.scrollLeft;
    totalOffsetY += currentElement.offsetTop - currentElement.scrollTop;
    currentElement = currentElement.offsetParent;
  } while (currentElement);
  return {
    x: totalOffsetX,
    y: totalOffsetY
  };
}
