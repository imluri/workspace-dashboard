import { useEffect, useState } from 'react';
import {
  IconCheck,
  IconDeviceDesktop,
  IconMoon,
  IconSun,
  IconRefresh,
  IconShieldCheck,
} from '@tabler/icons-react';
import { useWorkspace } from '../store';
import type { Preferences } from '../store';
import { Avatar, Badge, Button, Card, Dialog, Field, PageHeading } from '../components/ui';

export function Settings() {
  const { preferences, savePreferences, resetDemo } = useWorkspace();
  const [form, setForm] = useState(preferences);
  const [confirm, setConfirm] = useState(false);
  useEffect(() => setForm(preferences), [preferences]);
  const dirty = JSON.stringify(form) !== JSON.stringify(preferences);
  return (
    <>
      <PageHeading
        eyebrow="Make yourself at home"
        title="Settings"
        description="Your workspace, with a little more you in it."
        actions={
          <Badge tone="teal">
            <IconShieldCheck size={14} />
            Stored in this browser
          </Badge>
        }
      />
      <form
        className="settings-layout"
        onSubmit={(event) => {
          event.preventDefault();
          savePreferences({
            ...form,
            name: form.name.trim(),
            workspace: form.workspace.trim(),
            email: form.email.trim(),
          });
        }}
      >
        <div className="settings-sections">
          <Card id="profile" className="settings-card">
            <div className="panel-heading">
              <div>
                <h2>Profile & workspace</h2>
                <p>A familiar face and a name that feels right.</p>
              </div>
            </div>
            <div className="profile-summary">
              <Avatar name={form.name || 'Your name'} size="large" />
              <div>
                <strong>{form.name || 'Your name'}</strong>
                <small>Initials update as you type</small>
              </div>
            </div>
            <div className="form-grid">
              <Field label="Your name" htmlFor="profile-name">
                <input
                  className="form-control"
                  id="profile-name"
                  value={form.name}
                  onChange={(event) => setForm({ ...form, name: event.target.value })}
                  maxLength={80}
                  required
                  pattern=".*\S.*"
                />
              </Field>
              <Field label="Email address" htmlFor="profile-email">
                <input
                  className="form-control"
                  type="email"
                  id="profile-email"
                  value={form.email}
                  onChange={(event) => setForm({ ...form, email: event.target.value })}
                  maxLength={120}
                  required
                />
              </Field>
            </div>
            <Field
              label="Workspace name"
              htmlFor="workspace-name"
              hint="Appears in the header. Brand name and navigation live in src/config.ts."
            >
              <input
                className="form-control"
                id="workspace-name"
                value={form.workspace}
                onChange={(event) => setForm({ ...form, workspace: event.target.value })}
                maxLength={60}
                required
                pattern=".*\S.*"
                aria-describedby="workspace-name-hint"
              />
            </Field>
          </Card>
          <Card id="appearance" className="settings-card">
            <div className="panel-heading">
              <div>
                <h2>Appearance</h2>
                <p>Find the colours and contrast that feel comfortable.</p>
              </div>
            </div>
            <fieldset className="appearance-fieldset">
              <legend>Theme</legend>
              <div className="theme-options">
                {(
                  [
                    { value: 'light', label: 'Light', icon: IconSun },
                    { value: 'dark', label: 'Dark', icon: IconMoon },
                    { value: 'system', label: 'System', icon: IconDeviceDesktop },
                  ] as const
                ).map((theme) => (
                  <label
                    className={`theme-option ${form.theme === theme.value ? 'selected' : ''}`}
                    key={theme.value}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={theme.value}
                      checked={form.theme === theme.value}
                      onChange={() => setForm({ ...form, theme: theme.value })}
                    />
                    <span className={`theme-preview ${theme.value}`}>
                      <span />
                      <span />
                      <span />
                    </span>
                    <span>
                      <theme.icon size={16} />
                      {theme.label}
                      {form.theme === theme.value && <IconCheck size={16} />}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <fieldset className="appearance-fieldset">
              <legend>Accent colour</legend>
              <div className="accent-options">
                {(['teal', 'blue', 'violet', 'rose'] as const).map((accent) => (
                  <label
                    key={accent}
                    className={`accent-option ${form.accent === accent ? 'selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="accent"
                      value={accent}
                      checked={form.accent === accent}
                      onChange={() => setForm({ ...form, accent })}
                    />
                    <span className={`accent-swatch ${accent}`}>
                      {form.accent === accent && <IconCheck size={17} />}
                    </span>
                    <span>{accent[0].toUpperCase() + accent.slice(1)}</span>
                  </label>
                ))}
              </div>
            </fieldset>
            <p className="field-hint">Save changes to apply your theme and accent.</p>
          </Card>
          <Card id="notifications" className="settings-card">
            <div className="panel-heading">
              <div>
                <h2>Notification preferences</h2>
                <p>Example switches, ready to connect to your own service.</p>
              </div>
            </div>
            {(
              [
                {
                  key: 'updates',
                  title: 'Workspace updates',
                  description: 'Important changes and project milestones.',
                },
                {
                  key: 'digest',
                  title: 'Weekly digest',
                  description: 'A quiet roundup of the week’s progress.',
                },
              ] as const
            ).map((item) => (
              <label className="preference-row" key={item.key}>
                <span>
                  <strong>{item.title}</strong>
                  <small>{item.description}</small>
                </span>
                <input
                  className="form-check-input switch-input"
                  role="switch"
                  type="checkbox"
                  checked={form[item.key]}
                  onChange={(event) =>
                    setForm({ ...form, [item.key]: event.target.checked } as Preferences)
                  }
                />
              </label>
            ))}
          </Card>
          <div className="settings-save-bar">
            <span>{dirty ? 'You have unsaved changes' : 'Everything is up to date'}</span>
            <Button
              type="button"
              variant="secondary"
              disabled={!dirty}
              onClick={() => setForm(preferences)}
            >
              Discard
            </Button>
            <Button type="submit" disabled={!dirty}>
              <IconCheck size={17} />
              Save changes
            </Button>
          </div>
        </div>
        <aside className="settings-aside">
          <Card>
            <span className="action-icon tone-violet">
              <IconShieldCheck size={22} />
            </span>
            <h2>A safe space to try things</h2>
            <p>This starter uses browser storage for fictional demo data and preferences.</p>
            <p>
              Add your own backend for authentication, permissions, notifications and business
              records.
            </p>
            <a
              href="https://github.com/imluri/workspace-dashboard#make-it-yours"
              target="_blank"
              rel="noreferrer"
            >
              Customisation guide ↗
            </a>
          </Card>
          <Card className="reset-card">
            <h2>Start fresh</h2>
            <p>Restore the original demo records and preferences.</p>
            <Button variant="secondary" onClick={() => setConfirm(true)}>
              <IconRefresh size={17} />
              Reset demo
            </Button>
          </Card>
        </aside>
      </form>
      <Dialog
        open={confirm}
        onClose={() => setConfirm(false)}
        title="Start with a clean workspace?"
        description="This removes the projects, invitations and preferences saved by this demo in this browser."
      >
        <div className="dialog-body">
          <p>
            Your other browser data is unaffected. The original sample workspace will be restored.
          </p>
          <div className="dialog-actions">
            <Button variant="secondary" onClick={() => setConfirm(false)}>
              Keep exploring
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                resetDemo();
                setConfirm(false);
              }}
            >
              Reset demo
            </Button>
          </div>
        </div>
      </Dialog>
    </>
  );
}
