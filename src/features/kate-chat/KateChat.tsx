// Kate's chat as a panel that slides up over the whole phone screen, with the chat page inside a WebView (an
// iframe on web, see ChatView). It sits on the screen's shared Veil (mijn-wereld/components/Overlay). Opened from
// the Kate bar, the finding cards and the place sheets; closed with the ✕, a tap on the veil, Escape (web) or the
// Android back button. The view is created once and then kept, so the conversation survives closing the panel.
//
// Opened from a sheet, the panel rises over that sheet; `onOpened` tells the screen when it fully covers it, so the
// sheet can close unseen.
//
// Opener (D16): when the chat opens from a finding, Kate starts with that finding. If the view is created by that
// open, it travels in the URL (?opener=…&finding=…); otherwise as a { type: 'kate:opener' } message. The same opener
// twice while the chat is open (a double tap) is said once. A chat page that doesn't know openers opens plain.

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { scheduleOnRN } from 'react-native-worklets';

import { useOverlayFocus } from '@/features/mijn-wereld/components/Overlay';
import { font, shadow, world } from '@/features/mijn-wereld/theme';

import { ChatView } from './ChatView';
import { KATE_CHAT_URL } from './config';
import type { ChatOpener, ChatViewHandle } from './types';

/** A full-height panel settles without overshoot: a spring past the top would open a gap at the bottom. */
const ENTER = Easing.bezier(0.16, 1, 0.3, 1);
const EXIT = Easing.bezier(0.4, 0, 1, 1);

function withOpener(url: string, opener: ChatOpener | null | undefined) {
  if (!opener) return url;
  const query = `opener=${encodeURIComponent(opener.text)}&finding=${encodeURIComponent(opener.findingId)}`;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

const sameOpener = (a: ChatOpener | null, b: ChatOpener | null) => !!a && !!b && a.findingId === b.findingId && a.text === b.text;

export function KateChat({
  open,
  onClose,
  onOpened,
  prewarm = false,
  topInset = 0,
  opener,
}: {
  open: boolean;
  onClose: () => void;
  /** The panel has finished opening and covers everything under it. */
  onOpened?: () => void;
  /** Create the chat view ahead of the first open (hidden), so it isn't built while the panel slides in. */
  prewarm?: boolean;
  topInset?: number;
  /** Kate's first message when opened from a finding. */
  opener?: ChatOpener | null;
}) {
  const progress = useSharedValue(0);
  const panel = useRef<View>(null);
  const { hidden, settle } = useOverlayFocus(open, panel);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(812);
  const [url, setUrl] = useState(KATE_CHAT_URL);
  const view = useRef<ChatViewHandle>(null);
  /** What Kate was asked to say during this open, and the one still to send to the page. */
  const [said, setSaid] = useState<ChatOpener | null>(null);
  const [outbox, setOutbox] = useState<ChatOpener | null>(null);
  const sent = useRef<ChatOpener | null>(null);

  if ((open || prewarm) && !mounted) {
    setMounted(true);
    if (open) {
      setUrl(withOpener(KATE_CHAT_URL, opener));
      setSaid(opener ?? null);
    }
  } else if (open && opener && !sameOpener(opener, said)) {
    setSaid(opener);
    setOutbox(opener);
  } else if (!open && said) {
    // Closed: opening the same finding again later should make Kate say it again.
    setSaid(null);
  }

  useEffect(() => {
    if (!outbox || !loaded || sent.current === outbox) return;
    sent.current = outbox;
    view.current?.post({ type: 'kate:opener', ...outbox });
  }, [outbox, loaded]);

  const onOpenedRef = useRef(onOpened);
  useEffect(() => {
    onOpenedRef.current = onOpened;
  }, [onOpened]);

  useEffect(() => {
    const opened = () => onOpenedRef.current?.();
    progress.value = withTiming(open ? 1 : 0, { duration: open ? 380 : 240, easing: open ? ENTER : EXIT }, (finished) => {
      if (finished) scheduleOnRN(open ? opened : settle);
    });
  }, [open, progress, settle]);

  useEffect(() => {
    if (!open) return;
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
  }, [open, onClose]);

  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height * 1.05 }],
  }));

  return (
    <Animated.View
      ref={panel}
      role="dialog"
      aria-modal
      aria-label="Chat met Kate"
      aria-hidden={hidden}
      onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
      // Closed and settled: out of the layout altogether. Fading a panel with an iframe to opacity 0 made the
      // browser keep presenting stale frames of it; display: none drops the layer and keeps the chat page alive.
      style={[styles.sheet, { top: 12 + topInset, pointerEvents: open ? 'auto' : 'none', display: hidden ? 'none' : 'flex' }, sheetStyle]}>
      <View style={styles.top}>
        <View style={styles.grab} />
        <Pressable role="button" aria-label="Chat sluiten" onPress={onClose} style={styles.close}>
          <Text style={styles.closeIcon}>✕</Text>
        </Pressable>
      </View>
      <View style={styles.body}>
        {mounted && <ChatView ref={view} url={url} onLoad={() => setLoaded(true)} />}
        {!loaded && (
          <View style={styles.loading}>
            <ActivityIndicator color={world.blue} />
          </View>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  sheet: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#fff',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
    boxShadow: shadow.sheet,
  },
  top: { height: 28, alignItems: 'center', justifyContent: 'center' },
  grab: { width: 40, height: 5, borderRadius: 5, backgroundColor: '#d7e0ea' },
  close: {
    position: 'absolute',
    right: 10,
    top: 2,
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: world.secondaryBg,
  },
  closeIcon: { fontFamily: font.body800, fontSize: 14, color: world.ink },
  body: { flex: 1 },
  loading: { ...StyleSheet.absoluteFill, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
});
