// Web: react-native-webview has no web support, so the chat page goes in an iframe.

export function ChatView({ url, onLoad }: { url: string; onLoad: () => void }) {
  return (
    <iframe
      src={url}
      title="Kate"
      onLoad={onLoad}
      style={{ border: 0, width: '100%', height: '100%', display: 'block', background: '#fff' }}
    />
  );
}
