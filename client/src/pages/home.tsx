import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { setupWebSocket, useWebhookStore } from "@/lib/websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WifiOff, Wifi } from "lucide-react";
import type { Webhook } from "@shared/schema";

export default function Home() {
  const connected = useWebhookStore((state: { connected: boolean }) => state.connected);
  const storeWebhooks = useWebhookStore((state: { webhooks: Webhook[] }) => state.webhooks);

  const { data: apiWebhooks } = useQuery<Webhook[]>({
    queryKey: ["/api/webhooks"],
  });

  const webhooks = [...(storeWebhooks || []), ...(apiWebhooks || [])].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  useEffect(() => {
    setupWebSocket();
  }, []);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleString();
  };

  const formatJson = (data: unknown) => {
    return JSON.stringify(data, null, 2);
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-bold">Webhook Listener</h1>
        <div className="flex items-center gap-2">
          {connected ? (
            <>
              <Wifi className="h-5 w-5 text-green-500" />
              <span className="text-sm text-green-500">Connected</span>
            </>
          ) : (
            <>
              <WifiOff className="h-5 w-5 text-red-500" />
              <span className="text-sm text-red-500">Disconnected</span>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6">
        {webhooks?.map((webhook) => (
          <Card key={webhook.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{webhook.method} {webhook.path}</span>
                <span className="text-sm text-muted-foreground">
                  {formatDate(webhook.timestamp)}
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Headers</h3>
                  <ScrollArea className="h-32 rounded-md border p-4">
                    <pre className="text-sm">{formatJson(webhook.headers)}</pre>
                  </ScrollArea>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Body</h3>
                  <ScrollArea className="h-48 rounded-md border p-4">
                    <pre className="text-sm">{formatJson(webhook.body)}</pre>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}