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

  app.post("/api/login", (req, res) => {
    const { username, password } = req.body;
    if (username === "office" && password === "ZALcn0QsfgKUTS8") {
      res.status(200).json({ message: "Login Successful", success: true });
    } else {
      res.status(401).json({ message: "Invalid Credentials", success: false });
    }
  });

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
        data: created,
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

  app.post("/api/webhooks/clear", async (_req, res) => {
    await storage.clearWebhooks();
    broadcast({
      type: "clear",
    });
    res.json({ message: "All webhooks cleared" });
  });

  return httpServer;
}
