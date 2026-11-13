import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { CommandItem, CommandPalette, CommandSection, type CommandPaletteProps } from './CommandPalette';

// jsdom reports no platform, so "mod" means Control here.
const openShortcut = '{Control>}k{/Control}';

function Example({ onSettings, ...props }: Partial<CommandPaletteProps> & { onSettings?: () => void }) {
  return (
    <>
      <button type="button">Elsewhere</button>
      <CommandPalette {...props}>
        <CommandSection title="Navigation">
          <CommandItem id="dashboard" shortcut={['mod', 'D']}>
            Go to dashboard
          </CommandItem>
          <CommandItem id="settings" description="Profile, notifications, billing" onAction={onSettings}>
            Open settings
          </CommandItem>
        </CommandSection>
        <CommandSection title="Appearance">
          <CommandItem id="theme" keywords={['dark', 'light', 'mode']}>
            Toggle theme
          </CommandItem>
        </CommandSection>
      </CommandPalette>
    </>
  );
}

const getSearch = () => screen.getByRole('textbox', { name: 'Search commands' });
const names = () => screen.getAllByRole('menuitem').map((el) => el.querySelector('[slot="label"]')?.textContent);

async function openPalette() {
  await userEvent.keyboard(openShortcut);
  return screen.findByRole('dialog', { name: 'Command palette' });
}

describe('CommandPalette', () => {
  it('is closed until the shortcut is pressed, then focuses the search input', async () => {
    render(<Example />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await openPalette();
    await waitFor(() => expect(getSearch()).toHaveFocus());
    expect(names()).toEqual(['Go to dashboard', 'Open settings', 'Toggle theme']);
  });

  it('closes when the shortcut is pressed again, even from the search input', async () => {
    render(<Example />);
    await openPalette();
    await waitFor(() => expect(getSearch()).toHaveFocus());
    await userEvent.keyboard(openShortcut);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('can use a different shortcut, or none', async () => {
    const { unmount } = render(<Example shortcut={['mod', 'P']} />);
    await userEvent.keyboard(openShortcut);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    await userEvent.keyboard('{Control>}p{/Control}');
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    unmount();

    render(<Example shortcut={null} />);
    await userEvent.keyboard(openShortcut);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('filters as you type and hides sections with no matches', async () => {
    render(<Example />);
    await openPalette();
    await userEvent.type(getSearch(), 'go');
    expect(names()).toEqual(['Go to dashboard']);
    expect(screen.queryByText('Appearance')).not.toBeInTheDocument();
  });

  it('matches hidden keywords without changing the item name', async () => {
    render(<Example />);
    await openPalette();
    await userEvent.type(getSearch(), 'dark');
    expect(screen.getByRole('menuitem', { name: 'Toggle theme' })).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(1);
  });

  it('runs the first match on Enter, reports its id, and closes', async () => {
    const onAction = vi.fn();
    const onSettings = vi.fn();
    render(<Example onAction={onAction} onSettings={onSettings} />);
    await openPalette();
    await userEvent.type(getSearch(), 'sett');
    await userEvent.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledWith('settings');
    expect(onSettings).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('moves the highlight with the arrow keys while focus stays in the input', async () => {
    const onAction = vi.fn();
    render(<Example onAction={onAction} />);
    await openPalette();
    await waitFor(() => expect(getSearch()).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    expect(getSearch()).toHaveFocus();
    // React Aria updates aria-activedescendant just after the highlight moves.
    await waitFor(() => {
      const active = getSearch().getAttribute('aria-activedescendant');
      expect(active && document.getElementById(active)).toHaveAccessibleName('Open settings');
    });
    await userEvent.keyboard('{Enter}');
    expect(onAction).toHaveBeenCalledWith('settings');
  });

  it('runs a command on click', async () => {
    const onAction = vi.fn();
    render(<Example onAction={onAction} />);
    await openPalette();
    await userEvent.click(screen.getByRole('menuitem', { name: 'Toggle theme' }));
    expect(onAction).toHaveBeenCalledWith('theme');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('shows and announces a message when nothing matches', async () => {
    render(<Example />);
    await openPalette();
    await userEvent.type(getSearch(), 'zzz');
    expect(await screen.findByText('No results for “zzz”', { selector: 'div:not([role])' })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent('No results for “zzz”');
    await userEvent.clear(getSearch());
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent(''));
  });

  it('closes on Escape and returns focus to where it was', async () => {
    render(<Example />);
    const elsewhere = screen.getByRole('button', { name: 'Elsewhere' });
    elsewhere.focus();
    await openPalette();
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(elsewhere).toHaveFocus());
  });

  it('clears the search each time it opens', async () => {
    render(<Example />);
    await openPalette();
    await userEvent.type(getSearch(), 'theme');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await openPalette();
    expect(getSearch()).toHaveValue('');
  });

  it('can be controlled', async () => {
    const onOpenChange = vi.fn();
    const { rerender } = render(<Example isOpen={false} onOpenChange={onOpenChange} />);
    await userEvent.keyboard(openShortcut);
    expect(onOpenChange).toHaveBeenCalledWith(true);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    rerender(<Example isOpen onOpenChange={onOpenChange} />);
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
  });

  it('describes items by their description and shortcut', async () => {
    render(<Example />);
    await openPalette();
    expect(screen.getByRole('menuitem', { name: 'Open settings' })).toHaveAccessibleDescription(
      'Profile, notifications, billing',
    );
    expect(screen.getByRole('menuitem', { name: 'Go to dashboard' })).toHaveAccessibleDescription('Control plus D');
  });

  it('has no axe violations when open', async () => {
    render(<Example />);
    await openPalette();
    expect((await axe(document.body, { rules: { region: { enabled: false } } })).violations).toEqual([]);
  });

  it('has no axe violations when nothing matches', async () => {
    render(<Example />);
    await openPalette();
    await userEvent.type(getSearch(), 'zzz');
    expect((await axe(document.body, { rules: { region: { enabled: false } } })).violations).toEqual([]);
  });

  it('has no axe violations when closed', async () => {
    const { container } = render(<Example />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
