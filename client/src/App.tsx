import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
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
      <Route path="/" component={Home} />
      <Route path="/subjects" component={Subjects} />
      <Route path="/quiz/:subjectKey" component={Quiz} />
      <Route path="/quiz/:subjectKey/:tag" component={Quiz} />
      <Route path="/knowledge" component={KnowledgeMap} />
      <Route path="/knowledge/:tag" component={KnowledgeDetail} />
      <Route path="/mock-exam" component={MockExam} />
      <Route path="/results" component={Results} />
      <Route path="/pricing" component={Pricing} />
      <Route path="/payment/success" component={PaymentSuccess} />
      <Route path="/auth/login" component={Login} />
      <Route path="/auth/register" component={Register} />
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
