import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'sonner';
import NotFound from '@/pages/not-found';
import Home from '@/pages/home';
import Tag from '@/pages/tag';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { LanguageProvider } from '@/lib/i18n';
import { LanguageToggle } from '@/components/language-toggle';

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/tag/:id" component={Tag} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LanguageProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
          <LanguageToggle />
          <Router />
        </WouterRouter>
        <Toaster position="top-center" />
      </LanguageProvider>
    </QueryClientProvider>
  );
}

export default App;
