import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router';
import {
  IconPlus,
  IconArrowRight,
  IconArrowUpRight,
  IconHeart,
  IconLoader2,
  IconChevronDown,
  IconCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconCircleCheck,
  IconFolderPlus,
  IconExternalLink,
  IconCopy,
} from '@tabler/icons-react';
import { useWorkspace } from '../store';
import {
  Avatar,
  AvatarStack,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  Field,
  IconButton,
  PageHeading,
  Progress,
  StatusBadge,
} from '../components/ui';

export function Elements() {
  const { toast, data } = useWorkspace();
  const [loading, setLoading] = useState(false);
  const [liked, setLiked] = useState(false);
  const [dialog, setDialog] = useState(false);
  const [tab, setTab] = useState('Overview');
  const [enabled, setEnabled] = useState(true);
  const [range, setRange] = useState(60);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const simulate = () => {
    setLoading(true);
    timer.current = setTimeout(() => {
      setLoading(false);
      toast('All done. Your loading state is ready.');
    }, 1400);
  };
  return (
    <>
      <PageHeading
        eyebrow="Your building blocks"
        title="Small elements. Big possibilities."
        description="A thoughtful collection of everyday interface essentials."
        actions={<Badge tone="violet">Built with Tabler</Badge>}
      />
      <nav className="section-jumps" aria-label="Jump to element section">
        {[
          { label: 'Buttons', id: 'buttons' },
          { label: 'Forms', id: 'forms' },
          { label: 'Cards & navigation', id: 'patterns' },
          { label: 'Tables', id: 'tables' },
          { label: 'Feedback', id: 'feedback' },
        ].map((item) => (
          <Link key={item.id} to={`/elements?section=${item.id}`}>
            {item.label}
            <IconArrowUpRight size={14} />
          </Link>
        ))}
      </nav>
      <Card id="buttons" className="element-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">01 / Actions</span>
            <h2>Buttons that feel familiar</h2>
            <p>Clear intent, comfortable spacing and room for an icon.</p>
          </div>
        </div>
        <div className="element-demo">
          <Button onClick={() => toast('Primary action clicked.')}>
            <IconPlus size={17} />
            Primary action
          </Button>
          <Button variant="secondary" onClick={() => toast('Secondary action clicked.', 'info')}>
            Secondary
          </Button>
          <Button variant="ghost" onClick={() => toast('A quieter action.', 'info')}>
            Ghost button
            <IconArrowRight size={17} />
          </Button>
          <Button variant="danger" onClick={() => setDialog(true)}>
            Destructive
          </Button>
        </div>
        <div className="element-demo border-top">
          <Button disabled>Disabled</Button>
          <Button onClick={simulate} disabled={loading}>
            {loading ? (
              <>
                <IconLoader2 className="spin" size={17} />
                Working…
              </>
            ) : (
              'Try a loading state'
            )}
          </Button>
          <IconButton
            label={liked ? 'Remove from favourites' : 'Add to favourites'}
            onClick={() => setLiked((value) => !value)}
            aria-pressed={liked}
            className={liked ? 'liked' : ''}
          >
            <IconHeart size={20} fill={liked ? 'currentColor' : 'none'} />
          </IconButton>
          <details className="dropdown">
            <summary className="btn btn-secondary">
              More actions
              <IconChevronDown size={16} />
            </summary>
            <div className="dropdown-panel">
              <button
                onClick={(event) => {
                  toast('Sample duplicated.');
                  event.currentTarget.closest('details')?.removeAttribute('open');
                }}
              >
                <IconCopy size={16} />
                Duplicate item
              </button>
              <Link to="/settings">
                <IconExternalLink size={16} />
                Open settings
              </Link>
            </div>
          </details>
          <Link to="/projects" className="btn btn-secondary">
            Link button
            <IconArrowUpRight size={16} />
          </Link>
        </div>
      </Card>
      <div className="elements-grid">
        <Card id="forms" className="element-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">02 / Input</span>
              <h2>A little clarity in every field</h2>
              <p>Native controls with a consistent, rounded finish.</p>
            </div>
          </div>
          <form
            className="example-form"
            onSubmit={(event) => {
              event.preventDefault();
              toast('Example form submitted locally.');
            }}
          >
            <Field
              label="Project title"
              htmlFor="example-title"
              hint="A short, descriptive name works best."
            >
              <input
                className="form-control"
                id="example-title"
                placeholder="e.g. Something wonderful"
                required
                maxLength={80}
                aria-describedby="example-title-hint"
              />
            </Field>
            <div className="form-grid">
              <Field label="Category" htmlFor="example-category">
                <select className="form-select" id="example-category" required defaultValue="">
                  <option value="" disabled>
                    Select a category
                  </option>
                  <option>Product</option>
                  <option>Design</option>
                  <option>Operations</option>
                </select>
              </Field>
              <Field label="Start date" htmlFor="example-date">
                <input className="form-control" id="example-date" type="date" required />
              </Field>
            </div>
            <p className="field-hint">
              Need a team first? <Link to="/people">Add a teammate ↗</Link>
            </p>
            <Field label="Notes" htmlFor="example-notes" optional>
              <textarea
                className="form-control"
                id="example-notes"
                placeholder="A little more context…"
                rows={3}
                maxLength={500}
              />
            </Field>
            <Field
              label="Validation example"
              htmlFor="example-error"
              error="Use a valid email address, like hello@example.com."
            >
              <input
                className="form-control is-invalid"
                id="example-error"
                defaultValue="hello@"
                aria-invalid="true"
                aria-describedby="example-error-error"
              />
            </Field>
            <div className="inline-checks">
              <label className="form-check">
                <input type="checkbox" className="form-check-input" required />
                <span>Ready to begin</span>
              </label>
              <label className="form-check">
                <input type="checkbox" className="form-check-input" disabled />
                <span>Disabled option</span>
              </label>
            </div>
            <Button type="submit">
              Try validation <IconArrowRight size={17} />
            </Button>
          </form>
        </Card>
        <Card className="element-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">02 / Preferences</span>
              <h2>The finer details</h2>
              <p>Small controls for everyday decisions.</p>
            </div>
          </div>
          <label className="preference-row">
            <span>
              <strong>Enable notifications</strong>
              <small>{enabled ? 'A little nudge when it matters.' : 'A quieter workspace.'}</small>
            </span>
            <input
              type="checkbox"
              role="switch"
              className="form-check-input switch-input"
              checked={enabled}
              onChange={(event) => setEnabled(event.target.checked)}
            />
          </label>
          <fieldset className="radio-group">
            <legend>Project visibility</legend>
            <label className="form-check">
              <input className="form-check-input" type="radio" name="visibility" defaultChecked />
              <span>Everyone in the workspace</span>
            </label>
            <label className="form-check">
              <input className="form-check-input" type="radio" name="visibility" />
              <span>Only invited members</span>
            </label>
          </fieldset>
          <Field label={`Progress · ${range}%`} htmlFor="example-range">
            <input
              className="form-range"
              id="example-range"
              type="range"
              min={0}
              max={100}
              step={5}
              value={range}
              onChange={(event) => setRange(Number(event.target.value))}
            />
          </Field>
          <Progress value={range} label="Example project progress" />
          <div className="swatch-section">
            <h3>Colour, with purpose</h3>
            <div className="badge-demo">
              <Badge tone="teal" dot>
                Success
              </Badge>
              <Badge tone="blue" dot>
                Information
              </Badge>
              <Badge tone="violet" dot>
                In review
              </Badge>
              <Badge tone="rose" dot>
                Attention
              </Badge>
              <Badge tone="amber" dot>
                Pending
              </Badge>
              <Badge>Neutral</Badge>
            </div>
          </div>
          <div className="swatch-section">
            <h3>A familiar face</h3>
            <div className="element-demo">
              <Avatar name="Alex Morgan" />
              <Avatar name="Jamie Lee" tone="violet" />
              <Avatar name="Sam Taylor" tone="rose" />
              <AvatarStack
                names={['Alex Morgan', 'Jamie Lee', 'Sam Taylor', 'Robin Chen', 'Taylor Blake']}
              />
            </div>
          </div>
        </Card>
      </div>
      <Card id="patterns" className="element-section">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">03 / Patterns</span>
            <h2>Keep the bigger picture simple</h2>
            <p>Organise related content with tabs and a little progressive disclosure.</p>
          </div>
        </div>
        <div className="tabs" role="tablist" aria-label="Example tabs">
          {['Overview', 'Details', 'Notes'].map((value) => (
            <button
              key={value}
              role="tab"
              id={`tab-${value}`}
              aria-selected={tab === value}
              aria-controls="example-tab-panel"
              tabIndex={tab === value ? 0 : -1}
              className={tab === value ? 'active' : ''}
              onClick={() => setTab(value)}
              onKeyDown={(event) => {
                const values = ['Overview', 'Details', 'Notes'];
                const index = values.indexOf(tab);
                if (['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) {
                  event.preventDefault();
                  const next =
                    event.key === 'Home'
                      ? values[0]
                      : event.key === 'End'
                        ? values[2]
                        : values[(index + (event.key === 'ArrowRight' ? 1 : 2)) % 3];
                  setTab(next);
                  document.getElementById(`tab-${next}`)?.focus();
                }
              }}
            >
              {value}
            </button>
          ))}
        </div>
        <div
          className="tab-panel"
          id="example-tab-panel"
          role="tabpanel"
          aria-labelledby={`tab-${tab}`}
          tabIndex={0}
        >
          <h3>
            {tab === 'Overview'
              ? 'A calm place for the essentials.'
              : tab === 'Details'
                ? 'The details, when you need them.'
                : 'Leave a little room for context.'}
          </h3>
          <p>
            {tab === 'Overview'
              ? 'Use this pattern for a project summary, account details or a customer profile. Each tab has proper keyboard support.'
              : tab === 'Details'
                ? 'Labels, values and supporting copy work well here. Keep related information together and give each section a clear title.'
                : 'Longer notes and supporting information can live in their own tab, keeping the first view focused.'}
          </p>
        </div>
        <div className="accordion-group">
          <details>
            <summary>
              Can I use this for a different kind of business?
              <IconChevronDown size={17} />
            </summary>
            <p>
              Yes. Replace the branding, navigation and demo pages in the configuration. The shared
              shell and elements can stay.
            </p>
          </details>
          <details>
            <summary>
              Does this include authentication or a backend?
              <IconChevronDown size={17} />
            </summary>
            <p>
              This is a frontend starter. Connect your own services and enforce permissions on the
              server.
            </p>
          </details>
        </div>
      </Card>
      <Card id="tables" className="element-section flush-card">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">04 / Data</span>
            <h2>Room for the details</h2>
            <p>Tables become labelled cards on small screens.</p>
          </div>
          <Link className="text-link" to="/people">
            Full example
            <IconArrowUpRight size={16} />
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Department</th>
                <th>Role</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.people.slice(0, 3).map((person) => (
                <tr key={person.id}>
                  <td data-label="Name">
                    <div className="person-cell">
                      <Avatar name={person.name} tone={person.tone} />
                      <span>
                        <strong>{person.name}</strong>
                        <small className="cell-subtitle">{person.email}</small>
                      </span>
                    </div>
                  </td>
                  <td data-label="Department">{person.department}</td>
                  <td data-label="Role">
                    <Badge>{person.role}</Badge>
                  </td>
                  <td data-label="Status">
                    <StatusBadge status={person.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <div className="elements-grid">
        <Card id="feedback" className="element-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">05 / Feedback</span>
              <h2>A gentle nudge in the right direction</h2>
              <p>Useful feedback, without getting in the way.</p>
            </div>
          </div>
          <div className="demo-alert tone-blue">
            <IconInfoCircle size={21} />
            <div>
              <strong>A little heads up</strong>
              <p>Your workspace preferences are stored locally.</p>
            </div>
          </div>
          <div className="demo-alert tone-teal">
            <IconCircleCheck size={21} />
            <div>
              <strong>Everything is in place</strong>
              <p>Your changes have been saved successfully.</p>
            </div>
          </div>
          <div className="demo-alert tone-amber">
            <IconAlertTriangle size={21} />
            <div>
              <strong>One more thing</strong>
              <p>Review your changes before continuing.</p>
            </div>
          </div>
          <div className="element-demo">
            <Button variant="secondary" onClick={() => toast('A small success worth noticing.')}>
              <IconCheck size={17} />
              Show toast
            </Button>
            <Button variant="secondary" onClick={() => setDialog(true)}>
              Open dialog
            </Button>
          </div>
        </Card>
        <Card className="element-section">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">05 / Empty states</span>
              <h2>A helpful starting point</h2>
              <p>Make it clear what someone can do next.</p>
            </div>
          </div>
          <EmptyState
            title="Your next idea goes here"
            description="Nothing to see just yet. Give your first project a name and let’s get started."
            action={
              <Link to="/projects" className="btn btn-primary">
                <IconFolderPlus size={18} />
                Explore projects
              </Link>
            }
          />
        </Card>
      </div>
      <Dialog
        open={dialog}
        onClose={() => setDialog(false)}
        title="A moment to double-check"
        description="Dialogs work best when they help someone make a clear decision."
      >
        <div className="dialog-body">
          <p>
            This is an example confirmation. Escape, the close button, and clicking outside all
            dismiss it. Keyboard focus stays inside while it’s open.
          </p>
          <div className="dialog-actions">
            <Button variant="secondary" onClick={() => setDialog(false)}>
              Go back
            </Button>
            <Button
              onClick={() => {
                setDialog(false);
                toast('Confirmed. You’re all set.');
              }}
            >
              Looks good
              <IconCheck size={17} />
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
