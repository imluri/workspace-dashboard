import { useState } from 'react';
import { IconDownload, IconSearch, IconUserPlus, IconMail } from '@tabler/icons-react';
import { useWorkspace, downloadCsv } from '../store';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  PageHeading,
  StatusBadge,
} from '../components/ui';
import { PersonDialog } from '../components/RecordDialogs';

export function People() {
  const { data, toast } = useWorkspace();
  const [query, setQuery] = useState('');
  const [role, setRole] = useState('All roles');
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selected = data.people.find((person) => person.id === selectedId);
  const people = data.people.filter(
    (person) =>
      `${person.name} ${person.email} ${person.department}`
        .toLowerCase()
        .includes(query.toLowerCase()) &&
      (role === 'All roles' || role === person.role),
  );
  return (
    <>
      <PageHeading
        eyebrow="Good company"
        title="People"
        description="The people who turn your plans into something real."
        actions={
          <>
            <Button
              variant="secondary"
              onClick={() => {
                downloadCsv('workspace-people.csv', [
                  ['Name', 'Email', 'Role', 'Department', 'Status'],
                  ...people.map((p) => [p.name, p.email, p.role, p.department, p.status]),
                ]);
                toast('Team directory downloaded.');
              }}
            >
              <IconDownload size={17} />
              Export
            </Button>
            <Button onClick={() => setOpen(true)}>
              <IconUserPlus size={18} />
              Add teammate
            </Button>
          </>
        }
      />
      <div className="summary-strip">
        <span>
          <strong>{data.people.length}</strong> Team members
        </span>
        <span>
          <i className="mini-dot teal" />
          <strong>{data.people.filter((p) => p.status === 'Active').length}</strong> Active
        </span>
        <span>
          <i className="mini-dot amber" />
          <strong>{data.people.filter((p) => p.status === 'Invited').length}</strong> Invited
        </span>
      </div>
      <div className="filter-toolbar">
        <div className="search-field">
          <IconSearch size={18} />
          <input
            className="form-control"
            aria-label="Search people"
            placeholder="Search name, email or department…"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <select
          className="form-select filter-select"
          aria-label="Filter by role"
          value={role}
          onChange={(event) => setRole(event.target.value)}
        >
          {['All roles', 'Admin', 'Editor', 'Member'].map((value) => (
            <option key={value}>{value}</option>
          ))}
        </select>
        <span className="results-count">{people.length} people</span>
      </div>
      <Card className="flush-card">
        {!people.length ? (
          <EmptyState
            title="No teammates found"
            description="Try a different name or clear your filters."
            action={
              <Button
                variant="secondary"
                onClick={() => {
                  setQuery('');
                  setRole('All roles');
                }}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="table-wrap">
            <table className="data-table people-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th className="text-end">Profile</th>
                </tr>
              </thead>
              <tbody>
                {people.map((person) => (
                  <tr key={person.id}>
                    <td data-label="Name">
                      <div className="person-cell">
                        <Avatar name={person.name} tone={person.tone} />
                        <span>
                          <button
                            className="plain-button project-name"
                            onClick={() => setSelectedId(person.id)}
                          >
                            {person.name}
                          </button>
                          <small className="cell-subtitle">{person.email}</small>
                        </span>
                      </div>
                    </td>
                    <td data-label="Department">{person.department}</td>
                    <td data-label="Role">
                      <Badge tone={person.role === 'Admin' ? 'violet' : 'neutral'}>
                        {person.role}
                      </Badge>
                    </td>
                    <td data-label="Status">
                      <StatusBadge status={person.status} />
                    </td>
                    <td data-label="Profile" className="text-end">
                      <Button variant="ghost" onClick={() => setSelectedId(person.id)}>
                        View profile <span aria-hidden="true">↗</span>
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
      <p className="page-note">
        <IconMail size={16} />
        All people are fictional. Invitations and roles are interface examples.
      </p>
      <PersonDialog open={open} onClose={() => setOpen(false)} />
      <Dialog
        open={!!selected}
        onClose={() => setSelectedId(null)}
        title="Team profile"
        description="An example of a compact details view."
      >
        {selected && (
          <div className="dialog-body">
            <div className="profile-summary">
              <Avatar name={selected.name} tone={selected.tone} size="large" />
              <div>
                <h3>{selected.name}</h3>
                <p>{selected.department}</p>
              </div>
              <StatusBadge status={selected.status} />
            </div>
            <dl className="details-list">
              <div>
                <dt>Email</dt>
                <dd>{selected.email}</dd>
              </div>
              <div>
                <dt>Role</dt>
                <dd>{selected.role}</dd>
              </div>
              <div>
                <dt>Department</dt>
                <dd>{selected.department}</dd>
              </div>
              <div>
                <dt>Workspace</dt>
                <dd>Demo team</dd>
              </div>
            </dl>
            <div className="dialog-actions">
              <Button onClick={() => setSelectedId(null)}>Done</Button>
            </div>
          </div>
        )}
      </Dialog>
    </>
  );
}
