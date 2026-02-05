/** Light haptic feedback for touch - premium app feel */
export function hapticLight() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate(10);
  }
}

/** Medium haptic for important actions (add to cart, place order) */
export function hapticMedium() {
  if (typeof navigator !== 'undefined' && navigator.vibrate) {
    navigator.vibrate([15, 8, 15]);
  }
}
