import { useEffect, useRef, useState } from 'react';
import { IconPlus, IconCheck } from '@tabler/icons-react';
import { Button, Dialog, Field } from './ui';
import { useWorkspace } from '../store';
import type { Person, ProjectStatus } from '../data';

export function ProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addProject, addTeam, data } = useWorkspace();
  const [teamOpen, setTeamOpen] = useState(false);
  const [team, setTeam] = useState('');
  const [teamError, setTeamError] = useState('');
  const [created, setCreated] = useState(false);
  const submitted = useRef(false);
  useEffect(() => {
    if (open) {
      setCreated(false);
      submitted.current = false;
    }
  }, [open]);
  const closeProject = () => {
    setTeamOpen(false);
    onClose();
  };
  return (
    <>
      <Dialog
        open={open}
        onClose={closeProject}
        title="Create a project"
        description="A little structure for your next big idea."
        className="project-dialog"
      >
        <form
          className="dialog-body project-dialog-form"
          onSubmit={(event) => {
            event.preventDefault();
            if (submitted.current) return;
            const values = new FormData(event.currentTarget);
            const name = String(values.get('name') || '').trim();
            if (!name) {
              (
                event.currentTarget.elements.namedItem('name') as HTMLInputElement
              ).setCustomValidity('Enter a project name.');
              event.currentTarget.reportValidity();
              return;
            }
            submitted.current = true;
            addProject({
              name,
              description:
                String(values.get('description') || '').trim() || 'Your next project starts here.',
              category: String(values.get('category')),
              due: String(values.get('due')),
              status: String(values.get('status')) as ProjectStatus,
              tone: 'teal',
              workspaceTeam: team || undefined,
            });
            event.currentTarget.reset();
            setTeam('');
            setCreated(true);
          }}
        >
          {created ? (
            <div className="completion-note" role="status">
              <IconCheck size={30} />
              <h3>Project created</h3>
              <p>Your project is ready in this browser’s demo workspace.</p>
              <Button autoFocus onClick={closeProject}>
                Done <IconCheck size={16} />
              </Button>
              <Button
                variant="secondary"
                onClick={() => {
                  submitted.current = false;
                  setCreated(false);
                }}
              >
                Create another project
              </Button>
            </div>
          ) : (
            <>
              <div className="dialog-fields">
                <Field label="Project name" htmlFor="project-name">
                  <input
                    data-autofocus
                    autoFocus
                    className="form-control"
                    id="project-name"
                    name="name"
                    placeholder="e.g. Customer experience refresh"
                    required
                    maxLength={80}
                    onInput={(event) => event.currentTarget.setCustomValidity('')}
                  />
                </Field>
                <Field label="Description" htmlFor="project-description" optional>
                  <textarea
                    className="form-control"
                    id="project-description"
                    name="description"
                    placeholder="What are we working towards?"
                    rows={3}
                    maxLength={240}
                  />
                </Field>
                <div className="form-grid">
                  <Field label="Category" htmlFor="project-category">
                    <select className="form-select" name="category" id="project-category">
                      <option>Product</option>
                      <option>Design</option>
                      <option>Marketing</option>
                      <option>Operations</option>
                      <option>People</option>
                    </select>
                  </Field>
                  <Field label="Status" htmlFor="project-status">
                    <select className="form-select" name="status" id="project-status">
                      <option>Planned</option>
                      <option>In progress</option>
                      <option>In review</option>
                      <option>Complete</option>
                    </select>
                  </Field>
                </div>
                <Field
                  label="Team"
                  htmlFor="project-team"
                  optional
                  hint="Create a missing team here without leaving this form."
                >
                  <div className="inline-create-field">
                    <select
                      className="form-select"
                      id="project-team"
                      value={team}
                      onChange={(event) => setTeam(event.target.value)}
                      aria-describedby="project-team-hint"
                    >
                      <option value="">Choose a team</option>
                      {data.teams.map((name) => (
                        <option key={name}>{name}</option>
                      ))}
                    </select>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setTeamError('');
                        setTeamOpen(true);
                      }}
                    >
                      <IconPlus size={16} /> New team
                    </Button>
                  </div>
                </Field>
                <Field label="Delivery date" htmlFor="project-due">
                  <input
                    type="date"
                    className="form-control"
                    id="project-due"
                    name="due"
                    required
                    defaultValue="2026-11-30"
                    min="2000-01-01"
                    max="2100-12-31"
                  />
                </Field>
              </div>
              <div className="dialog-actions">
                <Button variant="secondary" onClick={closeProject}>
                  Cancel
                </Button>
                <Button type="submit">Create project</Button>
              </div>
            </>
          )}
        </form>
      </Dialog>
      <Dialog
        open={teamOpen && open}
        onClose={() => setTeamOpen(false)}
        title="Create a team"
        description="Your project stays open underneath. This team is saved in this browser only."
        className="child-dialog"
      >
        <form
          className="dialog-body"
          onSubmit={(event) => {
            event.preventDefault();
            const name = String(new FormData(event.currentTarget).get('teamName') || '').trim();
            if (!name) {
              setTeamError('Enter a team name.');
              return;
            }
            const existing = data.teams.find((item) => item.toLowerCase() === name.toLowerCase());
            if (existing) {
              setTeamError('This team already exists. Choose it in the project form.');
              return;
            }
            addTeam(name);
            setTeam(name);
            setTeamError('');
            event.currentTarget.reset();
            setTeamOpen(false);
          }}
        >
          <Field label="Team name" htmlFor="new-team-name" error={teamError}>
            <input
              data-autofocus
              id="new-team-name"
              name="teamName"
              className="form-control"
              placeholder="e.g. Customer success"
              required
              maxLength={60}
              onInput={() => setTeamError('')}
              aria-invalid={!!teamError}
              aria-describedby={teamError ? 'new-team-name-error' : undefined}
            />
          </Field>
          <div className="dialog-actions">
            <Button variant="secondary" onClick={() => setTeamOpen(false)}>
              Back to project
            </Button>
            <Button type="submit">Create and select team</Button>
          </div>
        </form>
      </Dialog>
    </>
  );
}

