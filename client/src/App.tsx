import { Route, Switch } from "wouter";
import { lazy, Suspense } from "react";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NotFound from "@/pages/not-found";

// Lazy loaded components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Tasks = lazy(() => import("@/pages/Tasks"));
const Habits = lazy(() => import("@/pages/Habits"));
const Goals = lazy(() => import("@/pages/Goals"));
const Finances = lazy(() => import("@/pages/Finances"));

function App() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 font-sans text-slate-800">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-6">
        <Suspense fallback={<div className="p-8 text-center">Loading...</div>}>
          <Switch>
            <Route path="/" component={Dashboard} />
            <Route path="/tasks" component={Tasks} />
            <Route path="/habits" component={Habits} />
            <Route path="/goals" component={Goals} />
            <Route path="/finances" component={Finances} />
            <Route component={NotFound} />
          </Switch>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;
