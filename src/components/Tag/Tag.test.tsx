import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import type { Key } from 'react-aria-components';
import { Tag, TagGroup, type TagGroupProps } from './Tag';

function Example(props: Partial<TagGroupProps<object>>) {
  return (
    <TagGroup label="Filters" {...props}>
      <Tag id="open">Open</Tag>
      <Tag id="urgent">Urgent</Tag>
      <Tag id="done">Done</Tag>
    </TagGroup>
  );
}

describe('TagGroup', () => {
  it('is a labelled grid of tags', () => {
    render(<Example />);
    expect(screen.getByRole('grid', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getAllByRole('row')).toHaveLength(3);
    expect(screen.getByRole('row', { name: 'Open' })).toBeInTheDocument();
  });

  it('links the description to the group', () => {
    render(<Example description="Pick any." />);
    expect(screen.getByRole('grid', { name: 'Filters' })).toHaveAccessibleDescription('Pick any.');
  });

  it('can hide the label visually and keep it for assistive tech', () => {
    render(<Example hideLabel />);
    expect(screen.getByRole('grid', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Filters')).toHaveClass('sr-only');
  });

  it.each([
    ['sm', 'h-6'],
    ['md', 'h-7'],
  ] as const)('sizes %s tags', (size, expected) => {
    render(<Example size={size} />);
    expect(screen.getByRole('row', { name: 'Open' })).toHaveClass(expected);
  });

  describe('selection', () => {
    it('toggles tags in multiple mode and reports the keys', async () => {
      const onSelectionChange = vi.fn();
      render(<Example selectionMode="multiple" onSelectionChange={onSelectionChange} />);
      await userEvent.click(screen.getByRole('row', { name: 'Open' }));
      await userEvent.click(screen.getByRole('row', { name: 'Urgent' }));
      expect(screen.getByRole('row', { name: 'Open' })).toHaveAttribute('aria-selected', 'true');
      expect(screen.getByRole('row', { name: 'Urgent' })).toHaveAttribute('aria-selected', 'true');
      expect([...(onSelectionChange.mock.calls.at(-1)?.[0] as Set<Key>)]).toEqual(['open', 'urgent']);

      await userEvent.click(screen.getByRole('row', { name: 'Open' }));
      expect(screen.getByRole('row', { name: 'Open' })).toHaveAttribute('aria-selected', 'false');
    });

    it('keeps one tag selected in single mode', async () => {
      render(<Example selectionMode="single" />);
      await userEvent.click(screen.getByRole('row', { name: 'Open' }));
      await userEvent.click(screen.getByRole('row', { name: 'Done' }));
      expect(screen.getByRole('row', { name: 'Open' })).toHaveAttribute('aria-selected', 'false');
      expect(screen.getByRole('row', { name: 'Done' })).toHaveAttribute('aria-selected', 'true');
    });

    it('shows a check mark on selected tags, not just a color change', () => {
      render(<Example selectionMode="multiple" defaultSelectedKeys={['open']} />);
      expect(screen.getByRole('row', { name: 'Open' }).querySelector('svg')).toBeInTheDocument();
      expect(screen.getByRole('row', { name: 'Urgent' }).querySelector('svg')).not.toBeInTheDocument();
    });

    it('moves with the arrow keys and toggles with Space', async () => {
      render(<Example selectionMode="multiple" />);
      await userEvent.tab();
      expect(screen.getByRole('row', { name: 'Open' })).toContainElement(document.activeElement as HTMLElement);
      await userEvent.keyboard('{ArrowRight}');
      expect(screen.getByRole('row', { name: 'Urgent' })).toContainElement(document.activeElement as HTMLElement);
      await userEvent.keyboard(' ');
      expect(screen.getByRole('row', { name: 'Urgent' })).toHaveAttribute('aria-selected', 'true');
    });

    it('does not select a disabled tag', async () => {
      render(<Example selectionMode="multiple" disabledKeys={['done']} />);
      const tag = screen.getByRole('row', { name: 'Done' });
      expect(tag).toHaveAttribute('aria-disabled', 'true');
      await userEvent.click(tag);
      expect(tag).not.toHaveAttribute('aria-selected', 'true');
    });
  });

  describe('removal', () => {
    function Removable({ onRemove }: { onRemove?: (keys: Set<Key>) => void }) {
      const [items, setItems] = useState([
        { id: 'react', name: 'React' },
        { id: 'ts', name: 'TypeScript' },
      ]);
      return (
        <TagGroup
          label="Skills"
          items={items}
          emptyMessage="No skills."
          onRemove={(keys) => {
            onRemove?.(keys as Set<Key>);
            setItems((list) => list.filter((i) => !(keys as Set<Key>).has(i.id)));
          }}
        >
          {(item: { id: string; name: string }) => <Tag id={item.id}>{item.name}</Tag>}
        </TagGroup>
      );
    }

    it('gives each tag a remove button', () => {
      render(<Removable />);
      expect(screen.getAllByRole('button', { name: /remove/i })).toHaveLength(2);
    });

    it('removes a tag with its button', async () => {
      const onRemove = vi.fn();
      render(<Removable onRemove={onRemove} />);
      await userEvent.click(screen.getAllByRole('button', { name: /remove/i })[0] as HTMLElement);
      expect([...(onRemove.mock.calls[0]?.[0] as Set<Key>)]).toEqual(['react']);
      expect(screen.queryByRole('row', { name: 'React' })).not.toBeInTheDocument();
      expect(screen.getByRole('row', { name: 'TypeScript' })).toBeInTheDocument();
    });

    it('removes the focused tag with Delete', async () => {
      render(<Removable />);
      await userEvent.tab();
      await userEvent.keyboard('{Delete}');
      expect(screen.queryByRole('row', { name: 'React' })).not.toBeInTheDocument();
    });

    it('shows the empty message once everything is removed', async () => {
      render(<Removable />);
      await userEvent.click(screen.getAllByRole('button', { name: /remove/i })[0] as HTMLElement);
      await userEvent.click(screen.getAllByRole('button', { name: /remove/i })[0] as HTMLElement);
      expect(screen.getByText('No skills.')).toBeInTheDocument();
    });
  });

  it.each<[string, Partial<TagGroupProps<object>>]>([
    ['static', {}],
    ['selectable', { selectionMode: 'multiple', defaultSelectedKeys: ['open'] }],
    ['described', { description: 'Pick any.' }],
    ['hidden label', { hideLabel: true }],
    ['disabled tag', { selectionMode: 'single', disabledKeys: ['done'] }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<Example {...props} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when removable', async () => {
    const { container } = render(
      <TagGroup label="Skills" onRemove={() => {}}>
        <Tag id="react">React</Tag>
        <Tag id="ts">TypeScript</Tag>
      </TagGroup>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
