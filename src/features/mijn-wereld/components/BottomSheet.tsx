// Sheet that slides up inside the phone screen (320ms, cubic-bezier(.2,.9,.3,1.1)), over the screen's shared Veil.
// Dialog semantics: aria-modal, Escape / Android back closes, focus moves to the first button and back on close.
//
// `covered`: another overlay (the Kate chat) is opening on top of it. The sheet then holds still and takes no
// input, Escape or back; closed while covered, it vanishes at once instead of sliding away behind the chat.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BackHandler, Platform, ScrollView, StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { shadow } from '../theme';
import { useOverlayFocus } from './Overlay';

const EASE = Easing.bezier(0.2, 0.9, 0.3, 1.1);
/** The panel reaches this far below the screen edge, so the opening overshoot never shows a gap under it. */
const SKIRT = 48;

export function BottomSheet({
  open,
  covered = false,
  label,
  onClose,
  children,
}: {
  open: boolean;
  covered?: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const progress = useSharedValue(0);
  const [height, setHeight] = useState(800);
  const sheetRef = useRef<View>(null);
  const { hidden, settle } = useOverlayFocus(open, sheetRef);

  useEffect(() => {
    if (!open && covered) {
      progress.value = 0;
      settle();
      return;
    }
    progress.value = withTiming(
      open ? 1 : 0,
      { duration: open ? 320 : 250, easing: open ? EASE : Easing.out(Easing.quad) },
      (finished) => {
        if (finished && !open) scheduleOnRN(settle);
      },
    );
  }, [open, covered, progress, settle]);

  useEffect(() => {
    if (!open || covered) return;
    if (Platform.OS === 'web') {
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', onKey);
      return () => document.removeEventListener('keydown', onKey);
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [open, covered, onClose]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height * 1.05 }],
  }));

  return (
    <Animated.View
      ref={sheetRef}
      role="dialog"
      aria-modal
      aria-label={label}
      aria-hidden={hidden}
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      style={[styles.sheet, sheetStyle, { pointerEvents: open && !covered ? 'auto' : 'none' }]}>
      <View style={styles.grab} />
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {children}
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: -SKIRT,
    paddingBottom: SKIRT,
    maxHeight: '88%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 10,
    boxShadow: shadow.sheet,
  },
  grab: {
    width: 40,
    height: 5,
    borderRadius: 5,
    backgroundColor: '#d7e0ea',
    alignSelf: 'center',
    marginBottom: 12,
  },
  content: { paddingHorizontal: 20, paddingBottom: 24 },
});
