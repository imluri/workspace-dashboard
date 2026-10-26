import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import {
  IconArrowUpRight,
  IconPlus,
  IconUserPlus,
  IconFolder,
  IconUsers,
  IconChartBar,
  IconPalette,
  IconDownload,
  IconArrowRight,
  IconCheck,
  IconCalendar,
  IconRefresh,
  IconAdjustments,
  IconClock,
} from '@tabler/icons-react';
import { useWorkspace, downloadCsv } from '../store';
import {
  Avatar,
  AvatarStack,
  Badge,
  Button,
  Card,
  PageHeading,
  Progress,
  StatusBadge,
} from '../components/ui';
import { ProjectDialog, PersonDialog } from '../components/RecordDialogs';
import { formatDate } from '../data';
import { revealPortalElements } from '../lib/motion';

const sections = {
  shortcuts: 'Quick actions',
  analytics: 'Operational summaries',
  desks: 'Work areas',
  overview: 'At a glance',
  queues: 'Work queues',
  projects: 'Project table',
  activity: 'Recent activity',
};
type Section = keyof typeof sections;
function readHidden(): Section[] {
  try {
    const value: unknown = JSON.parse(localStorage.getItem('workspace.overview.hidden.v1') || '[]');
    return Array.isArray(value)
      ? [
          ...new Set(
            value.filter(
              (key): key is Section => typeof key === 'string' && Object.hasOwn(sections, key),
            ),
          ),
        ]
      : [];
  } catch {
    return [];
  }
}

