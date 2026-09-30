// iOS / Android: the chat page in a native WebView.

import { StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

export function ChatView({ url, onLoad }: { url: string; onLoad: () => void }) {
  return (
    <WebView
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
}

const styles = StyleSheet.create({
  view: { flex: 1, backgroundColor: '#fff' },
});
