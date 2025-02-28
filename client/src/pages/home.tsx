import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { setupWebSocket, useWebhookStore } from "@/lib/websocket";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WifiOff, Wifi, Copy, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Webhook } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";

export default function Home() {
  const connected = useWebhookStore((state: { connected: boolean }) => state.connected);
  const storeWebhooks = useWebhookStore((state: { webhooks: Webhook[] }) => state.webhooks);
  const clearWebhooks = useWebhookStore((state) => state.clearWebhooks);
  const { toast } = useToast();

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

  const webhookUrl = `${window.location.protocol}//${window.location.host}/api/webhook/test`;

  const copyWebhookUrl = async () => {
    await navigator.clipboard.writeText(webhookUrl);
    toast({
      title: "Copied!",
      description: "Webhook URL copied to clipboard",
    });
  };

  const testWebhook = async () => {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "Test webhook",
          timestamp: new Date().toISOString(),
        }),
      });
      toast({
        title: "Success!",
        description: "Test webhook sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send test webhook",
        variant: "destructive",
      });
    }
  };

  const handleClear = () => {
    clearWebhooks();
    queryClient.setQueryData(["/api/webhooks"], []);
    toast({
      title: "Cleared",
      description: "All webhooks have been cleared from the display",
    });
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

      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Your Webhook URL</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 mb-4">
            <code className="bg-muted px-4 py-2 rounded flex-1">{webhookUrl}</code>
            <Button variant="outline" size="icon" onClick={copyWebhookUrl}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-col gap-4">
            <p className="text-sm text-muted-foreground">
              Send POST requests to this URL with any JSON body to test your webhooks.
              All requests will be captured and displayed below in real-time.
            </p>
            <div className="flex gap-2">
              <Button onClick={testWebhook}>Send Test Webhook</Button>
              <Button variant="outline" onClick={handleClear}>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear All
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

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