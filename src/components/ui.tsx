import { useEffect, useId, useRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import {
  IconX,
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconSearch,
} from '@tabler/icons-react';
import { initials } from '../data';
import { useWorkspace } from '../store';
import { openPortalLayer, closePortalLayer, topPortalLayer } from '../lib/motion';

export function Button({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  children: ReactNode;
}) {
  return (
    <button type="button" className={`btn btn-${variant} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function IconButton({
  label,
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { label: string; children: ReactNode }) {
  return (
    <Button
      variant="ghost"
      className={`icon-button ${className}`}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </Button>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow: string;
  title: string;
  description: string;
  actions?: ReactNode;
}) {
  return (
    <div className="page-heading">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h1 tabIndex={-1} id="page-title">
          {title}
        </h1>
        <p className="page-description">{description}</p>
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </div>
  );
}

export function Card({
  children,
  className = '',
  id,
}: {
  children: ReactNode;
  className?: string;
  id?: string;
}) {
  return (
    <section id={id} className={`card panel ${className}`} data-motion-enter>
      {children}
    </section>
  );
}

export function Badge({
  children,
  tone = 'neutral',
  dot = false,
}: {
  children: ReactNode;
  tone?: string;
  dot?: boolean;
}) {
  return (
    <span className={`status-badge tone-${tone}`}>
      {dot && <span className="status-dot" />}
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const tones: Record<string, string> = {
    'In progress': 'blue',
    'In review': 'violet',
    Planned: 'neutral',
    Complete: 'teal',
    Active: 'teal',
    Invited: 'amber',
  };
  return (
    <Badge tone={tones[status] || 'neutral'} dot>
      {status}
    </Badge>
  );
}

export function Avatar({
  name,
  tone = 'teal',
  size = '',
}: {
  name: string;
  tone?: string;
  size?: 'small' | 'large' | '';
}) {
  return (
    <span className={`person-avatar tone-${tone} ${size}`} aria-label={name} title={name}>
      {initials(name)}
    </span>
  );
}

export function AvatarStack({ names }: { names: string[] }) {
  return (
    <div className="avatar-stack">
      {names.slice(0, 3).map((name, index) => (
        <Avatar key={name} name={name} size="small" tone={['teal', 'violet', 'rose'][index]} />
      ))}
      {names.length > 3 && <span className="person-avatar small">+{names.length - 3}</span>}
    </div>
  );
}

export function Progress({ value, label }: { value: number; label: string }) {
  const safeValue = Math.max(0, Math.min(100, value));
  return (
    <div
      className="progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={safeValue}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="progress-bar" style={{ width: `${safeValue}%` }} />
    </div>
  );
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  children,
  optional,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  children: ReactNode;
  optional?: boolean;
}) {
  return (
    <div className="field">
      <label className="form-label" htmlFor={htmlFor}>
        {label}
        {optional && <span className="optional">Optional</span>}
      </label>
      {children}
      {hint && (
        <p id={`${htmlFor}-hint`} className="field-hint">
          {hint}
        </p>
      )}
      {error && (
        <p id={`${htmlFor}-error`} className="field-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  className = '',
  busy = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
  busy?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  // Preserve details while the close spring runs, including route-owned conditional content.
  const snapshot = useRef({ title, description, children });
  if (open) snapshot.current = { title, description, children };
  const rendered = snapshot.current;
  const titleId = useId();
  const descriptionId = useId();
  useEffect(() => {
    const dialog = ref.current;
    if (open && dialog) {
      openPortalLayer(dialog);
      dialog.querySelector<HTMLElement>('[data-autofocus]')?.focus();
    }
    if (!open && dialog?.open) void closePortalLayer(dialog);
  }, [open]);
  return (
    <dialog
      ref={ref}
      aria-busy={busy || undefined}
      data-layer-busy={busy ? 'true' : undefined}
      className={`workspace-dialog ${className}`}
      aria-labelledby={titleId}
      aria-describedby={rendered.description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        if (!busy && topPortalLayer() === event.currentTarget) onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (busy || topPortalLayer() !== event.currentTarget) return;
        if (event.target === event.currentTarget) {
          const box = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < box.left ||
            event.clientX > box.right ||
            event.clientY < box.top ||
            event.clientY > box.bottom
          )
            onClose();
        }
      }}
    >
      <div className="dialog-header" data-layer-handle>
        <div>
          <h2 id={titleId}>{rendered.title}</h2>
          {rendered.description && <p id={descriptionId}>{rendered.description}</p>}
        </div>
        <IconButton label="Close dialog" onClick={onClose} disabled={busy}>
          <IconX size={20} />
        </IconButton>
      </div>
      {rendered.children}
    </dialog>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="empty-state">
      <span className="empty-icon">
        <IconSearch size={26} />
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}

export function ToastRegion() {
  const { toasts, dismissToast } = useWorkspace();
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="false">
      {toasts.map((item) => (
        <div className={`workspace-toast ${item.tone}`} key={item.id} role="status">
          {item.tone === 'danger' ? (
            <IconAlertTriangle size={20} />
          ) : item.tone === 'info' ? (
            <IconInfoCircle size={20} />
          ) : (
            <IconCircleCheck size={20} />
          )}
          <span>{item.message}</span>
          <IconButton label="Dismiss notification" onClick={() => dismissToast(item.id)}>
            <IconX size={16} />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
