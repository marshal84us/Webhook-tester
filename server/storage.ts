import { webhooks, type Webhook, type InsertWebhook } from "@shared/schema";

export interface IStorage {
  getWebhooks(): Promise<Webhook[]>;
  createWebhook(webhook: InsertWebhook): Promise<Webhook>;
}

export class MemStorage implements IStorage {
  private webhooks: Map<number, Webhook>;
  private currentId: number;

  constructor() {
    this.webhooks = new Map();
    this.currentId = 1;
  }

  async getWebhooks(): Promise<Webhook[]> {
    return Array.from(this.webhooks.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async createWebhook(insertWebhook: InsertWebhook): Promise<Webhook> {
    const id = this.currentId++;
    const webhook: Webhook = {
      ...insertWebhook,
      id,
      timestamp: new Date(),
    };
    this.webhooks.set(id, webhook);
    return webhook;
  }
}

export const storage = new MemStorage();
