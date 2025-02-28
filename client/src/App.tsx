import { Switch, Route, Link, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Sender from "@/pages/sender";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Router() {
  const [location, setLocation] = useLocation();

  return (
    <div>
      <div className="border-b">
        <div className="container mx-auto px-4">
          <Tabs value={location} onValueChange={setLocation} className="w-full">
            <TabsList className="my-2">
              <TabsTrigger value="/" asChild>
                <Link href="/">Webhook Listener</Link>
              </TabsTrigger>
              <TabsTrigger value="/sender" asChild>
                <Link href="/sender">Webhook Sender</Link>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <Switch>
        <Route path="/" component={Home} />
        <Route path="/sender" component={Sender} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;