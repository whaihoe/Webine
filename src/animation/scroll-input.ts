type VirtualScrollInput = {
  deltaX: number;
  deltaY: number;
  event: WheelEvent | TouchEvent;
};

export function normaliseWheelDelta(delta: number, maximum: number) {
  if (!Number.isFinite(delta) || !Number.isFinite(maximum) || maximum <= 0) {
    return 0;
  }

  return maximum * Math.tanh(delta / maximum);
}

export function normaliseScrollInput(
  input: VirtualScrollInput,
  maximumWheelDelta: number,
  maximumTouchDelta: number,
) {
  const maximum = input.event.type.includes("wheel")
    ? maximumWheelDelta
    : input.event.type.includes("touch")
      ? maximumTouchDelta
      : 0;

  if (maximum <= 0) {
    return true;
  }

  input.deltaX = normaliseWheelDelta(input.deltaX, maximum);
  input.deltaY = normaliseWheelDelta(input.deltaY, maximum);
  return true;
}
