import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router';
import { IconChevronRight, IconLayoutDashboard } from '@tabler/icons-react';
import { dashboardConfig } from '../config';
import { animatePortalElement } from '../lib/motion';

/** Ordinary navigation links in compact flyouts, with a narrow-screen search fallback. */
export function GroupedNavigation() {
  const location = useLocation();
  const [open, setOpen] = useState<number | null>(null);
  const [top, setTop] = useState(140);
  const panel = useRef<HTMLDivElement>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  useEffect(() => {
    setOpen(null);
  }, [location.key]);
  useEffect(() => {
    if (open === null) return;
    const index = open;
    const focus = requestAnimationFrame(() => {
      if (panel.current) {
        void animatePortalElement(
          panel.current,
          { x: 0, y: 0, opacity: 1, scale: 1 },
          { initial: { x: -8, y: 5, opacity: 0.3, scale: 0.98 }, response: 0.32, damping: 0.9 },
        );
        panel.current.querySelector<HTMLAnchorElement>('a')?.focus();
      }
    });
    const outside = (event: PointerEvent) => {
      if (
        !panel.current?.contains(event.target as Node) &&
        !triggers.current[index]?.contains(event.target as Node)
      )
        setOpen(null);
    };
    const escape = (event: KeyboardEvent) => {
      if (document.querySelector('dialog[open]')) return;
      if (event.key === 'Escape') {
        setOpen(null);
        triggers.current[index]?.focus();
      }
    };
    const resize = () => setOpen(null);
    document.addEventListener('pointerdown', outside);
    document.addEventListener('keydown', escape);
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(focus);
      document.removeEventListener('pointerdown', outside);
      document.removeEventListener('keydown', escape);
      window.removeEventListener('resize', resize);
    };
  }, [open]);
  return (
    <div className="grouped-navigation">
      <Link
        to="/"
        className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}
        aria-current={location.pathname === '/' ? 'page' : undefined}
      >
        <IconLayoutDashboard size={20} />
        <span>Overview</span>
        {location.pathname === '/' && <span className="nav-active-dot" />}
      </Link>
      <p className="nav-group-label">Work areas</p>
      {dashboardConfig.navigation.map((group, index) => {
        const items = group.items.filter((item) => item.to !== '/');
        if (!items.length) return null;
        const selected = items.some((item) => item.to === location.pathname);
        const GroupIcon = items[0].icon;
        return (
          <button
            key={group.label}
            data-nav-trigger
            ref={(element) => {
              triggers.current[index] = element;
            }}
            className={`nav-item nav-group-trigger ${selected ? 'active' : ''}`}
            aria-expanded={open === index}
            aria-controls={`nav-flyout-${index}`}
            onClick={(event) => {
              setTop(
                Math.max(
                  86,
                  Math.min(
                    event.currentTarget.getBoundingClientRect().top,
                    window.innerHeight - 300,
                  ),
                ),
              );
              setOpen(open === index ? null : index);
            }}
          >
            <GroupIcon size={20} />
            <span>{group.label}</span>
            <IconChevronRight size={16} />
          </button>
        );
      })}
      {open !== null &&
        createPortal(
          <div ref={panel} id={`nav-flyout-${open}`} className="nav-flyout" style={{ top }}>
            <p className="nav-group-label">{dashboardConfig.navigation[open].label}</p>
            <nav aria-label={dashboardConfig.navigation[open].label}>
              {dashboardConfig.navigation[open].items
                .filter((item) => item.to !== '/')
                .map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className={`nav-item ${location.pathname === item.to ? 'active' : ''}`}
                    aria-current={location.pathname === item.to ? 'page' : undefined}
                  >
                    <item.icon size={19} />
                    <span>
                      <strong>{item.label}</strong>
                      <small>{item.description}</small>
                    </span>
                    <IconChevronRight size={15} />
                  </Link>
                ))}
            </nav>
          </div>,
          document.body,
        )}
    </div>
  );
}
