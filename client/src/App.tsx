import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import RequireAuth from "./components/RequireAuth";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import Home from "./pages/Home";
import Quiz from "./pages/Quiz";
import Subjects from "./pages/Subjects";
import KnowledgeMap from "./pages/KnowledgeMap";
import KnowledgeDetail from "./pages/KnowledgeDetail";
import MockExam from "./pages/MockExam";
import Results from "./pages/Results";
import Pricing from "./pages/Pricing";
import PaymentSuccess from "./pages/PaymentSuccess";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import NotFound from "./pages/NotFound";

function Router() {
  return (
    <Switch>
      {/* 公開頁面 — 不需登入 */}
      <Route path="/" component={Home} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
      <Route path="/payment/success" component={PaymentSuccess} />

      {/* 保護頁面 — 需要登入 */}
      <Route path="/subjects">
        <RequireAuth><Subjects /></RequireAuth>
      </Route>
      <Route path="/quiz/:subjectKey">
        {(params) => <RequireAuth><Quiz {...params} /></RequireAuth>}
      </Route>
      <Route path="/quiz/:subjectKey/:tag">
        {(params) => <RequireAuth><Quiz {...params} /></RequireAuth>}
      </Route>
      <Route path="/knowledge">
        <RequireAuth><KnowledgeMap /></RequireAuth>
      </Route>
      <Route path="/knowledge/:tag">
        {(params) => <RequireAuth><KnowledgeDetail {...params} /></RequireAuth>}
      </Route>
      <Route path="/mock-exam">
        <RequireAuth><MockExam /></RequireAuth>
      </Route>
      <Route path="/results">
        <RequireAuth><Results /></RequireAuth>
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
