import { useState } from 'react';
import { IconActivity, IconDownload } from '@tabler/icons-react';
import { useWorkspace, downloadCsv } from '../store';
import { Avatar, Badge, Button, Card, EmptyState, PageHeading } from '../components/ui';

export function Activity() {
  const { data, toast } = useWorkspace();
  const [filter, setFilter] = useState('Everything');
  const items = data.activity.filter((item) => filter === 'Everything' || filter === item.category);
  return (
    <>
      <PageHeading
        eyebrow="Stay in the loop"
        title="Activity"
        description="A shared story of progress, one small update at a time."
        actions={
          <Button
            variant="secondary"
            onClick={() => {
              downloadCsv('workspace-activity.csv', [
                ['Person', 'Action', 'Subject', 'Category', 'Time'],
                ...items.map((a) => [a.person, a.action, a.subject, a.category, a.time]),
              ]);
              toast('Activity snapshot downloaded.');
            }}
          >
            <IconDownload size={17} />
            Export activity
          </Button>
        }
      />
      <div className="activity-layout">
        <Card className="activity-feed">
          <div className="panel-heading">
            <div>
              <h2>Workspace updates</h2>
              <p>Sample history and the changes you make in this demo.</p>
            </div>
            <span className="action-icon tone-blue">
              <IconActivity size={21} />
            </span>
          </div>
          <div className="tabs" role="group" aria-label="Activity category">
            {['Everything', 'Projects', 'People', 'Workspace'].map((value) => (
              <button
                key={value}
                className={filter === value ? 'active' : ''}
                aria-pressed={filter === value}
                onClick={() => setFilter(value)}
              >
                {value}
              </button>
            ))}
          </div>
          {items.length ? (
            <ol className="timeline">
              {items.map((item) => (
                <li key={item.id}>
                  <Avatar name={item.person} tone={item.tone} />
                  <div className="timeline-content">
                    <div>
                      <strong>{item.person}</strong>
                      <Badge tone="neutral">{item.category}</Badge>
                    </div>
                    <p>
                      {item.action} <strong>{item.subject}</strong>
                    </p>
                    <time dateTime={item.time}>
                      {new Intl.DateTimeFormat('en', {
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      }).format(new Date(item.time))}
                    </time>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <EmptyState
              title="A quiet corner"
              description="Create a project or add a demo teammate to see new updates here."
            />
          )}
        </Card>
        <div className="activity-aside">
          <Card>
            <span className="action-icon tone-teal">
              <IconActivity size={23} />
            </span>
            <h2>A little context</h2>
            <p>Activity gives your team a shared view of what’s changing.</p>
            <dl className="compact-stats">
              <div>
                <dt>Total updates</dt>
                <dd>{data.activity.length}</dd>
              </div>
              <div>
                <dt>Project updates</dt>
                <dd>{data.activity.filter((a) => a.category === 'Projects').length}</dd>
              </div>
              <div>
                <dt>People updates</dt>
                <dd>{data.activity.filter((a) => a.category === 'People').length}</dd>
              </div>
            </dl>
          </Card>
          <div className="info-note">
            This feed is stored locally. Connect your own audit or event API when using this layout
            in a real application.
          </div>
        </div>
      </div>
    </>
  );
}
