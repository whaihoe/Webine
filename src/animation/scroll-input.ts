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

export function normaliseWheelInput(input: VirtualScrollInput, maximum: number) {
  if (!input.event.type.includes("wheel")) {
    return true;
  }

  input.deltaX = normaliseWheelDelta(input.deltaX, maximum);
  input.deltaY = normaliseWheelDelta(input.deltaY, maximum);
  return true;
}
