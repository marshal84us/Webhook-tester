// import { useState } from "react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useToast } from "@/hooks/use-toast";

// export default function Sender() {
//   const [url, setUrl] = useState("");
//   const [headers, setHeaders] = useState(
//     '{\n  "Content-Type": "application/json"\n}',
//   );
//   const [body, setBody] = useState('{\n  "message": "Hello World"\n}');
//   const { toast } = useToast();
//   const [message, setMessage] = useState("");
//   const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

//   const sendWebhook = async () => {
//     try {
//       setValidationErrors({});
//       let parsedHeaders;
//       let parsedBody;

//       try {
//         parsedHeaders = JSON.parse(headers);
//       } catch (e) {
//         toast({
//           title: "Invalid Headers",
//           description: "Please enter valid JSON for headers",
//           variant: "destructive",
//         });
//         return;
//       }

//       try {
//         parsedBody = JSON.parse(body);
//       } catch (e) {
//         toast({
//           title: "Invalid Body",
//           description: "Please enter valid JSON for body",
//           variant: "destructive",
//         });
//         return;
//       }

//       const response = await fetch(url, {
//         method: "POST",
//         headers: parsedHeaders,
//         body: JSON.stringify(parsedBody),
//       });

//       // if (!response.ok) {
//       //   throw new Error(`HTTP error! status: ${response.status}`);
//       // }

//       const result = await response.json();
//       setMessage(result.message || "");
//       toast({
//         title: "Success!",
//         description: result.message,
//         duration: 6000,
//       });
//     } catch (error) {
//       toast({
//         title: "Error",
//         description:
//           error instanceof Error ? error.message : "Failed to send webhook",
//         variant: "destructive",
//       });
//     }
//   };

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <h1 className="text-4xl font-bold mb-8">Webhook Sender</h1>
//       <div className="bg-green-500 p-2 rounded m-2">{message && message}</div>
//       <Card>
//         <CardHeader>
//           <CardTitle>Send a Webhook</CardTitle>
//         </CardHeader>
//         <CardContent className="space-y-4">
//           <div>
//             <label className="text-sm font-medium mb-2 block">
//               Webhook URL
//             </label>
//             <Input
//               placeholder="https://example.com/webhook"
//               value={url}
//               onChange={(e) => setUrl(e.target.value)}
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium mb-2 block">
//               Headers (JSON)
//             </label>
//             <Textarea
//               placeholder="Enter headers as JSON"
//               value={headers}
//               onChange={(e) => setHeaders(e.target.value)}
//               className="font-mono"
//               rows={5}
//             />
//           </div>

//           <div>
//             <label className="text-sm font-medium mb-2 block">
//               Body (JSON)
//             </label>
//             <Textarea
//               placeholder="Enter body as JSON"
//               value={body}
//               onChange={(e) => setBody(e.target.value)}
//               className="font-mono"
//               rows={8}
//             />
//           </div>

//           <Button onClick={sendWebhook} className="w-full">
//             Send Webhook
//           </Button>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

export default function Sender() {
  const [url, setUrl] = useState("");
  const [headers, setHeaders] = useState(
    '{\n  "Content-Type": "application/json"\n}',
  );
  const [body, setBody] = useState('{\n  "message": "Hello World"\n}');
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const sendWebhook = async () => {
    try {
      setValidationErrors({}); // Clear previous errors

      let parsedHeaders;
      let parsedBody;

      // Validate JSON inputs
      try {
        parsedHeaders = JSON.parse(headers);
      } catch (e) {
        return toast({
          title: "Invalid Headers",
          description: "Please enter valid JSON for headers",
          variant: "destructive",
        });
      }

      try {
        parsedBody = JSON.parse(body);
      } catch (e) {
        return toast({
          title: "Invalid Body",
          description: "Please enter valid JSON for body",
          variant: "destructive",
        });
      }

      const response = await fetch(url, {
        method: "POST",
        headers: parsedHeaders,
        body: JSON.stringify(parsedBody),
      });

      const result = await response.json();

      if (!response.ok) {
        if (response.status === 422) {
          // Handle validation errors
          setValidationErrors(result.fields || {});
          Object.values(result.fields || {}).map((msg) => {
            toast({
              title: "Validation Failed",
              description: msg,
              variant: "destructive",
            });
          });
          return toast({
            title: "Validation Failed",
            description: result.message || "Please fix the errors in the form",
            variant: "destructive",
          });
        }

        throw new Error(result.error || "Failed to send webhook");
      }

      // Success case
      toast({
        title: "Success!",
        description: result.message || "Webhook sent successfully",
        duration: 6000,
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send webhook",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-4xl font-bold mb-8">Webhook Sender</h1>
      {message && <div className="bg-green-500 p-3 rounded">{message}</div>}

      {Object.keys(validationErrors).length > 0 &&
        Object.values(validationErrors).map((error, index) => (
          <div className="bg-red-500 p-3 rounded">{error}</div>
        ))}
      <Card>
        <CardHeader>
          <CardTitle>Send a Webhook</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="url">Webhook URL</Label>
            <Input
              id="url"
              placeholder="https://example.com/webhook"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className={validationErrors.url ? "border-destructive" : ""}
            />
            {validationErrors.url && (
              <p className="text-sm text-destructive mt-1">
                {validationErrors.url}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="headers">Headers (JSON)</Label>
            <Textarea
              id="headers"
              placeholder="Enter headers as JSON"
              value={headers}
              onChange={(e) => setHeaders(e.target.value)}
              className={`font-mono ${validationErrors.headers ? "border-destructive" : ""}`}
              rows={5}
            />
            {validationErrors.headers && (
              <p className="text-sm text-destructive mt-1">
                {validationErrors.headers}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="body">Body (JSON)</Label>
            <Textarea
              id="body"
              placeholder="Enter body as JSON"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className={`font-mono ${validationErrors.body ? "border-destructive" : ""}`}
              rows={8}
            />
            {validationErrors.body && (
              <p className="text-sm text-destructive mt-1">
                {validationErrors.body}
              </p>
            )}
          </div>

          <Button onClick={sendWebhook} className="w-full">
            Send Webhook
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
