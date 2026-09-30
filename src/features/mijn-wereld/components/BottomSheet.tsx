// Sheet that slides up inside the phone screen (320ms, cubic-bezier(.2,.9,.3,1.1)).
// Dialog semantics: aria-modal, Escape / Android back closes, focus moves to the first button.

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { BackHandler, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { shadow } from '../theme';

const EASE = Easing.bezier(0.2, 0.9, 0.3, 1.1);

export function BottomSheet({
  open,
  label,
  onClose,
  children,
}: {
  open: boolean;
  label: string;
  onClose: () => void;
  children: ReactNode;
}) {
  const progress = useSharedValue(0);
  const [height, setHeight] = useState(800);
  const sheetRef = useRef<View>(null);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: open ? 320 : 250, easing: open ? EASE : Easing.out(Easing.quad) });
  }, [open, progress]);

  useEffect(() => {
    if (!open) return;
    if (Platform.OS === 'web') {
      const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
      document.addEventListener('keydown', onKey);
      const focusTimer = setTimeout(() => {
        const node = sheetRef.current as unknown as HTMLElement | null;
        node?.querySelector<HTMLElement>('[role="button"], button')?.focus();
      }, 60);
      return () => {
        document.removeEventListener('keydown', onKey);
        clearTimeout(focusTimer);
      };
    }
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      onClose();
      return true;
    });
    return () => sub.remove();
  }, [open, onClose]);

  const veilStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height * 1.05 }],
  }));

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents={open ? 'auto' : 'none'} aria-hidden={!open}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.veil, veilStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} aria-label="Sluiten" />
      </Animated.View>
      <Animated.View
        ref={sheetRef}
        role="dialog"
        aria-modal
        aria-label={label}
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        style={[styles.sheet, sheetStyle]}>
        <View style={styles.grab} />
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  veil: { backgroundColor: 'rgba(8,30,60,.35)' },
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
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
