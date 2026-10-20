// iOS / Android: the chat page in a native WebView.

import { forwardRef, useImperativeHandle, useRef } from 'react';
import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

import type { ChatViewHandle } from './types';

export const ChatView = forwardRef<ChatViewHandle, { url: string; onLoad: () => void }>(function ChatView({ url, onLoad }, ref) {
  const webview = useRef<WebView>(null);
  useImperativeHandle(ref, () => ({
    // The page listens for window "message" events; a WebView has no parent frame, so dispatch one directly.
    post: (message) =>
      webview.current?.injectJavaScript(
        `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(message)} })); true;`,
      ),
  }));
  return (
    <WebView
      ref={webview}
      source={{ uri: url }}
      onLoadEnd={onLoad}
      style={styles.view}
      // Keep the site-password cookie and the chat session between openings
      sharedCookiesEnabled
      domStorageEnabled
      // The chat has its own input; don't let the page zoom when it gets focus
      scalesPageToFit={false}
      keyboardDisplayRequiresUserAction={false}
    />
  );
});

const styles = StyleSheet.create({
  view: { flex: 1, backgroundColor: '#fff' },
});
