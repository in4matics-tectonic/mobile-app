// What the bottom sheet and the Kate chat share as overlays on the screen:
// - one veil under both, so handing over from a sheet to the chat never makes the background flicker;
// - focus that moves into a panel when it opens and goes back when it closes (web), with aria-hidden applied only
//   once the panel has finished sliding away, so it never lands on an element that still holds focus.

import { useCallback, useEffect, useRef, useState, type RefObject } from 'react';
import { Platform, Pressable, StyleSheet, type View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

const VEIL_ID = 'overlay-veil';

/** The dim layer under the overlays. A tap closes the overlay on top. Its tap target exists only while it's
 *  visible: a focused element that disappears hands focus back to the page instead of hiding it. */
export function Veil({ visible, onPress }: { visible: boolean; onPress: () => void }) {
  const progress = useSharedValue(0);
  useEffect(() => {
    progress.value = withTiming(visible ? 1 : 0, { duration: visible ? 300 : 220, easing: Easing.out(Easing.quad) });
  }, [visible, progress]);
  const style = useAnimatedStyle(() => ({ opacity: progress.value }));
  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.veil, style, { pointerEvents: visible ? 'auto' : 'none' }]}>
      {visible && <Pressable nativeID={VEIL_ID} style={StyleSheet.absoluteFill} onPress={onPress} aria-label="Sluiten" />}
    </Animated.View>
  );
}

/** Where focus goes back to when a panel closes. An overlay opened from inside another one (the chat from a
 *  sheet) inherits that one's target, since the first panel will be gone by then. */
/** A place on the street is an SVG element; buttons are HTML. */
type Focusable = HTMLElement | SVGElement;
const returnTargets = new WeakMap<Element, Focusable | null>();
const isFocusable = (el: Element | null): el is Focusable => el instanceof HTMLElement || el instanceof SVGElement;

/**
 * Focus and visibility for an overlay panel. `hidden` (for aria-hidden) turns true only after `settle()`, which the
 * panel calls when its close animation has finished.
 */
export function useOverlayFocus(open: boolean, panel: RefObject<View | null>) {
  const [settled, setSettled] = useState(true);
  if (open && settled) setSettled(false);
  /** The element that opened the panel, and where to go if that one is gone by then. */
  const returnTo = useRef<{ opener: Focusable | null; fallback: Focusable | null }>({ opener: null, fallback: null });

  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const node = panel.current as unknown as HTMLElement | null;
    if (open) {
      const active = isFocusable(document.activeElement) ? document.activeElement : null;
      const from = active?.closest('[role="dialog"]');
      const fallback = from && from !== node ? (returnTargets.get(from) ?? null) : active;
      returnTo.current = { opener: active, fallback };
      if (node) returnTargets.set(node, fallback);
      // preventScroll: the panel is still below the screen. Without it the browser scrolls the phone's
      // overflow-hidden screen to reveal the button, and the whole view jumps.
      const timer = setTimeout(() => node?.querySelector<HTMLElement>('[role="button"], button')?.focus({ preventScroll: true }), 60);
      return () => clearTimeout(timer);
    }
    // Give focus back if it's still in the panel, on the veil that was tapped, or was dropped with it.
    const active = document.activeElement;
    if (node && isFocusable(active) && (node.contains(active) || active === document.body || active.id === VEIL_ID)) {
      const usable = (el: Focusable | null): el is Focusable => !!el?.isConnected && !el.closest('[aria-hidden="true"]');
      const { opener, fallback } = returnTo.current;
      const back = usable(opener) ? opener : usable(fallback) ? fallback : null;
      if (back) back.focus({ preventScroll: true });
      else if (active !== document.body) active.blur();
    }
  }, [open, panel]);

  const settle = useCallback(() => setSettled(true), []);
  return { hidden: !open && settled, settle };
}

const styles = StyleSheet.create({
  veil: { backgroundColor: 'rgba(8,30,60,.35)' },
});
