export type ProjectStatus = 'In progress' | 'In review' | 'Planned' | 'Complete';
export type Project = {
  id: string;
  name: string;
  description: string;
  category: string;
  status: ProjectStatus;
  progress: number;
  due: string;
  team: string[];
  workspaceTeam?: string;
  tone: 'teal' | 'violet' | 'blue' | 'rose';
};
export type Person = {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Editor' | 'Member';
  department: string;
  status: 'Active' | 'Invited';
  tone: 'teal' | 'violet' | 'blue' | 'rose';
};
export type ActivityItem = {
  id: string;
  person: string;
  action: string;
  subject: string;
  category: 'Projects' | 'People' | 'Workspace';
  time: string;
  tone: 'teal' | 'violet' | 'blue' | 'rose';
};

// Fictional records. No production data, accounts or service connections.
export const initialProjects: Project[] = [
  {
    id: 'p1',
    name: 'Brand refresh',
    description: 'A fresh identity for the next chapter.',
    category: 'Design',
    status: 'In progress',
    progress: 68,
    due: '2026-11-12',
    team: ['Alex Morgan', 'Jamie Lee', 'Sam Taylor'],
    tone: 'violet',
  },
  {
    id: 'p2',
    name: 'Customer portal',
    description: 'Make every customer interaction a little easier.',
    category: 'Product',
    status: 'In review',
    progress: 92,
    due: '2026-11-18',
    team: ['Jordan Ellis', 'Casey Reed'],
    tone: 'teal',
  },
  {
    id: 'p3',
    name: 'Autumn campaign',
    description: 'Bring our community together with a new story.',
    category: 'Marketing',
    status: 'In progress',
    progress: 45,
    due: '2026-11-22',
    team: ['Jamie Lee', 'Robin Chen', 'Sam Taylor'],
    tone: 'rose',
  },
  {
    id: 'p4',
    name: 'Operations playbook',
    description: 'Simple processes that give the team room to grow.',
    category: 'Operations',
    status: 'Planned',
    progress: 15,
    due: '2026-12-02',
    team: ['Alex Morgan', 'Taylor Blake'],
    tone: 'blue',
  },
  {
    id: 'p5',
    name: 'Website launch',
    description: 'A welcoming home for everything we do.',
    category: 'Product',
    status: 'Complete',
    progress: 100,
    due: '2026-10-14',
    team: ['Jordan Ellis', 'Casey Reed', 'Jamie Lee'],
    tone: 'teal',
  },
  {
    id: 'p6',
    name: 'Team onboarding',
    description: 'Help new teammates feel at home from day one.',
    category: 'People',
    status: 'In progress',
    progress: 35,
    due: '2026-12-08',
    team: ['Taylor Blake', 'Robin Chen'],
    tone: 'violet',
  },
];

export const initialPeople: Person[] = [
  {
    id: 'u1',
    name: 'Alex Morgan',
    email: 'alex@example.com',
    role: 'Admin',
    department: 'Operations',
    status: 'Active',
    tone: 'teal',
  },
  {
    id: 'u2',
    name: 'Jamie Lee',
    email: 'jamie@example.com',
    role: 'Editor',
    department: 'Design',
    status: 'Active',
    tone: 'violet',
  },
  {
    id: 'u3',
    name: 'Sam Taylor',
    email: 'sam@example.com',
    role: 'Member',
    department: 'Marketing',
    status: 'Active',
    tone: 'rose',
  },
  {
    id: 'u4',
    name: 'Jordan Ellis',
    email: 'jordan@example.com',
    role: 'Editor',
    department: 'Product',
    status: 'Active',
    tone: 'blue',
  },
  {
    id: 'u5',
    name: 'Casey Reed',
    email: 'casey@example.com',
    role: 'Member',
    department: 'Product',
    status: 'Active',
    tone: 'teal',
  },
  {
    id: 'u6',
    name: 'Robin Chen',
    email: 'robin@example.com',
    role: 'Member',
    department: 'Marketing',
    status: 'Active',
    tone: 'violet',
  },
  {
    id: 'u7',
    name: 'Taylor Blake',
    email: 'taylor@example.com',
    role: 'Editor',
    department: 'People',
    status: 'Active',
    tone: 'blue',
  },
  {
    id: 'u8',
    name: 'Drew Parker',
    email: 'drew@example.com',
    role: 'Member',
    department: 'Design',
    status: 'Invited',
    tone: 'rose',
  },
];

export const initialActivity: ActivityItem[] = [
  {
    id: 'a1',
    person: 'Jamie Lee',
    action: 'updated the design direction for',
    subject: 'Brand refresh',
    category: 'Projects',
    time: '2026-10-21T09:42:00+08:00',
    tone: 'violet',
  },
  {
    id: 'a2',
    person: 'Jordan Ellis',
    action: 'moved a project into review:',
    subject: 'Customer portal',
    category: 'Projects',
    time: '2026-10-21T09:15:00+08:00',
    tone: 'teal',
  },
  {
    id: 'a3',
    person: 'Alex Morgan',
    action: 'added a new teammate:',
    subject: 'Drew Parker',
    category: 'People',
    time: '2026-10-20T16:30:00+08:00',
    tone: 'blue',
  },
  {
    id: 'a4',
    person: 'Sam Taylor',
    action: 'shared a campaign update for',
    subject: 'Autumn campaign',
    category: 'Projects',
    time: '2026-10-20T14:05:00+08:00',
    tone: 'rose',
  },
  {
    id: 'a5',
    person: 'Taylor Blake',
    action: 'published the team handbook in',
    subject: 'Workspace',
    category: 'Workspace',
    time: '2026-10-20T11:20:00+08:00',
    tone: 'blue',
  },
  {
    id: 'a6',
    person: 'Casey Reed',
    action: 'completed',
    subject: 'Website launch',
    category: 'Projects',
    time: '2026-10-19T15:00:00+08:00',
    tone: 'teal',
  },
];

export const formatDate = (date: string) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(`${date}T12:00:00`),
  );
export const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase();
