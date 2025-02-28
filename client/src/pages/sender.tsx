import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

export default function Sender() {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState("{\n  \"Content-Type\": \"application/json\"\n}");
  const [body, setBody] = useState("{\n  \"message\": \"Hello World\"\n}");
  const { toast } = useToast();

  const sendWebhook = async () => {
    try {
      let parsedHeaders;
      let parsedBody;

      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        toast({
          title: "Invalid Headers",
          description: "Please enter valid JSON for headers",
          variant: "destructive",
        });
        return;
      }

      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        toast({
          title: "Invalid Body",
          description: "Please enter valid JSON for body",
          variant: "destructive",
        });
        return;
      }

      const response = await fetch(url, {
        method: "POST",
        headers: parsedHeaders,
        body: JSON.stringify(parsedBody),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      toast({
        title: "Success!",
        description: "Webhook sent successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send webhook",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Webhook Sender</h1>

      <Card>
        <CardHeader>
          <CardTitle>Send a Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-2 block">Webhook URL</label>
            <Input
              placeholder="https://example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Headers (JSON)</label>
            <Textarea
              placeholder="Enter headers as JSON"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className="font-mono"
              rows={5}
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Body (JSON)</label>
            <Textarea
              placeholder="Enter body as JSON"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="font-mono"
              rows={8}
            />
          </div>

          <Button onClick={sendWebhook} className="w-full">
            Send Webhook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
