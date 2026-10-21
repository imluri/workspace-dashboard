import { useState } from 'react';
import { Link } from 'react-router';
import { Button, Dialog, Field } from './ui';
import { useWorkspace } from '../store';
import type { Person, ProjectStatus } from '../data';

export function ProjectDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { addProject } = useWorkspace();
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Create a project"
      description="A little structure for your next big idea."
    >
      <form
        className="dialog-body"
        onSubmit={(event) => {
          event.preventDefault();
          const values = new FormData(event.currentTarget);
          const name = String(values.get('name') || '').trim();
          if (!name) {
            (event.currentTarget.elements.namedItem('name') as HTMLInputElement).setCustomValidity(
              'Enter a project name.',
            );
            event.currentTarget.reportValidity();
            return;
          }
          addProject({
            name,
            description:
              String(values.get('description') || '').trim() || 'Your next project starts here.',
            category: String(values.get('category')),
            due: String(values.get('due')),
            status: String(values.get('status')) as ProjectStatus,
            tone: 'teal',
          });
          event.currentTarget.reset();
          onClose();
        }}
      >
        <Field label="Project name" htmlFor="project-name">
          <input
            data-autofocus
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
        <p className="field-hint">
          Need to adjust your workspace first?{' '}
          <Link to="/settings" onClick={onClose}>
            Open settings
          </Link>
        </p>
        <div className="dialog-actions">
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit">Create project</Button>
        </div>
      </form>
    </Dialog>
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
