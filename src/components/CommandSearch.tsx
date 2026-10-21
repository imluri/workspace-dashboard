import { useEffect, useId, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import { IconArrowUpRight, IconSearch, IconCornerDownLeft } from '@tabler/icons-react';
import { searchEntries } from '../config';
import { Dialog, EmptyState } from './ui';

export function CommandSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const input = useRef<HTMLInputElement>(null);
  const listId = useId();
  const navigate = useNavigate();
  const normalise = (value: string) =>
    value
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  const words = normalise(query).trim().split(/\s+/);
  const results = searchEntries.filter((item) =>
    words.every((word) => normalise(`${item.label} ${item.description}`).includes(word)),
  );
  useEffect(() => {
    if (open) {
      setQuery('');
      setSelected(0);
      input.current?.focus();
    }
  }, [open]);
  useEffect(() => {
    document.getElementById(`${listId}-${selected}`)?.scrollIntoView({ block: 'nearest' });
  }, [selected, listId]);
  const choose = (to: string) => {
    onClose();
    navigate(to);
  };
  return (
    <Dialog
      open={open}
      onClose={onClose}
      title="Find your next step"
      description="Search pages, features and settings."
      className="command-dialog"
    >
      <div className="command-input-wrap">
        <IconSearch size={21} />
        <input
          ref={input}
          autoFocus
          type="search"
          className="form-control command-input"
          placeholder="Where would you like to go?"
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setSelected(0);
          }}
          role="combobox"
          aria-label="Search workspace"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls={listId}
          aria-activedescendant={results.length ? `${listId}-${selected}` : undefined}
          onKeyDown={(event) => {
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
              event.preventDefault();
              setSelected((current) =>
                results.length
                  ? (current + (event.key === 'ArrowDown' ? 1 : -1) + results.length) %
                    results.length
                  : 0,
              );
            }
            if (event.key === 'Enter' && results[selected]) {
              event.preventDefault();
              choose(results[selected].to);
            }
          }}
        />
      </div>
      <div className="command-results" id={listId} role="listbox" aria-label="Navigation results">
        <p className="eyebrow command-label">
          {query
            ? `${results.length} result${results.length === 1 ? '' : 's'}`
            : 'Pages & features'}
        </p>
        {results.map((item, index) => (
          <button
            key={item.to}
            id={`${listId}-${index}`}
            className={`command-result ${index === selected ? 'selected' : ''}`}
            role="option"
            aria-selected={index === selected}
            tabIndex={-1}
            onPointerMove={() => setSelected(index)}
            onClick={() => choose(item.to)}
          >
            <span className="command-result-icon">
              <item.icon size={20} />
            </span>
            <span>
              <strong>{item.label}</strong>
              <small>{item.description}</small>
            </span>
            <IconArrowUpRight size={17} />
          </button>
        ))}
        {!results.length && (
          <EmptyState
            title="No matches yet"
            description="Try “forms”, “projects”, or “appearance”."
          />
        )}
      </div>
      <div className="command-footer">
        <span>
          <kbd>↑</kbd>
          <kbd>↓</kbd> to explore
        </span>
        <span>
          <IconCornerDownLeft size={14} /> to open
        </span>
        <span>
          <kbd>esc</kbd> to close
        </span>
      </div>
    </Dialog>
  );
}
