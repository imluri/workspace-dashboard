import { useState } from 'react';
import {
  IconPlus,
  IconSearch,
  IconLayoutGrid,
  IconList,
  IconDownload,
  IconFolder,
  IconCalendar,
} from '@tabler/icons-react';
import { useWorkspace, downloadCsv } from '../store';
import type { Project, ProjectStatus } from '../data';
import { formatDate } from '../data';
import {
  AvatarStack,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  Field,
  PageHeading,
  Progress,
  StatusBadge,
} from '../components/ui';
import { ProjectDialog } from '../components/RecordDialogs';

export function Projects() {
  const { data, updateProject, toast } = useWorkspace();
  const [query, setQuery] = useState('');
  const [status, setStatus] = useState('All statuses');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.projects.find((project) => project.id === selectedId);
  const projects = data.projects.filter(
    (project) =>
      (status === 'All statuses' || project.status === status) &&
      `${project.name} ${project.category} ${project.description} ${project.workspaceTeam || ''}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  );
  const exportProjects = () => {
    downloadCsv('workspace-projects.csv', [
      ['Project', 'Category', 'Workspace team', 'Status', 'Progress', 'Due'],
      ...projects.map((p) => [
        p.name,
        p.category,
        p.workspaceTeam || '',
        p.status,
        p.progress,
        p.due,
      ]),
    ]);
    toast(`Exported ${projects.length} projects.`);
  };
  const openProject = (project: Project) => setSelectedId(project.id);
  return (
    <>
      <PageHeading
        eyebrow="Make good things happen"
        title="Projects"
        description="A clear home for the work you’re bringing to life."
        actions={
          <>
            <Button variant="secondary" onClick={exportProjects}>
              <IconDownload size={17} />
              Export
            </Button>
            <Button onClick={() => setCreateOpen(true)}>
              <IconPlus size={18} />
              New project
            </Button>
          </>
        }
      />
      <div className="summary-strip">
        <span>
          <strong>{data.projects.length}</strong> Total projects
        </span>
        <span>
          <i className="mini-dot blue" />
          <strong>{data.projects.filter((p) => p.status === 'In progress').length}</strong> In
          progress
        </span>
        <span>
          <i className="mini-dot violet" />
          <strong>{data.projects.filter((p) => p.status === 'In review').length}</strong> In review
        </span>
        <span>
          <i className="mini-dot teal" />
          <strong>{data.projects.filter((p) => p.status === 'Complete').length}</strong> Complete
        </span>
      </div>
      <div className="filter-toolbar">
        <div className="search-field">
          <IconSearch size={18} />
          <input
            className="form-control"
            aria-label="Search projects"
            placeholder="Search projects…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="form-select filter-select"
          aria-label="Filter projects by status"
          value={status}
          onChange={(event) => setStatus(event.target.value)}
        >
          {['All statuses', 'In progress', 'In review', 'Planned', 'Complete'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <span className="results-count">{projects.length} projects</span>
        <div className="segmented-control" aria-label="Project view">
          <button
            aria-label="Grid view"
            aria-pressed={view === 'grid'}
            onClick={() => setView('grid')}
          >
            <IconLayoutGrid size={18} />
          </button>
          <button
            aria-label="List view"
            aria-pressed={view === 'list'}
            onClick={() => setView('list')}
          >
            <IconList size={19} />
          </button>
        </div>
      </div>
      {!projects.length ? (
        <Card>
          <EmptyState
            title="No projects found"
            description="Try a different search, or start something new."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setStatus('All statuses');
                }}
              >
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : view === 'grid' ? (
        <div className="project-grid">
          {projects.map((project) => (
            <Card className="project-card" key={project.id}>
              <div className="project-card-top">
                <span className={`action-icon tone-${project.tone}`}>
                  <IconFolder size={23} />
                </span>
                <StatusBadge status={project.status} />
              </div>
              <Badge tone="neutral">{project.category}</Badge>
              {project.workspaceTeam && (
                <small className="cell-subtitle">{project.workspaceTeam}</small>
              )}
              <h2>
                <button className="plain-button" onClick={() => openProject(project)}>
                  {project.name}
                </button>
              </h2>
              <p>{project.description}</p>
              <div className="project-progress-label">
                <span>Progress</span>
                <strong>{project.progress}%</strong>
              </div>
              <Progress value={project.progress} label={`${project.name} progress`} />
              <div className="project-card-bottom">
                <AvatarStack names={project.team} />
                <span>
                  <IconCalendar size={15} />
                  {formatDate(project.due).replace(', 2026', '')}
                </span>
              </div>
              <button className="card-open-link" onClick={() => openProject(project)}>
                Open project <span aria-hidden="true">↗</span>
              </button>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="flush-card">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Project</th>
                  <th>Category</th>
                  <th>Team</th>
                  <th>Status</th>
                  <th>Due date</th>
                  <th>Progress</th>
                </tr>
              </thead>
              <tbody>
                {projects.map((project) => (
                  <tr key={project.id}>
                    <td data-label="Project">
                      <button
                        className="plain-button project-name"
                        onClick={() => openProject(project)}
                      >
                        {project.name}
                      </button>
                    </td>
                    <td data-label="Category">{project.category}</td>
                    <td data-label="Team">
                      <AvatarStack names={project.team} />
                      {project.workspaceTeam && (
                        <small className="cell-subtitle">{project.workspaceTeam}</small>
                      )}
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={project.status} />
                    </td>
                    <td data-label="Due date">{formatDate(project.due)}</td>
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
      )}
      <ProjectDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      <Dialog
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title={selected?.name || 'Project'}
        description="Project details · local demo record"
      >
        {selected && (
          <div className="dialog-body">
            <p>{selected.description}</p>
            <dl className="details-list">
              <div>
                <dt>Category</dt>
                <dd>{selected.category}</dd>
              </div>
              <div>
                <dt>Delivery date</dt>
                <dd>{formatDate(selected.due)}</dd>
              </div>
              <div>
                <dt>Team</dt>
                <dd>
                  {selected.workspaceTeam ? `${selected.workspaceTeam}: ` : ''}
                  {selected.team.join(', ')}
                </dd>
              </div>
              <div>
                <dt>Progress</dt>
                <dd>{selected.progress}% complete</dd>
              </div>
            </dl>
            <Field
              label="Project status"
              htmlFor="detail-status"
              hint="Changing the status updates this browser’s demo data."
            >
              <select
                className="form-select"
                id="detail-status"
                value={selected.status}
                onChange={(event) =>
                  updateProject(selected.id, event.target.value as ProjectStatus)
                }
              >
                {['Planned', 'In progress', 'In review', 'Complete'].map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </Field>
            <div className="dialog-actions">
              <Button onClick={() => setSelectedId(null)}>Done</Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