export function Overview() {
  const { data, preferences, toast } = useWorkspace();
  const [projectOpen, setProjectOpen] = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const [hidden, setHidden] = useState(readHidden);
  const [updatedAt, setUpdatedAt] = useState(() => new Date());
  const [refreshed, setRefreshed] = useState(false);
  useEffect(() => {
    revealPortalElements();
  }, [hidden]);
  const active = data.projects.filter((p) => p.status !== 'Complete').length;
  const complete = data.projects.filter((p) => p.status === 'Complete').length;
  const review = data.projects.filter((p) => p.status === 'In review').length;
  const planned = data.projects.filter((p) => p.status === 'Planned').length;
  const invited = data.people.filter((person) => person.status === 'Invited').length;
  const show = (key: Section) => !hidden.includes(key);
  const customize = (next: Section[]) => {
    setHidden(next);
    try {
      localStorage.setItem('workspace.overview.hidden.v1', JSON.stringify(next));
    } catch {
      toast('Display preferences apply for this visit. Browser storage is unavailable.', 'info');
    }
  };
  const exportOverview = () => {
    downloadCsv('workspace-overview.csv', [
      ['Metric', 'Value', 'Basis'],
      ['Active projects', active, 'Current browser demo records; excludes Complete'],
      ['Complete projects', complete, 'Current browser demo records'],
      ['Projects needing review', review, 'Current browser demo records; In review status'],
      ['Team members', data.people.length, 'Current browser demo records; includes invitations'],
      ['Open invitations', invited, 'Demo only; no email sent'],
      ['Issued invoices (USD)', 24000, 'Fixed fictional example; excludes void invoices'],
      ['Recorded receipts (USD)', 18500, 'Fixed fictional example; not bank settlement'],
      ['Outstanding (USD)', 5500, 'Fixed fictional example'],
      [
        'Booked space hours',
        86,
        'Fixed fictional example; 1–28 November 2026; overlaps counted once',
      ],
      ['Exported at', new Date().toISOString(), 'Browser time; no backend connection'],
    ]);
    toast('Overview CSV downloaded. Display preferences do not change the export.');
  };
  const actions = [
    {
      label: 'New project',
      sub: 'Create without leaving this page',
      icon: IconPlus,
      tone: 'teal',
      action: () => setProjectOpen(true),
    },
    {
      label: 'Add teammate',
      sub: 'Prepare a demo invitation',
      icon: IconUserPlus,
      tone: 'violet',
      action: () => setPersonOpen(true),
    },
    {
      label: 'View activity',
      sub: 'Catch up with your workspace',
      icon: IconChartBar,
      tone: 'blue',
      to: '/activity',
    },
    {
      label: 'Explore elements',
      sub: 'Forms, tables and layered dialogs',
      icon: IconPalette,
      tone: 'rose',
      to: '/elements',
    },
  ];
  const areas = [
    {
      title: 'Projects & delivery',
      description: 'Plan work, track progress and manage delivery.',
      icon: IconFolder,
      tone: 'teal',
      links: [
        { label: 'Project register', to: '/projects' },
        { label: 'Delivery activity', to: '/activity' },
        { label: 'Project table elements', to: '/elements?section=tables' },
      ],
    },
    {
      title: 'People & workspace',
      description: 'Teammates, invitations and local preferences.',
      icon: IconUsers,
      tone: 'violet',
      links: [
        { label: 'Team directory', to: '/people' },
        { label: 'Workspace preferences', to: '/settings' },
        { label: 'Appearance', to: '/settings?section=appearance' },
      ],
    },
    {
      title: 'Reports & insights',
      description: 'A clear view of current work and activity.',
      icon: IconChartBar,
      tone: 'blue',
      links: [
        { label: 'Activity timeline', to: '/activity' },
        { label: 'Projects in motion', to: '/projects' },
        { label: 'Feedback elements', to: '/elements?section=feedback' },
      ],
    },
    {
      title: 'Your building blocks',
      description: 'Reusable elements for the next business.',
      icon: IconPalette,
      tone: 'rose',
      links: [
        { label: 'Interface elements', to: '/elements' },
        { label: 'Forms & inputs', to: '/elements?section=forms' },
        { label: 'Buttons & actions', to: '/elements?section=buttons' },
      ],
    },
  ];
  const queues = [
    {
      label: 'Projects awaiting review',
      count: review,
      to: '/projects',
      note: 'Review work before marking it complete.',
    },
    {
      label: 'Projects ready to start',
      count: planned,
      to: '/projects',
      note: 'Move a planned project into progress.',
    },
    {
      label: 'Open demo invitations',
      count: invited,
      to: '/people',
      note: 'Invitation records only. No email has been sent.',
    },
  ];

  return (
    <>
      <PageHeading
        eyebrow="Your workspace"
        title={`Hello, ${preferences.name.trim().split(/\s+/)[0] || 'there'}.`}
        description="Your next steps, current work and useful summaries in one place."
        actions={
          <div className="date-chip">
            <IconCalendar size={17} />
            {new Intl.DateTimeFormat('en', {
              weekday: 'short',
              month: 'short',
              day: 'numeric',
            }).format(new Date())}
          </div>
        }
      />
      <div className="overview-controls">
        <span>
          Updated{' '}
          <time dateTime={updatedAt.toISOString()}>
            {updatedAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </time>
        </span>
        <Button
          variant="secondary"
          onClick={() => {
            setUpdatedAt(new Date());
            setRefreshed(true);
            toast('Overview reflects the current local demo records.', 'info');
          }}
        >
          <IconRefresh size={16} />
          Refresh overview {refreshed && <IconCheck size={16} aria-label="Updated" />}
        </Button>
        <Button variant="secondary" onClick={exportOverview}>
          <IconDownload size={16} />
          Export overview CSV
        </Button>
        <details className="overview-customize">
          <summary>
            <IconAdjustments size={16} />
            Customize overview
          </summary>
          <fieldset data-motion-panel>
            <legend>Show on this browser</legend>
            {Object.entries(sections).map(([key, label]) => (
              <label key={key}>
                <input
                  type="checkbox"
                  checked={show(key as Section)}
                  onChange={(event) =>
                    customize(
                      event.target.checked
                        ? hidden.filter((item) => item !== key)
                        : [...hidden, key as Section],
                    )
                  }
                />
                {label}
              </label>
            ))}
            <Button variant="secondary" onClick={() => customize([])}>
              Restore all sections
            </Button>
            <p>Display preferences only. They do not grant access or change exports.</p>
          </fieldset>
        </details>
      </div>
      <section hidden={!show('shortcuts')}>
        <div className="section-heading">
          <h2>Quick actions</h2>
          <span className="text-muted">A shortcut to your next step</span>
        </div>
        <div className="quick-grid current-quick-grid">
          {actions.map((action) => {
            const content = (
              <>
                <span className={`action-icon tone-${action.tone}`}>
                  <action.icon size={21} stroke={1.8} />
                </span>
                <span>
                  <strong>{action.label}</strong>
                  <small>{action.sub}</small>
                </span>
                <IconArrowUpRight className="quick-arrow" size={15} />
              </>
            );
            return action.to ? (
              <Link className="quick-action" to={action.to} key={action.label} data-motion-enter>
                {content}
              </Link>
            ) : (
              <button
                className="quick-action"
                onClick={action.action}
                key={action.label}
                data-motion-enter
                data-ui-press
              >
                {content}
              </button>
            );
          })}
        </div>
      </section>
      <section hidden={!show('analytics')} className="operational-overview">
        <div className="section-heading">
          <h2>Operational summaries</h2>
          <Badge tone="neutral">Fictional example figures</Badge>
        </div>
        <div className="insight-grid">
          <Card className="insight-card">
            <header>
              <h3>Billing snapshot</h3>
              <Badge tone="teal">USD</Badge>
            </header>
            <p className="insight-period">Fixed sample dataset · issued invoices</p>
            <dl className="insight-values">
              <div>
                <dt>Recorded receipts</dt>
                <dd>$18,500</dd>
              </div>
              <div>
                <dt>Outstanding</dt>
                <dd>$5,500</dd>
              </div>
              <div>
                <dt>Issued charges</dt>
                <dd>$24,000</dd>
              </div>
            </dl>
            <ul className="insight-statuses">
              <li>
                <strong>12</strong> paid
              </li>
              <li>
                <strong>3</strong> partly paid
              </li>
              <li>
                <strong>2</strong> unpaid
              </li>
            </ul>
            <p className="insight-basis">
              Illustrative USD invoices only. Void charges and reversed receipts are excluded.
              Recorded receipts do not establish bank settlement. Connect a permission-scoped
              backend for real totals.
            </p>
          </Card>
          <Card className="insight-card">
            <header>
              <h3>Shared spaces</h3>
              <IconClock size={19} />
            </header>
            <p className="insight-period">1–28 November 2026 · fixed sample window</p>
            <dl className="insight-values">
              <div>
                <dt>Booked space time</dt>
                <dd>
                  86 <small>hours</small>
                </dd>
              </div>
              <div>
                <dt>Spaces with bookings</dt>
                <dd>
                  4 <small>of 6 active</small>
                </dd>
              </div>
              <div>
                <dt>Dated reservations</dt>
                <dd>32</dd>
              </div>
            </dl>
            <p className="insight-basis">
              Illustrative non-cancelled reservations in active spaces. Overlapping minutes count
              once. Opening hours and attendance are not included, so this is not a utilisation
              percentage.
            </p>
          </Card>
        </div>
      </section>
      <div
        className={`overview-grid ${!show('desks') || (!show('overview') && !show('queues')) ? 'overview-grid--single' : ''}`}
        hidden={!show('desks') && !show('overview') && !show('queues')}
      >
        <section hidden={!show('desks')}>
          <div className="section-heading">
            <h2>Your work areas</h2>
            <Badge tone="neutral">4 desks</Badge>
          </div>
          <div className="work-area-grid current-desks">
            {areas.map((area) => (
              <Card className={`desk-card tone-${area.tone}`} key={area.title}>
                <header>
                  <span className="area-icon">
                    <area.icon size={23} />
                  </span>
                  <Link to={area.links[0].to} aria-label={`Open ${area.title}`}>
                    <IconArrowUpRight size={18} />
                  </Link>
                </header>
                <h3>{area.title}</h3>
                <p>{area.description}</p>
                <ul className="desk-links">
                  {area.links.slice(0, 2).map((link) => (
                    <li key={link.to}>
                      <Link to={link.to}>
                        {link.label}
                        <IconArrowRight size={15} />
                      </Link>
                    </li>
                  ))}
                </ul>
                <details className="desk-more">
                  <summary>
                    More tools <span>1 ↓</span>
                  </summary>
                  <ul className="desk-links">
                    <li>
                      <Link to={area.links[2].to}>
                        {area.links[2].label}
                        <IconArrowRight size={15} />
                      </Link>
                    </li>
                  </ul>
                </details>
              </Card>
            ))}
          </div>
        </section>
        <aside className="overview-side" hidden={!show('overview') && !show('queues')}>
          <section hidden={!show('overview')}>
            <div className="section-heading">
              <h2>At a glance</h2>
              <span className="text-muted">Current demo records</span>
            </div>
            <Card className="glance-card">
              {[
                { label: 'Active projects', value: active, note: 'Excludes completed work' },
                {
                  label: 'Team members',
                  value: data.people.length,
                  note: 'Includes demo invitations',
                },
                { label: 'Completed', value: complete, note: 'Marked Complete' },
                { label: 'In review', value: review, note: 'Awaiting a decision' },
              ].map((item) => (
                <div key={item.label}>
                  <span className="mini-label">{item.label}</span>
                  <strong>{item.value.toString().padStart(2, '0')}</strong>
                  <small>{item.note}</small>
                </div>
              ))}
            </Card>
          </section>
          <Card className={`attention-card ${!show('queues') ? 'section-hidden' : ''}`}>
            <div className="section-heading">
              <h2>Needs attention</h2>
              <Badge tone="neutral">
                {queues.filter((queue) => queue.count > 0).length} queues
              </Badge>
            </div>
            {queues
              .filter((queue) => queue.count > 0)
              .map((queue) => (
                <Link className="queue-step" to={queue.to} key={queue.label}>
                  <span className="queue-count">{queue.count}</span>
                  <span>
                    <strong>{queue.label}</strong>
                    <small>{queue.note}</small>
                  </span>
                  <IconArrowRight size={16} />
                </Link>
              ))}
            {queues.every((queue) => queue.count === 0) && (
              <p className="queue-clear">
                <IconCheck size={18} />
                All demo work queues are clear.
              </p>
            )}
            <Link className="queue-step" to="/settings">
              <span className="action-icon tone-violet">
                <IconUsers size={18} />
              </span>
              <span>
                <strong>Account & preferences</strong>
                <small>Profile and appearance in this browser.</small>
              </span>
              <IconArrowRight size={16} />
            </Link>
          </Card>
        </aside>
      </div>
      <div hidden={!show('projects')}>
        <Card className="projects-preview">
          <div className="panel-heading">
            <div>
              <h2>Projects in motion</h2>
              <p>Current local records, up to three active projects.</p>
            </div>
            <Link className="text-link" to="/projects">
              View all
              <IconArrowUpRight size={15} />
            </Link>
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {data.projects
                  .filter((p) => p.status !== 'Complete')
                  .slice(0, 3)
                  .map((project) => (
                    <tr key={project.id}>
                      <td data-label="Project">
                        <Link to="/projects" className="project-name">
                          {project.name}
                        </Link>
                        <small className="cell-subtitle">
                          {project.workspaceTeam ? `${project.workspaceTeam} · ` : ''}Due{' '}
                          {formatDate(project.due)}
                        </small>
                      </td>
                      <td data-label="Team">
                        <AvatarStack names={project.team} />
                      </td>
                      <td data-label="Status">
                        <StatusBadge status={project.status} />
                      </td>
                      <td data-label="Progress">
                        <div className="table-progress">
                          <Progress value={project.progress} label={`${project.name} progress`} />
                          <span>{project.progress}%</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
            {active === 0 && (
              <p className="table-empty">No active projects. Create a project to get started.</p>
            )}
          </div>
        </Card>
      </div>
      <div hidden={!show('activity')}>
        <Card className="activity-preview">
          <div className="panel-heading">
            <div>
              <h2>Around the workspace</h2>
              <p>The latest local demo updates.</p>
            </div>
            <Link to="/activity" className="text-link">
              All activity
              <IconArrowUpRight size={15} />
            </Link>
          </div>
          {data.activity.slice(0, 2).map((item) => (
            <div className="activity-preview-row" key={item.id}>
              <Avatar name={item.person} tone={item.tone} />
              <p>
                <strong>{item.person}</strong> {item.action} <strong>{item.subject}</strong>
              </p>
              <Badge tone="neutral">{item.category}</Badge>
            </div>
          ))}
        </Card>
      </div>
      {hidden.length === Object.keys(sections).length && (
        <Card className="empty-state">
          <h2>Your overview is hidden</h2>
          <p>Restore the sections whenever you need them.</p>
          <Button onClick={() => customize([])}>Restore all sections</Button>
        </Card>
      )}
      <ProjectDialog open={projectOpen} onClose={() => setProjectOpen(false)} />
      <PersonDialog open={personOpen} onClose={() => setPersonOpen(false)} />
    </>
  );
}
