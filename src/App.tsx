import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { HashRouter, Link, Route, Routes } from 'react-router';
import { WorkspaceProvider } from './store';
import { AppShell } from './components/AppShell';
import { Overview } from './pages/Overview';
import { Projects } from './pages/Projects';
import { People } from './pages/People';
import { Activity } from './pages/Activity';
import { Elements } from './pages/Elements';
import { Settings } from './pages/Settings';
import { EmptyState, PageHeading } from './components/ui';

class AppErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) console.error(error, info);
  }
  render() {
    if (this.state.failed)
      return (
        <main className="app-error">
          <h1>Let’s get you back on track.</h1>
          <p>
            The demo couldn’t load this view. Reload to try again, or reset this starter’s local
            demo data.
          </p>
          <button className="btn btn-primary" onClick={() => location.reload()}>
            Reload workspace
          </button>
          <button
            className="btn btn-secondary"
            onClick={() => {
              try {
                localStorage.removeItem('workspace.demo.v1');
                localStorage.removeItem('workspace.preferences.v1');
              } finally {
                location.reload();
              }
            }}
          >
            Reset local demo
          </button>
        </main>
      );
    return this.props.children;
  }
}

function NotFound() {
  return (
    <>
      <PageHeading
        eyebrow="A small detour"
        title="Page not found"
        description="This address doesn’t lead to a workspace page."
      />
      <EmptyState
        title="Let’s find your way back"
        description="Your overview is a good place to start."
        action={
          <Link to="/" className="btn btn-primary">
            Back to overview
          </Link>
        }
      />
    </>
  );
}

export function App() {
  return (
    <AppErrorBoundary>
      <WorkspaceProvider>
        <HashRouter>
          <Routes>
            <Route element={<AppShell />}>
              <Route index element={<Overview />} />
              <Route path="projects" element={<Projects />} />
              <Route path="people" element={<People />} />
              <Route path="activity" element={<Activity />} />
              <Route path="elements" element={<Elements />} />
              <Route path="settings" element={<Settings />} />
              <Route path="*" element={<NotFound />} />
            </Route>
          </Routes>
        </HashRouter>
      </WorkspaceProvider>
    </AppErrorBoundary>
  );
}
