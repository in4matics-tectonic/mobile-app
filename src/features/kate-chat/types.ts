/** What Kate says first when the chat opens from a finding (D16). */
export interface ChatOpener {
  findingId: string;
  text: string;
}

export interface ChatViewHandle {
  /** Sends a message to the chat page (postMessage on web, an injected event in the WebView). */
  post: (message: { type: 'kate:opener' } & ChatOpener) => void;
}
