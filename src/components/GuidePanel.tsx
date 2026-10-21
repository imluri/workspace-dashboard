import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import {
  IconArrowUp,
  IconArrowsDiagonal,
  IconArrowsDiagonalMinimize2,
  IconMessageCircle,
  IconX,
  IconArrowUpRight,
} from '@tabler/icons-react';
import { searchEntries } from '../config';
import { Button, IconButton } from './ui';

type Message = {
  id: string;
  role: 'user' | 'guide';
  text: string;
  links?: { label: string; to: string }[];
};
const quickLinks = searchEntries.filter((entry) =>
  ['Projects', 'People', 'Forms & inputs', 'Appearance'].includes(entry.label),
);

/** UI-only helper. Replace reply() with your own authenticated server integration. */
export function GuidePanel({ page }: { page: string }) {
  const [open, setOpen] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [size, setSize] = useState({ width: 400, height: 570 });
  const [drag, setDrag] = useState<{ x: number; y: number; width: number; height: number } | null>(
    null,
  );
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const launcher = useRef<HTMLButtonElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const composer = useRef<HTMLTextAreaElement>(null);
  const panel = useRef<HTMLElement>(null);
  const location = useLocation();
  const previousRoute = useRef(location.key);

  useEffect(() => {
    if (open) closeButton.current?.focus();
  }, [open]);
  useEffect(() => {
    if (!fullscreen || !open) return;
    const background = document.querySelectorAll<HTMLElement>(
      '.app-header, .sidebar, .mobile-search-bar, .main-content',
    );
    background.forEach((element) => {
      element.inert = true;
    });
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButton.current?.focus();
    return () => {
      background.forEach((element) => {
        element.inert = false;
      });
      document.body.style.overflow = previousOverflow;
    };
  }, [fullscreen, open]);
  useEffect(() => {
    if (previousRoute.current !== location.key) {
      setFullscreen(false);
      if (window.innerWidth <= 860) setOpen(false);
    }
    previousRoute.current = location.key;
  }, [location.key]);
  useEffect(() => {
    body.current?.scrollTo({ top: body.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);
  useEffect(() => {
    if (!composer.current) return;
    composer.current.style.height = '42px';
    composer.current.style.height = `${Math.min(100, Math.max(42, composer.current.scrollHeight))}px`;
  }, [message, open]);
  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) =>
      setSize({
        width: Math.max(320, Math.min(window.innerWidth - 40, drag.width + drag.x - event.clientX)),
        height: Math.max(
          360,
          Math.min(window.innerHeight - 100, drag.height + drag.y - event.clientY),
        ),
      });
    const end = () => setDrag(null);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', end);
    window.addEventListener('pointercancel', end);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', end);
      window.removeEventListener('pointercancel', end);
    };
  }, [drag]);

  const close = () => {
    setOpen(false);
    setFullscreen(false);
    launcher.current?.focus();
  };
  const reply = (text: string) => {
    if (!text.trim()) return;
    const terms = text
      .toLowerCase()
      .split(/\W+/)
      .filter((term) => term.length > 2);
    const matches = searchEntries
      .filter((entry) =>
        terms.some((term) => `${entry.label} ${entry.description}`.toLowerCase().includes(term)),
      )
      .slice(0, 3);
    setMessages((current) => [
      ...current,
      { id: crypto.randomUUID(), role: 'user', text: text.trim() },
      {
        id: crypto.randomUUID(),
        role: 'guide',
        text: matches.length
          ? 'Here are a few places to try. Each link opens the page and takes you to the right section.'
          : `You’re on ${page}. Try a project, explore the reusable elements, or adjust your workspace’s appearance.`,
        links: (matches.length ? matches : quickLinks.slice(0, 3)).map((entry) => ({
          label: entry.label,
          to: entry.to,
        })),
      },
    ]);
    setMessage('');
  };

  return (
    <>
      {open && (
        <section
          ref={panel}
          className={`guide-panel ${fullscreen ? 'fullscreen' : ''} ${drag ? 'is-resizing' : ''}`}
          style={fullscreen ? undefined : { width: size.width, height: size.height }}
          role={fullscreen ? 'dialog' : 'region'}
          aria-label="Demo workspace guide"
          aria-modal={fullscreen || undefined}
          onKeyDown={(event) => {
            if (event.key === 'Escape') {
              event.stopPropagation();
              close();
            }
            if (fullscreen && event.key === 'Tab') {
              const focusable = panel.current?.querySelectorAll<HTMLElement>(
                'button, a[href], textarea, [tabindex="0"]',
              );
              if (!focusable?.length) return;
              const first = focusable[0];
              const last = focusable[focusable.length - 1];
              if (event.shiftKey && document.activeElement === first) {
                event.preventDefault();
                last.focus();
              } else if (!event.shiftKey && document.activeElement === last) {
                event.preventDefault();
                first.focus();
              }
            }
          }}
        >
          {!fullscreen && (
            <button
              className="guide-resize"
              aria-label="Resize guide. Use arrow keys to adjust."
              title="Drag to resize"
              onPointerDown={(event) => {
                event.preventDefault();
                setDrag({ x: event.clientX, y: event.clientY, ...size });
              }}
              onKeyDown={(event) => {
                const step = event.shiftKey ? 40 : 16;
                if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(event.key)) {
                  event.preventDefault();
                  setSize((current) => ({
                    width: Math.min(
                      window.innerWidth - 40,
                      Math.max(
                        320,
                        current.width +
                          (event.key === 'ArrowLeft'
                            ? step
                            : event.key === 'ArrowRight'
                              ? -step
                              : 0),
                      ),
                    ),
                    height: Math.min(
                      window.innerHeight - 100,
                      Math.max(
                        360,
                        current.height +
                          (event.key === 'ArrowUp' ? step : event.key === 'ArrowDown' ? -step : 0),
                      ),
                    ),
                  }));
                }
              }}
            >
              <IconArrowsDiagonal size={13} />
            </button>
          )}
          <header className="guide-header">
            <span className="guide-symbol">
              <IconMessageCircle size={20} />
            </span>
            <div>
              <strong>Workspace guide</strong>
              <small>On {page}</small>
            </div>
            <IconButton
              label={fullscreen ? 'Exit fullscreen' : 'Expand guide'}
              onClick={() => setFullscreen((value) => !value)}
            >
              {fullscreen ? (
                <IconArrowsDiagonalMinimize2 size={19} />
              ) : (
                <IconArrowsDiagonal size={19} />
              )}
            </IconButton>
            <button
              ref={closeButton}
              className="btn btn-ghost icon-button"
              aria-label="Close guide"
              onClick={close}
            >
              <IconX size={19} />
            </button>
          </header>
          <div className="guide-body" ref={body}>
            {!messages.length ? (
              <div className="guide-welcome">
                <span className="eyebrow">A helpful starting point</span>
                <h2>What’s next?</h2>
                <p>Find your way around, explore an element, or make this space your own.</p>
                <div className="guide-quick-links">
                  {quickLinks.map((entry) => (
                    <Link key={entry.to} to={entry.to}>
                      <entry.icon size={18} />
                      {entry.label}
                      <IconArrowUpRight size={16} />
                    </Link>
                  ))}
                </div>
                <span className="guide-demo-label">Local demo · no AI service connected</span>
              </div>
            ) : (
              <>
                <div className="guide-reset">
                  <Button variant="ghost" onClick={() => setMessages([])}>
                    New conversation
                  </Button>
                </div>
                {messages.map((item) => (
                  <div className={`guide-message ${item.role}`} key={item.id}>
                    <small>{item.role === 'user' ? 'You' : 'Demo guide'}</small>
                    <p>{item.text}</p>
                    {item.links?.map((link) => (
                      <Link key={link.to} to={link.to} className="guide-result">
                        {link.label}
                        <IconArrowUpRight size={15} />
                      </Link>
                    ))}
                  </div>
                ))}
              </>
            )}
          </div>
          <form
            className="guide-composer"
            onSubmit={(event) => {
              event.preventDefault();
              reply(message);
            }}
          >
            <label className="visually-hidden" htmlFor="guide-message">
              Ask about the workspace
            </label>
            <div className="composer-input">
              <textarea
                ref={composer}
                id="guide-message"
                placeholder="Where would you like to go?"
                value={message}
                maxLength={1000}
                rows={1}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (
                    event.key === 'Enter' &&
                    !event.shiftKey &&
                    !event.nativeEvent.isComposing &&
                    event.keyCode !== 229
                  ) {
                    event.preventDefault();
                    reply(message);
                  }
                }}
              />
              <button
                className="composer-send"
                type="submit"
                aria-label="Send message"
                disabled={!message.trim()}
              >
                <IconArrowUp size={21} />
              </button>
            </div>
            <p>
              Enter to send <span>·</span> Shift + Enter for a new line
            </p>
          </form>
        </section>
      )}
      <button
        ref={launcher}
        className={`guide-launcher ${open ? 'is-open' : ''}`}
        onClick={() => (open ? close() : setOpen(true))}
        aria-label={open ? 'Close workspace guide' : 'Open workspace guide'}
        aria-expanded={open}
        title="Workspace guide"
      >
        {open ? <IconX size={24} /> : <IconMessageCircle size={25} />}
      </button>
    </>
  );
}
