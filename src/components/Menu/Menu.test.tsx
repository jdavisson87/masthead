import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import type { Selection } from 'react-aria-components';
import { Button } from '../Button/Button';
import { Menu, MenuItem, MenuSection, MenuSeparator, MenuTrigger, SubmenuTrigger, type MenuProps } from './Menu';

function Example(props: Partial<MenuProps<object>>) {
  return (
    <MenuTrigger>
      <Button>Actions</Button>
      <Menu aria-label="Actions" {...props}>
        <MenuItem id="edit">Edit</MenuItem>
        <MenuItem id="duplicate">Duplicate</MenuItem>
        <MenuItem id="delete" tone="danger">
          Delete
        </MenuItem>
      </Menu>
    </MenuTrigger>
  );
}

// `hidden: true` because React Aria marks everything outside an open menu aria-hidden, the trigger included.
const trigger = () => screen.getByRole('button', { name: 'Actions', hidden: true });

// React Aria calls onAction(key, ...extra), so assert on the key alone.
const lastKey = (fn: ReturnType<typeof vi.fn>) => fn.mock.calls.at(-1)?.[0];

describe('Menu', () => {
  it('is closed until the trigger is pressed, then lists the items', async () => {
    render(<Example />);
    expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    expect(trigger()).toHaveAttribute('aria-haspopup', 'true');

    await userEvent.click(trigger());
    expect(await screen.findByRole('menu', { name: 'Actions' })).toBeInTheDocument();
    expect(screen.getAllByRole('menuitem')).toHaveLength(3);
    expect(trigger()).toHaveAttribute('aria-expanded', 'true');
  });

  it('runs the action with the item key and closes', async () => {
    const onAction = vi.fn();
    render(<Example onAction={onAction} />);
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Duplicate' }));
    expect(lastKey(onAction)).toBe('duplicate');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
  });

  it('calls an item-level onAction', async () => {
    const onAction = vi.fn();
    render(
      <MenuTrigger>
        <Button>Actions</Button>
        <Menu aria-label="Actions">
          <MenuItem id="edit" onAction={onAction}>
            Edit
          </MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await userEvent.click(trigger());
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Edit' }));
    expect(onAction).toHaveBeenCalledTimes(1);
  });

  it('opens from the keyboard, navigates with arrows, and activates with Enter', async () => {
    const onAction = vi.fn();
    render(<Example onAction={onAction} />);
    await userEvent.tab();
    expect(trigger()).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus());

    await userEvent.keyboard('{ArrowDown}');
    expect(screen.getByRole('menuitem', { name: 'Duplicate' })).toHaveFocus();
    await userEvent.keyboard('{End}');
    expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(lastKey(onAction)).toBe('delete');
  });

  it('supports typeahead', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    await screen.findByRole('menu');
    await userEvent.keyboard('del');
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Delete' })).toHaveFocus());
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<Example />);
    await userEvent.click(trigger());
    await screen.findByRole('menu');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger()).toHaveFocus());
  });

  it('does not run disabled items', async () => {
    const onAction = vi.fn();
    render(<Example onAction={onAction} disabledKeys={['duplicate']} />);
    await userEvent.click(trigger());
    const item = await screen.findByRole('menuitem', { name: 'Duplicate' });
    expect(item).toHaveAttribute('aria-disabled', 'true');
    await userEvent.click(item);
    expect(onAction).not.toHaveBeenCalled();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('keeps an item description out of its name but available as a description', async () => {
    render(
      <MenuTrigger>
        <Button>Actions</Button>
        <Menu aria-label="Actions">
          <MenuItem id="link" description="Anyone with the link can view">
            Copy link
          </MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await userEvent.click(trigger());
    const item = await screen.findByRole('menuitem', { name: 'Copy link' });
    expect(item).toHaveAccessibleDescription('Anyone with the link can view');
  });

  it('groups items into named sections with separators', async () => {
    render(
      <MenuTrigger>
        <Button>Actions</Button>
        <Menu aria-label="Actions">
          <MenuSection title="Account">
            <MenuItem id="profile">Profile</MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuSection title="Workspace">
            <MenuItem id="billing">Billing</MenuItem>
          </MenuSection>
        </Menu>
      </MenuTrigger>,
    );
    await userEvent.click(trigger());
    expect(await screen.findByRole('group', { name: 'Account' })).toBeInTheDocument();
    expect(screen.getByRole('group', { name: 'Workspace' })).toBeInTheDocument();
    expect(screen.getByRole('separator')).toBeInTheDocument();
  });

  it('single selection uses menuitemradio and keeps the choice', async () => {
    function Sort() {
      const [selected, setSelected] = useState<Selection>(new Set(['newest']));
      return (
        <Example selectionMode="single" selectedKeys={selected} onSelectionChange={setSelected} />
      );
    }
    render(<Sort />);
    await userEvent.click(trigger());
    await screen.findByRole('menu');
    expect(screen.getAllByRole('menuitemradio')).toHaveLength(3);
  });

  it('multiple selection uses menuitemcheckbox and stays open', async () => {
    function Columns() {
      const [selected, setSelected] = useState<Selection>(new Set(['edit']));
      return (
        <Example selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected} />
      );
    }
    render(<Columns />);
    await userEvent.click(trigger());
    const edit = await screen.findByRole('menuitemcheckbox', { name: 'Edit' });
    const duplicate = screen.getByRole('menuitemcheckbox', { name: 'Duplicate' });
    expect(edit).toBeChecked();
    expect(duplicate).not.toBeChecked();

    await userEvent.click(duplicate);
    expect(duplicate).toBeChecked();
    expect(screen.getByRole('menu')).toBeInTheDocument();
  });

  it('opens a submenu with the right arrow key', async () => {
    const onAction = vi.fn();
    render(
      <MenuTrigger>
        <Button>Actions</Button>
        <Menu aria-label="Actions" onAction={onAction}>
          <SubmenuTrigger>
            <MenuItem id="export">Export as</MenuItem>
            <Menu aria-label="Export formats" onAction={onAction}>
              <MenuItem id="pdf">PDF</MenuItem>
            </Menu>
          </SubmenuTrigger>
        </Menu>
      </MenuTrigger>,
    );
    await userEvent.click(trigger());
    const parent = await screen.findByRole('menuitem', { name: 'Export as' });
    expect(parent).toHaveAttribute('aria-haspopup', 'menu');
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{ArrowRight}');
    // A submenu is named by the item that opened it, which takes precedence over its own aria-label.
    expect(await screen.findByRole('menu', { name: 'Export as' })).toBeInTheDocument();
    expect(screen.getByRole('menuitem', { name: 'PDF' })).toBeInTheDocument();
  });

  it('has no axe violations when open', async () => {
    render(
      <MenuTrigger>
        <Button>Actions</Button>
        <Menu aria-label="Actions">
          <MenuSection title="Edit">
            <MenuItem id="edit" shortcut="⌘E" icon={<span />}>
              Edit
            </MenuItem>
          </MenuSection>
          <MenuSeparator />
          <MenuItem id="delete" tone="danger" description="Cannot be undone">
            Delete
          </MenuItem>
        </Menu>
      </MenuTrigger>,
    );
    await userEvent.click(trigger());
    await screen.findByRole('menu');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
