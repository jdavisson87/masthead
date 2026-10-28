import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Kbd, describeKey, matchesShortcut, useKeyboardShortcut } from './Kbd';

describe('describeKey', () => {
  it('maps mod per platform', () => {
    expect(describeKey('mod', 'mac')).toEqual(['⌘', 'Command']);
    expect(describeKey('mod', 'other')).toEqual(['Ctrl', 'Control']);
  });
  it('uppercases single letters and keeps shared names', () => {
    expect(describeKey('k', 'mac')).toEqual(['K', 'K']);
    expect(describeKey('enter', 'other')).toEqual(['↵', 'Enter']);
  });
});

describe('Kbd', () => {
  it('shows Mac glyphs with full names for screen readers', () => {
    render(<Kbd keys={['mod', 'K']} platform="mac" />);
    expect(screen.getByText('⌘')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByText('Command')).toHaveClass('sr-only');
    expect(screen.getByText('K')).toBeInTheDocument();
  });

  it('shows Ctrl on other platforms', () => {
    render(<Kbd keys={['mod', 'K']} platform="other" />);
    expect(screen.getByText('Control')).toBeInTheDocument();
    expect(screen.queryByText('⌘')).not.toBeInTheDocument();
  });

  it('speaks "plus" between keys', () => {
    render(<Kbd keys={['shift', 'alt', 'enter']} platform="other" />);
    expect(screen.getAllByText('plus')).toHaveLength(2);
  });

  it('nests <kbd> elements for a combination', () => {
    const { container } = render(<Kbd keys={['mod', 'K']} platform="mac" />);
    expect(container.querySelectorAll('kbd')).toHaveLength(3);
  });

  it('has no axe violations', async () => {
    const { container } = render(<Kbd keys={['mod', 'K']} platform="mac" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('matchesShortcut', () => {
  const ev = (init: KeyboardEventInit) => new KeyboardEvent('keydown', init);
  it('requires the exact modifiers', () => {
    expect(matchesShortcut(ev({ key: 'k', ctrlKey: true }), ['mod', 'K'], 'other')).toBe(true);
    expect(matchesShortcut(ev({ key: 'k', metaKey: true }), ['mod', 'K'], 'mac')).toBe(true);
    expect(matchesShortcut(ev({ key: 'k', metaKey: true }), ['mod', 'K'], 'other')).toBe(false);
    expect(matchesShortcut(ev({ key: 'k', ctrlKey: true, shiftKey: true }), ['mod', 'K'], 'other')).toBe(false);
    expect(matchesShortcut(ev({ key: 'k' }), ['mod', 'K'], 'other')).toBe(false);
  });
  it('maps named keys', () => {
    expect(matchesShortcut(ev({ key: 'Escape' }), ['esc'], 'other')).toBe(true);
    expect(matchesShortcut(ev({ key: 'ArrowUp', shiftKey: true }), ['shift', 'up'], 'other')).toBe(true);
  });
});

describe('useKeyboardShortcut', () => {
  function Harness({ onRun, enabled = true }: { onRun: () => void; enabled?: boolean }) {
    useKeyboardShortcut(['mod', 'K'], onRun, { platform: 'other', enabled });
    return <input aria-label="Search" />;
  }

  it('fires on the shortcut', async () => {
    const onRun = vi.fn();
    render(<Harness onRun={onRun} />);
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(onRun).toHaveBeenCalledTimes(1);
  });

  it('ignores the shortcut while typing in an input', async () => {
    const onRun = vi.fn();
    render(<Harness onRun={onRun} />);
    await userEvent.click(screen.getByLabelText('Search'));
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(onRun).not.toHaveBeenCalled();
  });

  it('does nothing when disabled', async () => {
    const onRun = vi.fn();
    render(<Harness onRun={onRun} enabled={false} />);
    await userEvent.keyboard('{Control>}k{/Control}');
    expect(onRun).not.toHaveBeenCalled();
  });
});
