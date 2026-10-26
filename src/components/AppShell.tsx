import { useEffect, useRef, useState } from 'react';
import { Link, Outlet, useLocation } from 'react-router';
import {
  IconArrowUpRight,
  IconBell,
  IconChevronDown,
  IconCommand,
  IconHelpCircle,
  IconMoon,
  IconSearch,
  IconSettings,
  IconSun,
  IconCheck,
  IconExternalLink,
} from '@tabler/icons-react';
import { dashboardConfig } from '../config';
import { useWorkspace } from '../store';
import { Avatar, Badge, IconButton, ToastRegion } from './ui';
import { CommandSearch } from './CommandSearch';
import { GuidePanel } from './GuidePanel';
import { GroupedNavigation } from './GroupedNavigation';
import { installPortalMotion, revealPortalElements, topPortalLayer } from '../lib/motion';

export function BrandMark() {
  return (
    <span className="brand-mark" aria-hidden="true">
      <i />
      <i />
      <i />
      <i />
    </span>
  );
}

export function AppShell() {
  const { preferences, toggleTheme } = useWorkspace();
  const [searchOpen, setSearchOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const accountRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const current = dashboardConfig.navigation
    .flatMap((group) => group.items)
    .find((item) => item.to === location.pathname);
  const title = current?.label || 'Page not found';

  useEffect(() => installPortalMotion(), []);

  useEffect(() => {
    const keydown = (event: KeyboardEvent) => {
      const topLayer = topPortalLayer();
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        if (topLayer && !topLayer.classList.contains('command-dialog')) return;
        event.preventDefault();
        setSearchOpen((open) => !open);
      }
      if (event.key === 'Escape' && !topLayer) setAccountOpen(false);
    };
    const outside = (event: PointerEvent) => {
      if (!accountRef.current?.contains(event.target as Node)) setAccountOpen(false);
    };
    document.addEventListener('keydown', keydown);
    document.addEventListener('pointerdown', outside);
    return () => {
      document.removeEventListener('keydown', keydown);
      document.removeEventListener('pointerdown', outside);
    };
  }, []);

  useEffect(() => {
    document.title = `${title} · ${dashboardConfig.name}`;
    setAccountOpen(false);
    let timer: ReturnType<typeof setTimeout> | undefined;
    const frame = requestAnimationFrame(() => {
      revealPortalElements();
      const section = new URLSearchParams(location.search).get('section');
      const target = section && document.getElementById(section);
      if (target) {
        target.scrollIntoView({
          behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
          block: 'start',
        });
        target.classList.add('section-highlight');
        const heading = target.querySelector<HTMLElement>('h2');
        heading?.setAttribute('tabindex', '-1');
        heading?.focus({ preventScroll: true });
        timer = setTimeout(() => target.classList.remove('section-highlight'), 2400);
      } else {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.getElementById('page-title')?.focus({ preventScroll: true });
      }
    });
    return () => {
      cancelAnimationFrame(frame);
      if (timer) clearTimeout(timer);
    };
  }, [location.pathname, location.search, location.key, title]);

  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          document.getElementById('main-content')?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="app-header">
        <Link to="/" className="brand" aria-label={`${dashboardConfig.name} home`}>
          <BrandMark />
          <span>
            {dashboardConfig.name}
            <span className="brand-dot">.</span>
          </span>
        </Link>
        <div className="header-workspace">
          <span className="workspace-live-dot" />
          {preferences.workspace}
          <Badge tone="neutral">Demo</Badge>
        </div>
        <div className="header-actions">
          <Link
            className="icon-button btn btn-ghost"
            to="/activity"
            aria-label="View activity"
            title="View activity"
          >
            <IconBell size={20} />
            <span className="notification-dot" />
          </Link>
          <IconButton label="Toggle light or dark appearance" onClick={toggleTheme}>
            <IconSun className="show-in-dark" size={20} />
            <IconMoon className="show-in-light" size={20} />
          </IconButton>
          <Link to="/settings" className="mobile-account" aria-label="Open profile settings">
            <Avatar name={preferences.name} />
          </Link>
        </div>
      </header>
      <aside className="sidebar" aria-label="Workspace navigation">
        <button className="search-trigger" onClick={() => setSearchOpen(true)}>
          <IconSearch size={18} />
          <span>Search workspace</span>
          <kbd>
            <IconCommand size={11} /> K
          </kbd>
        </button>
        <nav className="sidebar-scroll">
          <GroupedNavigation />
          <div className="sidebar-note">
            <span className="note-icon">
              <IconHelpCircle size={18} />
            </span>
            <strong>A place for your next idea</strong>
            <p>
              Start with the essentials.
              <br />
              Make the rest your own.
            </p>
            <Link to="/elements">
              Explore the elements <IconArrowUpRight size={15} />
            </Link>
          </div>
        </nav>
        <div className="account-area" ref={accountRef}>
          {accountOpen && (
            <div className="account-menu">
              <p className="menu-label">Your demo workspace</p>
              <Link to="/settings">
                <IconSettings size={17} />
                Profile & preferences
              </Link>
              <button
                onClick={() => {
                  toggleTheme();
                  setAccountOpen(false);
                }}
              >
                <IconSun size={17} />
                Switch appearance
              </button>
              <a href={dashboardConfig.repository} target="_blank" rel="noreferrer">
                <IconExternalLink size={17} />
                View source on GitHub
              </a>
              <div className="menu-caption">
                <IconCheck size={14} />
                Everything stays in this browser
              </div>
            </div>
          )}
          <button
            className="account-profile"
            onClick={() => setAccountOpen((open) => !open)}
            aria-expanded={accountOpen}
            aria-label={`Account menu for ${preferences.name}`}
          >
            <Avatar name={preferences.name} />
            <span>
              <strong>{preferences.name}</strong>
              <small>Demo administrator</small>
            </span>
            <IconChevronDown size={15} />
          </button>
          <Link
            to="/settings"
            className="account-settings icon-button btn btn-ghost"
            aria-label="Settings"
            title="Settings"
          >
            <IconSettings size={19} />
          </Link>
        </div>
      </aside>
      <div className="mobile-search-bar">
        <button className="search-trigger" onClick={() => setSearchOpen(true)}>
          <IconSearch size={19} />
          <span>Search pages & features</span>
          <span className="mobile-search-hint">
            Explore <IconArrowUpRight size={15} />
          </span>
        </button>
      </div>
      <main id="main-content" className="main-content" tabIndex={-1}>
        <div className="content-container">
          <div className="breadcrumb-row">
            <nav aria-label="Breadcrumb">
              <Link to="/">Workspace</Link>
              <span>/</span>
              <span aria-current="page">{title}</span>
            </nav>
            <span className="local-demo">
              <span />
              Local demo workspace
            </span>
          </div>
          <Outlet />
          <footer className="page-footer">
            <span>Made for your next idea.</span>
            <a href={dashboardConfig.repository} target="_blank" rel="noreferrer">
              Workspace is open source <IconArrowUpRight size={14} />
            </a>
          </footer>
        </div>
      </main>
      <CommandSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <GuidePanel page={title} />
      <ToastRegion />
    </>
  );
}
