import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { insertWebhookSchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  const wss = new WebSocketServer({ server: httpServer, path: "/ws" });

  const broadcast = (data: any) => {
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(JSON.stringify(data));
      }
    });
  };

  app.post("/api/webhook/*", async (req, res) => {
    try {
      const webhook = {
        method: req.method,
        headers: req.headers,
        body: req.body,
        path: req.path,
      };

      const parsed = insertWebhookSchema.parse(webhook);
      const created = await storage.createWebhook(parsed);
      
      broadcast({
        type: "webhook",
        data: created
      });

      res.status(200).json({ message: "Webhook received" });
    } catch (error) {
      res.status(400).json({ error: "Invalid webhook data" });
    }
  });

  app.get("/api/webhooks", async (_req, res) => {
    const webhooks = await storage.getWebhooks();
    res.json(webhooks);
  });

  return httpServer;
}
