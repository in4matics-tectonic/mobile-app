// Kate's chat as a sheet that slides up over the whole phone screen, with the chat page inside a
// WebView (an iframe on web, see ChatView). Opened from the Kate bar and the finding cards; closed with
// the ✕, a tap on the veil, Escape (web) or the Android back button.
// The view is created on first open and then kept, so the conversation survives closing the sheet.
//
// Opener (D16): when the chat opens from a finding, Kate starts with that finding. On first open it travels in
// the URL (?opener=…&finding=…); later, as a { type: 'kate:opener' } message. A chat page that doesn't know
// openers ignores both and simply opens plain.

import { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, BackHandler, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';

import { font, shadow, world } from '@/features/mijn-wereld/theme';

import { ChatView } from './ChatView';
import { KATE_CHAT_URL } from './config';
import type { ChatOpener, ChatViewHandle } from './types';

const EASE = Easing.bezier(0.2, 0.9, 0.3, 1.1);

function withOpener(url: string, opener: ChatOpener | null | undefined) {
  if (!opener) return url;
  const query = `opener=${encodeURIComponent(opener.text)}&finding=${encodeURIComponent(opener.findingId)}`;
  return `${url}${url.includes('?') ? '&' : '?'}${query}`;
}

export function KateChat({
  open,
  onClose,
  topInset = 0,
  opener,
}: {
  open: boolean;
  onClose: () => void;
  topInset?: number;
  /** Kate's first message when opened from a finding; a new object each time it should be said. */
  opener?: ChatOpener | null;
}) {
  const progress = useSharedValue(0);
  const [mounted, setMounted] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [height, setHeight] = useState(812);
  const [url, setUrl] = useState(KATE_CHAT_URL);
  const view = useRef<ChatViewHandle>(null);
  /** The last opener Kate was asked to say, and the one still to send to the page. */
  const [said, setSaid] = useState<ChatOpener | null>(null);
  const [outbox, setOutbox] = useState<ChatOpener | null>(null);
  const sent = useRef<ChatOpener | null>(null);

  // Mount the chat on first open only (it starts polling the chat server as soon as it loads).
  // The first opener travels in the URL; later ones as a message to the page that's already there.
  if (open && !mounted) {
    setMounted(true);
    setUrl(withOpener(KATE_CHAT_URL, opener));
    setSaid(opener ?? null);
  } else if (open && opener && opener !== said) {
    setSaid(opener);
    setOutbox(opener);
  }

  useEffect(() => {
    if (!outbox || !loaded || sent.current === outbox) return;
    sent.current = outbox;
    view.current?.post({ type: 'kate:opener', ...outbox });
  }, [outbox, loaded]);

  const onLoad = () => setLoaded(true);

  useEffect(() => {
    progress.value = withTiming(open ? 1 : 0, { duration: open ? 320 : 220, easing: open ? EASE : Easing.out(Easing.quad) });
  }, [open, progress]);

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

  const veilStyle = useAnimatedStyle(() => ({ opacity: progress.value }));
  const sheetStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: (1 - progress.value) * height * 1.05 }],
    // Fully hidden once closed, so nothing (e.g. a scrolled container) can ever reveal it
    opacity: progress.value > 0.001 ? 1 : 0,
  }));

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: open ? 'auto' : 'none' }]} aria-hidden={!open}>
      <Animated.View style={[StyleSheet.absoluteFill, styles.veil, veilStyle]}>
        <Pressable style={StyleSheet.absoluteFill} onPress={onClose} aria-label="Sluiten" />
      </Animated.View>

      <Animated.View
        role="dialog"
        aria-modal
        aria-label="Chat met Kate"
        onLayout={(e) => setHeight(e.nativeEvent.layout.height)}
        style={[styles.sheet, { top: 12 + topInset }, sheetStyle]}>
        <View style={styles.top}>
          <View style={styles.grab} />
          <Pressable role="button" aria-label="Chat sluiten" onPress={onClose} style={styles.close}>
            <Text style={styles.closeIcon}>✕</Text>
          </Pressable>
        </View>
        <View style={styles.body}>
          {mounted && <ChatView ref={view} url={url} onLoad={onLoad} />}
          {!loaded && (
            <View style={styles.loading}>
              <ActivityIndicator color={world.blue} />
            </View>
          )}
        </View>
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
