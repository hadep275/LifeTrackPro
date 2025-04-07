import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";

// Lazy loaded components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Habits = lazy(() => import("@/pages/Habits"));
const Goals = lazy(() => import("@/pages/Goals"));
const Finances = lazy(() => import("@/pages/Finances"));
const Calendar = lazy(() => import("@/pages/Calendar"));

function App() {
  return (
    <ThemeProvider defaultTheme="system" storageKey="life-track-theme">
      <div className="min-h-screen flex flex-col bg-background font-sans text-foreground">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-6">
          <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
            <Switch>
              <Route path="/" component={Dashboard} />
              <Route path="/tasks" component={Tasks} />
              <Route path="/habits" component={Habits} />
              <Route path="/goals" component={Goals} />
              <Route path="/finances" component={Finances} />
              <Route path="/calendar" component={Calendar} />
              <Route component={NotFound} />
            </Switch>
          </Suspense>
        </main>
        <Footer />
        <Toaster />
      </div>
    </ThemeProvider>
  );
}

export default App;
