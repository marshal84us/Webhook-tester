import { create } from "zustand";
import type { Webhook } from "@shared/schema";

interface WebhookStore {
  connected: boolean;
  webhooks: Webhook[];
  setConnected: (connected: boolean) => void;
  addWebhook: (webhook: Webhook) => void;
  clearWebhooks: () => void;
}

export const useWebhookStore = create<WebhookStore>((set) => ({
  connected: false,
  webhooks: [],
  setConnected: (connected: boolean) => set({ connected }),
  addWebhook: (webhook: Webhook) => set((state) => ({ 
    webhooks: [webhook, ...state.webhooks] 
  })),
  clearWebhooks: () => set({ webhooks: [] })
}));

export function setupWebSocket() {
  const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
  const wsUrl = `${protocol}//${window.location.host}/ws`;

  const socket = new WebSocket(wsUrl);

  socket.addEventListener("open", () => {
    useWebhookStore.getState().setConnected(true);
  });

  socket.addEventListener("close", () => {
    useWebhookStore.getState().setConnected(false);
    setTimeout(setupWebSocket, 1000);
  });

  socket.addEventListener("message", (event) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "webhook") {
        useWebhookStore.getState().addWebhook(message.data);
      } else if (message.type === "clear") {
        useWebhookStore.getState().clearWebhooks();
      }
    } catch (error) {
      console.error("Failed to parse websocket message:", error);
    }
  });
}