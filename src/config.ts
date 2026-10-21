import {
  IconLayoutDashboard,
  IconFolder,
  IconUsers,
  IconActivity,
  IconComponents,
  IconSettings,
  IconForms,
  IconClick,
  IconTable,
  IconBell,
} from '@tabler/icons-react';

/** The main integration point: replace branding and navigation for your business. */
export const dashboardConfig = {
  name: 'Workspace',
  tagline: 'A little more organised.',
  workspaceLabel: 'Studio workspace',
  repository: 'https://github.com/imluri/workspace-dashboard',
  navigation: [
    {
      label: 'Your workspace',
      items: [
        {
          label: 'Overview',
          to: '/',
          icon: IconLayoutDashboard,
          description: 'Quick actions, work areas and your next steps',
        },
        {
          label: 'Projects',
          to: '/projects',
          icon: IconFolder,
          description: 'Manage projects, progress and delivery dates',
        },
        {
          label: 'People',
          to: '/people',
          icon: IconUsers,
          description: 'Browse your team and add demo members',
        },
        {
          label: 'Activity',
          to: '/activity',
          icon: IconActivity,
          description: 'Recent workspace updates and events',
        },
      ],
    },
    {
      label: 'Make it yours',
      items: [
        {
          label: 'Elements',
          to: '/elements',
          icon: IconComponents,
          description: 'Reusable buttons, forms, feedback and tables',
        },
        {
          label: 'Settings',
          to: '/settings',
          icon: IconSettings,
          description: 'Branding, profile, theme and preferences',
        },
      ],
    },
  ],
  features: [
    {
      label: 'Buttons & actions',
      to: '/elements?section=buttons',
      icon: IconClick,
      description: 'Primary, secondary, destructive and icon buttons',
    },
    {
      label: 'Forms & inputs',
      to: '/elements?section=forms',
      icon: IconForms,
      description: 'Dropdowns, text fields, validation and switches',
    },
    {
      label: 'Tables & empty states',
      to: '/elements?section=tables',
      icon: IconTable,
      description: 'Responsive data lists and helpful empty states',
    },
    {
      label: 'Dialogs & feedback',
      to: '/elements?section=feedback',
      icon: IconBell,
      description: 'Accessible dialogs, alerts and toast messages',
    },
    {
      label: 'Appearance',
      to: '/settings?section=appearance',
      icon: IconSettings,
      description: 'Light, dark and system modes with four accent colours',
    },
  ],
};

export const searchEntries = [
  ...dashboardConfig.navigation.flatMap((group) => group.items),
  ...dashboardConfig.features,
];
