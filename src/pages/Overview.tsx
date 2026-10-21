import { useState } from 'react';
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
  IconSettings,
  IconArrowRight,
  IconCircleCheck,
  IconCalendar,
  IconClock,
  IconSparkles,
} from '@tabler/icons-react';
import { useWorkspace, downloadCsv } from '../store';
import {
  Avatar,
  AvatarStack,
  Badge,
  Card,
  PageHeading,
  Progress,
  StatusBadge,
} from '../components/ui';
import { ProjectDialog, PersonDialog } from '../components/RecordDialogs';
import { formatDate } from '../data';

export function Overview() {
  const { data, preferences, toast } = useWorkspace();
  const [projectOpen, setProjectOpen] = useState(false);
  const [personOpen, setPersonOpen] = useState(false);
  const active = data.projects.filter((project) => project.status !== 'Complete').length;
  const complete = data.projects.filter((project) => project.status === 'Complete').length;
  const actions = [
    {
      label: 'New project',
      sub: 'Give an idea a home',
      icon: IconPlus,
      tone: 'teal',
      action: () => setProjectOpen(true),
    },
    {
      label: 'Add teammate',
      sub: 'Better together',
      icon: IconUserPlus,
      tone: 'violet',
      action: () => setPersonOpen(true),
    },
    {
      label: 'View activity',
      sub: 'Catch up at a glance',
      icon: IconChartBar,
      tone: 'blue',
      to: '/activity',
    },
    {
      label: 'Explore elements',
      sub: 'Find your building blocks',
      icon: IconPalette,
      tone: 'rose',
      to: '/elements',
    },
    {
      label: 'Export projects',
      sub: 'Take a snapshot',
      icon: IconDownload,
      tone: 'blue',
      action: () => {
        downloadCsv('workspace-projects.csv', [
          ['Project', 'Category', 'Status', 'Progress', 'Due'],
          ...data.projects.map((p) => [p.name, p.category, p.status, p.progress, p.due]),
        ]);
        toast('Project snapshot downloaded.');
      },
    },
    {
      label: 'Personalise',
      sub: 'Make yourself at home',
      icon: IconSettings,
      tone: 'violet',
      to: '/settings',
    },
  ];
  const areas = [
    {
      name: 'Projects',
      description: 'From first idea to final delivery.',
      metric: `${active} in motion`,
      icon: IconFolder,
      tone: 'teal',
      to: '/projects',
    },
    {
      name: 'People',
      description: 'Good work starts with a great team.',
      metric: `${data.people.length} teammates`,
      icon: IconUsers,
      tone: 'violet',
      to: '/people',
    },
    {
      name: 'Activity',
      description: 'A clear picture of what’s happening.',
      metric: `${data.activity.length} updates`,
      icon: IconChartBar,
      tone: 'blue',
      to: '/activity',
    },
    {
      name: 'Your toolkit',
      description: 'Small elements. Endless possibilities.',
      metric: 'Ready to customise',
      icon: IconPalette,
      tone: 'rose',
      to: '/elements',
    },
  ];
  return (
    <>
      <PageHeading
        eyebrow="A fresh perspective"
        title={`Hello, ${preferences.name.trim().split(/\s+/)[0] || 'there'}.`}
        description="Here’s what’s happening in your workspace today."
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
      <div className="section-heading">
        <h2>Let’s get started</h2>
        <span className="text-muted">A shortcut to your next step</span>
      </div>
      <div className="quick-grid">
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
            <Link className="quick-action" to={action.to} key={action.label}>
              {content}
            </Link>
          ) : (
            <button className="quick-action" onClick={action.action} key={action.label}>
              {content}
            </button>
          );
        })}
      </div>
      <div className="overview-grid">
        <section>
          <div className="section-heading">
            <h2>Your work areas</h2>
            <Badge tone="neutral">All in one place</Badge>
          </div>
          <div className="work-area-grid">
            {areas.map((area) => (
              <Link to={area.to} className={`work-area tone-${area.tone}`} key={area.name}>
                <span className="work-area-top">
                  <span className="area-icon">
                    <area.icon size={24} stroke={1.7} />
                  </span>
                  <IconArrowUpRight size={19} />
                </span>
                <h3>{area.name}</h3>
                <p>{area.description}</p>
                <span className="area-bottom">
                  <span>{area.metric}</span>
                  <IconArrowRight size={17} />
                </span>
              </Link>
            ))}
          </div>
        </section>
        <div className="overview-side">
          <section>
            <div className="section-heading">
              <h2>At a glance</h2>
              <span className="text-muted">This workspace</span>
            </div>
            <Card className="glance-card">
              <div>
                <span className="mini-label">
                  <i className="mini-dot teal" />
                  Active projects
                </span>
                <strong>{active.toString().padStart(2, '0')}</strong>
                <small>Ideas moving forward</small>
              </div>
              <div>
                <span className="mini-label">
                  <i className="mini-dot violet" />
                  Team members
                </span>
                <strong>{data.people.length.toString().padStart(2, '0')}</strong>
                <small>A little collective magic</small>
              </div>
              <div>
                <span className="mini-label">
                  <i className="mini-dot blue" />
                  Completed
                </span>
                <strong>{complete.toString().padStart(2, '0')}</strong>
                <small>Another milestone reached</small>
              </div>
              <div>
                <span className="mini-label">
                  <i className="mini-dot rose" />
                  In review
                </span>
                <strong>
                  {data.projects
                    .filter((p) => p.status === 'In review')
                    .length.toString()
                    .padStart(2, '0')}
                </strong>
                <small>Ready for a fresh pair of eyes</small>
              </div>
            </Card>
          </section>
          <Card className="next-card">
            <div className="next-heading">
              <span className="action-icon tone-violet">
                <IconSparkles size={20} />
              </span>
              <h2>A good next step</h2>
            </div>
            <p>Give this workspace a personality of its own. A name, a colour, a fresh start.</p>
            <Link to="/settings?section=appearance">
              Make it yours <IconArrowRight size={16} />
            </Link>
          </Card>
        </div>
      </div>
      <div className="bottom-grid">
        <Card className="projects-preview">
          <div className="panel-heading">
            <div>
              <h2>Projects in motion</h2>
              <p>A few things taking shape.</p>
            </div>
            <Link className="text-link" to="/projects">
              View all <IconArrowUpRight size={15} />
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
                        <small className="cell-subtitle">Due {formatDate(project.due)}</small>
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
          </div>
        </Card>
        <Card className="pulse-card">
          <div className="panel-heading">
            <div>
              <h2>Workspace pulse</h2>
              <p>Tasks completed this week</p>
            </div>
            <span className="action-icon tone-teal">
              <IconCircleCheck size={20} />
            </span>
          </div>
          <div className="pulse-number">
            42 <Badge tone="teal">+12 this week</Badge>
          </div>
          <div
            className="bar-chart"
            role="img"
            aria-label="Sample weekly task counts: Monday 4, Tuesday 7, Wednesday 5, Thursday 9, Friday 11, Saturday 4, Sunday 2. Total 42."
          >
            {[4, 7, 5, 9, 11, 4, 2].map((value, index) => (
              <div key={index}>
                <span
                  className={index === 4 ? 'highlight-bar' : ''}
                  style={{ height: `${(value / 11) * 100}%` }}
                  title={`${value} tasks`}
                />
                <small>{['M', 'T', 'W', 'T', 'F', 'S', 'S'][index]}</small>
              </div>
            ))}
          </div>
          <p className="chart-caption">
            <IconClock size={14} />
            Illustrative data · updated for the demo
          </p>
        </Card>
      </div>
      <Card className="activity-preview">
        <div className="panel-heading">
          <div>
            <h2>Around the workspace</h2>
            <p>The latest from your team.</p>
          </div>
          <Link to="/activity" className="text-link">
            All activity <IconArrowUpRight size={15} />
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
      <ProjectDialog open={projectOpen} onClose={() => setProjectOpen(false)} />
      <PersonDialog open={personOpen} onClose={() => setPersonOpen(false)} />
    </>
  );
}