export function PersonDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addPerson, data } = useWorkspace();
  const [error, setError] = useState('');
  return (
    <Dialog
      open={open}
      onClose={() => {
        setError('');
        onClose();
      }}
      title="Add a teammate"
      description="Try the invitation interface. This demo does not send email."
    >
      <form
        className="dialog-body"
        onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          const email = String(values.get('email') || '')
            .trim()
            .toLowerCase();
          const name = String(values.get('name') || '').trim();
          if (!name) {
            setError('Enter a name with at least one letter.');
            return;
          }
          if (data.people.some((person) => person.email.toLowerCase() === email)) {
            setError('This email is already in your demo workspace.');
            return;
          }
          addPerson({
            name,
            email,
            role: String(values.get('role')) as Person['role'],
            department: String(values.get('department')),
          });
          setError('');
          event.currentTarget.reset();
          onClose();
        }}
      >
        <Field label="Full name" htmlFor="person-name">
          <input
            data-autofocus
            className="form-control"
            id="person-name"
            name="name"
            placeholder="e.g. Avery Quinn"
            required
            maxLength={80}
          />
        </Field>
        <Field label="Email address" htmlFor="person-email" error={error}>
          <input
            className="form-control"
            type="email"
            id="person-email"
            name="email"
            placeholder="avery@example.com"
            required
            maxLength={120}
            aria-describedby={error ? 'person-email-error' : undefined}
            aria-invalid={!!error}
            onInput={() => setError('')}
          />
        </Field>
        <div className="form-grid">
          <Field label="Role" htmlFor="person-role">
            <select className="form-select" id="person-role" name="role">
              <option>Member</option>
              <option>Editor</option>
              <option>Admin</option>
            </select>
          </Field>
          <Field label="Department" htmlFor="person-department">
            <select className="form-select" id="person-department" name="department">
              <option>Operations</option>
              <option>Design</option>
              <option>Product</option>
              <option>Marketing</option>
              <option>People</option>
            </select>
          </Field>
        </div>
        <div className="info-note">
          Roles are sample labels here. Add server-side access checks when connecting your own
          backend.
        </div>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Add demo invitation</Button>
        </div>
      </form>
    </Dialog>
  );
}
