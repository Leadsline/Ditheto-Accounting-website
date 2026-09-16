import { type ReactNode, useEffect, useRef } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ErrorBoundary } from '@/components/error-boundary';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Route, Switch, useLocation, Router as WouterRouter, Redirect } from 'wouter';
import { ClerkProvider, SignIn, SignUp, useAuth, useClerk } from '@clerk/react';
import { publishableKeyFromHost } from '@clerk/react/internal';
import { shadcn } from '@clerk/themes';

import { Layout } from '@/components/layout/layout';
import Home from '@/pages/home';
import Services from '@/pages/services';
import ServiceDetail from '@/pages/service-detail';
import Quote from '@/pages/quote';
import About from '@/pages/about';
import Team from '@/pages/team';
import Contact from '@/pages/contact';
import AdminDashboard from '@/pages/admin/dashboard';
import AdminClients from '@/pages/admin/clients';
import AdminClientProfile from '@/pages/admin/client-profile';
import AdminIntegrations from '@/pages/admin/integrations';
import AdminReminders from '@/pages/admin/reminders';
import AdminCampaigns from '@/pages/admin/campaigns';
import AdminTeam from '@/pages/admin/team';
import NotFound from '@/pages/not-found';
import { useRole } from '@/hooks/use-role';

const queryClient = new QueryClient();
const basePath = import.meta.env.BASE_URL.replace(/\/$/, '');
const clerkPubKey = publishableKeyFromHost(
  window.location.hostname,
  import.meta.env.VITE_CLERK_PUBLISHABLE_KEY,
);
const configuredClerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
// A Vercel deployment can be configured with the development Clerk key while
// it is being prepared. Clerk rejects that key through the production proxy
// with `host_invalid`; let the development instance use its direct FAPI until
// a live key is supplied. Replit production keys remain proxied.
const clerkProxyUrl = clerkPubKey.startsWith("pk_test_")
  ? ""
  : configuredClerkProxyUrl;

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath)
    ? path.slice(basePath.length) || "/"
    : path;
}

function AdminGuard({ children, fullAccess = false }: { children: ReactNode; fullAccess?: boolean }) {
  const { isLoaded, isSignedIn } = useAuth();
  const { isLoaded: roleLoaded, isFullAccess, isMarketingOnly, isUnauthorized } = useRole();
  if (!isLoaded) return <div className="min-h-screen bg-gray-50" />;
  if (!isSignedIn) return <Redirect to="/sign-in" />;
  if (!roleLoaded) return <div className="min-h-screen bg-gray-50" />;
  if (isUnauthorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-6">
        <div className="max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-200">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Ditheto Admin Portal</p>
          <h1 className="mt-3 text-2xl font-bold text-secondary">Access is being set up</h1>
          <p className="mt-3 text-sm leading-6 text-gray-600">
            Your sign-in is working, but this account has not been assigned a staff portal role yet.
          </p>
          <a href="/" className="mt-6 inline-flex rounded-md bg-primary px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-secondary">
            Return to website
          </a>
        </div>
      </div>
    );
  }
  if (fullAccess && !isFullAccess) return <Redirect to="/admin/campaigns" />;
  if (!fullAccess && isMarketingOnly) return <>{children}</>;
  return <>{children}</>;
}

function ClerkQueryInvalidator() {
  const { addListener } = useClerk();
  const previous = useRef<string | null | undefined>(undefined);
  useEffect(() => addListener(({ user }) => {
    const userId = user?.id ?? null;
    if (previous.current !== undefined && previous.current !== userId) queryClient.clear();
    previous.current = userId;
  }), [addListener]);
  return null;
}

function Router() {
  return (
    <RoutedErrorBoundary>
      <Switch>
        {/* Clerk Auth Routes */}
        <Route path="/sign-in/*?" component={() => (
            <div className="min-h-screen flex items-center justify-center bg-background">
            <SignIn
              routing="path"
              path={`${basePath}/sign-in`}
              signUpUrl={`${basePath}/sign-up`}
              forceRedirectUrl={`${basePath}/admin/clients`}
            />
          </div>
        )} />
        <Route path="/sign-up/*?" component={() => (
          <div className="min-h-screen flex items-center justify-center bg-background">
            <SignUp
              routing="path"
              path={`${basePath}/sign-up`}
              signInUrl={`${basePath}/sign-in`}
              forceRedirectUrl={`${basePath}/admin/clients`}
            />
          </div>
        )} />
        {/* Admin Routes */}
        <Route path="/admin"><AdminGuard fullAccess><AdminDashboard /></AdminGuard></Route>
        <Route path="/admin/clients"><AdminGuard fullAccess><AdminClients /></AdminGuard></Route>
        <Route path="/admin/clients/:clientId"><AdminGuard fullAccess><AdminClientProfile /></AdminGuard></Route>
        <Route path="/admin/settings/integrations"><AdminGuard fullAccess><AdminIntegrations /></AdminGuard></Route>
        <Route path="/admin/reminders"><AdminGuard fullAccess><AdminReminders /></AdminGuard></Route>
        <Route path="/admin/campaigns"><AdminGuard><AdminCampaigns /></AdminGuard></Route>
        <Route path="/admin/team"><AdminGuard fullAccess><AdminTeam /></AdminGuard></Route>
        
        {/* Public Routes with Layout */}
        <Route path="/services/:serviceId">
          <Layout>
            <ServiceDetail />
          </Layout>
        </Route>
        <Route path="/">
          <Layout>
            <Home />
          </Layout>
        </Route>
        <Route path="/:rest*">
          <Layout>
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/services" component={Services} />
              <Route path="/quote" component={Quote} />
              <Route path="/about" component={About} />
              <Route path="/team" component={Team} />
              <Route path="/contact" component={Contact} />
              <Route component={NotFound} />
            </Switch>
          </Layout>
        </Route>
      </Switch>
    </RoutedErrorBoundary>
  );
}

function RoutedErrorBoundary({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  return <ErrorBoundary resetKey={location}>{children}</ErrorBoundary>;
}

function App() {
  const [, setLocation] = useLocation();
  return (
    <ClerkProvider
      publishableKey={clerkPubKey}
      proxyUrl={clerkProxyUrl}
      signInUrl={`${basePath}/sign-in`}
      signUpUrl={`${basePath}/sign-up`}
      appearance={{
        theme: shadcn,
        cssLayerName: "clerk",
        elements: {
          socialButtonsBlockButton: "hidden",
        },
        variables: {
          colorPrimary: "#008E8A",
          colorForeground: "#17324D",
          colorBackground: "#FFFFFF",
          colorInput: "#F7FAFC",
          colorInputForeground: "#17324D",
          colorMutedForeground: "#64748B",
           fontFamily: "DM Sans, sans-serif",
          borderRadius: "0.75rem",
        },
      }}
      localization={{
        signIn: { start: { title: "Ditheto Admin Portal", subtitle: "Use your email address and password to manage client records securely" } },
      }}
      routerPush={(to) => setLocation(stripBase(to))}
      routerReplace={(to) => setLocation(stripBase(to), { replace: true })}
    >
      <QueryClientProvider client={queryClient}>
        <ClerkQueryInvalidator />
        <TooltipProvider>
          <Router />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    </ClerkProvider>
  );
}

export default function AppRoot() {
  return <WouterRouter base={basePath}><App /></WouterRouter>;
}