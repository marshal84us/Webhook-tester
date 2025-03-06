import { Switch, Route, Link, useLocation, useRoute } from "wouter";
import { useState } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Sender from "@/pages/sender";
import Login from "@/pages/login";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

function Router({ isAuthenticated, onLogin }) {
  const [location, setLocation] = useLocation();
  const [matchLogin] = useRoute("/login");

  return (
    <div>
      {isAuthenticated && (
        <div className="border-b">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <Tabs
                value={location}
                onValueChange={setLocation}
                className="w-full"
              >
                <TabsList className="my-2">
                  <TabsTrigger value="/" asChild>
                    <Link href="/">Webhook Listener</Link>
                  </TabsTrigger>
                  <TabsTrigger value="/sender" asChild>
                    <Link href="/sender">Webhook Sender</Link>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <ThemeToggle />
            </div>
          </div>
        </div>
      )}

      <Switch>
        <Route path="/login">
          <Login onLogin={onLogin} />
        </Route>
        <Route path="/">
          {isAuthenticated ? <Home /> : <Login onLogin={onLogin} />}
        </Route>
        <Route path="/sender">
          {isAuthenticated ? <Sender /> : <Login onLogin={onLogin} />}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const handleLogin = () => {
    setIsAuthenticated(true);
  };

  return (
    <ThemeProvider defaultTheme="light" storageKey="webhook-theme">
      <QueryClientProvider client={queryClient}>
        <Router isAuthenticated={isAuthenticated} onLogin={handleLogin} />
        <Toaster />
      </QueryClientProvider>
    </ThemeProvider>
  );
}

export default App;
