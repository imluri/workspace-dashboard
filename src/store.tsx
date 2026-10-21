import { createContext, useContext, useEffect, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import { initialActivity, initialPeople, initialProjects } from './data';
import type { ActivityItem, Person, Project } from './data';
import { dashboardConfig } from './config';

export type Preferences = {
  theme: 'light' | 'dark' | 'system';
  accent: 'teal' | 'blue' | 'violet' | 'rose';
  workspace: string;
  name: string;
  email: string;
  updates: boolean;
  digest: boolean;
};
export const defaultPreferences: Preferences = {
  theme: 'light',
  accent: 'teal',
  workspace: dashboardConfig.workspaceLabel,
  name: 'Alex Morgan',
  email: 'alex@example.com',
  updates: true,
  digest: false,
};
type Toast = { id: string; message: string; tone: 'success' | 'info' | 'danger' };
type DemoState = { projects: Project[]; people: Person[]; activity: ActivityItem[] };

function readPreferences(): Preferences {
  try {
    const value = JSON.parse(localStorage.getItem('workspace.preferences.v1') || 'null');
    if (!value || typeof value !== 'object') return defaultPreferences;
    return {
      theme: ['light', 'dark', 'system'].includes(value.theme) ? value.theme : 'light',
      accent: ['teal', 'blue', 'violet', 'rose'].includes(value.accent) ? value.accent : 'teal',
      workspace:
        typeof value.workspace === 'string'
          ? value.workspace.slice(0, 60)
          : defaultPreferences.workspace,
      name: typeof value.name === 'string' ? value.name.slice(0, 80) : defaultPreferences.name,
      email: typeof value.email === 'string' ? value.email.slice(0, 120) : defaultPreferences.email,
      updates: typeof value.updates === 'boolean' ? value.updates : true,
      digest: typeof value.digest === 'boolean' ? value.digest : false,
    };
  } catch {
    return defaultPreferences;
  }
}

function readDemoState(): DemoState {
  const fallback = { projects: initialProjects, people: initialPeople, activity: initialActivity };
  try {
    const value: unknown = JSON.parse(localStorage.getItem('workspace.demo.v1') || 'null');
    if (!value || typeof value !== 'object') return fallback;
    const data = value as DemoState;
    const strings = (row: unknown, keys: string[]) =>
      !!row &&
      typeof row === 'object' &&
      keys.every((key) => typeof (row as Record<string, unknown>)[key] === 'string');
    if (
      !Array.isArray(data.projects) ||
      !data.projects.every(
        (p) =>
          strings(p, ['id', 'name', 'description', 'category', 'status', 'due', 'tone']) &&
          Number.isFinite(p.progress) &&
          p.progress >= 0 &&
          p.progress <= 100 &&
          ['In progress', 'In review', 'Planned', 'Complete'].includes(p.status) &&
          /^\d{4}-\d{2}-\d{2}$/.test(p.due) &&
          Number.isFinite(Date.parse(p.due)) &&
          Array.isArray(p.team) &&
          p.team.every((n) => typeof n === 'string'),
      )
    )
      return fallback;
    if (
      !Array.isArray(data.people) ||
      !data.people.every((p) =>
        strings(p, ['id', 'name', 'email', 'role', 'department', 'status', 'tone']),
      )
    )
      return fallback;
    if (
      !Array.isArray(data.activity) ||
      !data.activity.every(
        (a) =>
          strings(a, ['id', 'person', 'action', 'subject', 'category', 'time', 'tone']) &&
          Number.isFinite(Date.parse(a.time)),
      )
    )
      return fallback;
    return data;
  } catch {
    return fallback;
  }
}

type WorkspaceState = {
  preferences: Preferences;
  savePreferences: (value: Preferences) => void;
  toggleTheme: () => void;
  data: DemoState;
  addProject: (value: Omit<Project, 'id' | 'progress' | 'team'>) => void;
  updateProject: (id: string, status: Project['status']) => void;
  addPerson: (value: Omit<Person, 'id' | 'status' | 'tone'>) => void;
  resetDemo: () => void;
  toasts: Toast[];
  toast: (message: string, tone?: Toast['tone']) => void;
  dismissToast: (id: string) => void;
};

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export function WorkspaceProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const [data, setData] = useState(readDemoState);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  const [storageAvailable, setStorageAvailable] = useState(true);

  useEffect(() => {
    const apply = () => {
      const resolved =
        preferences.theme === 'system'
          ? matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark'
            : 'light'
          : preferences.theme;
      document.documentElement.dataset.theme = resolved;
      document.documentElement.dataset.bsTheme = resolved;
      document.documentElement.dataset.accent = preferences.accent;
      document
        .querySelector('meta[name="theme-color"]')
        ?.setAttribute('content', resolved === 'dark' ? '#17191e' : '#f5f7fb');
    };
    apply();
    const media = matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', apply);
    try {
      localStorage.setItem('workspace.preferences.v1', JSON.stringify(preferences));
    } catch {
      setStorageAvailable(false);
    }
    return () => media.removeEventListener('change', apply);
  }, [preferences]);

  useEffect(() => {
    try {
      localStorage.setItem('workspace.demo.v1', JSON.stringify(data));
    } catch {
      setStorageAvailable(false);
    }
  }, [data]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const dismissToast = (id: string) =>
    setToasts((current) => current.filter((item) => item.id !== id));
  const toast = (message: string, tone: Toast['tone'] = 'success') => {
    const id = crypto.randomUUID();
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    timers.current.push(setTimeout(() => dismissToast(id), 6000));
  };
  const event = (
    action: string,
    subject: string,
    category: ActivityItem['category'],
  ): ActivityItem => ({
    id: crypto.randomUUID(),
    person: preferences.name,
    action,
    subject,
    category,
    time: new Date().toISOString(),
    tone: 'teal',
  });
  const value: WorkspaceState = {
    preferences,
    data,
    toasts,
    toast,
    dismissToast,
    savePreferences: (next) => {
      setPreferences(next);
      toast(
        storageAvailable
          ? 'Preferences saved in this browser.'
          : 'Preferences applied for this session. Browser storage is unavailable.',
        storageAvailable ? 'success' : 'info',
      );
    },
    toggleTheme: () =>
      setPreferences((current) => ({
        ...current,
        theme: document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark',
      })),
    addProject: (project) => {
      setData((current) => ({
        ...current,
        projects: [
          {
            ...project,
            id: crypto.randomUUID(),
            progress: project.status === 'Complete' ? 100 : 0,
            team: [preferences.name],
          },
          ...current.projects,
        ],
        activity: [event('created', project.name, 'Projects'), ...current.activity].slice(0, 100),
      }));
      toast('Project created in your demo workspace.');
    },
    updateProject: (id, status) => {
      const project = data.projects.find((item) => item.id === id);
      if (!project) return;
      setData((current) => ({
        ...current,
        projects: current.projects.map((item) =>
          item.id === id
            ? {
                ...item,
                status,
                progress:
                  status === 'Complete' ? 100 : item.status === 'Complete' ? 0 : item.progress,
              }
            : item,
        ),
        activity: [
          event(`changed the status to ${status.toLowerCase()} for`, project.name, 'Projects'),
          ...current.activity,
        ].slice(0, 100),
      }));
      toast('Project status updated.');
    },
    addPerson: (person) => {
      setData((current) => ({
        ...current,
        people: [
          ...current.people,
          { ...person, id: crypto.randomUUID(), status: 'Invited', tone: 'violet' },
        ],
        activity: [
          event('added a demo invitation for', person.name, 'People'),
          ...current.activity,
        ].slice(0, 100),
      }));
      toast('Demo invitation added. No email was sent.', 'info');
    },
    resetDemo: () => {
      setData({ projects: initialProjects, people: initialPeople, activity: initialActivity });
      setPreferences(defaultPreferences);
      toast('Demo workspace reset to its starting point.');
    },
  };
  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error('useWorkspace requires a WorkspaceProvider');
  return context;
}

/** CSV cells are escaped and spreadsheet formula prefixes neutralised. */
export function downloadCsv(filename: string, rows: (string | number)[][]) {
  const body = rows
    .map((row) =>
      row
        .map((cell) => {
          let value = String(cell);
          if (/^[\s]*[=+\-@\t\r]/.test(value)) value = `'${value}`;
          return `"${value.replaceAll('"', '""')}"`;
        })
        .join(','),
    )
    .join('\r\n');
  const url = URL.createObjectURL(new Blob(['\uFEFF', body], { type: 'text/csv;charset=utf-8;' }));
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
