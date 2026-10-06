import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '../Button/Button';
import { Dialog, DialogFooter, DialogTrigger, type DialogProps } from './Dialog';

function Example(props: Partial<Omit<DialogProps, 'children'>>) {
  return (
    <DialogTrigger>
      <Button>Delete</Button>
      <Dialog title="Delete project" description="This can't be undone." {...props}>
        {({ close }) => (
          <DialogFooter>
            <Button intent="ghost" onPress={close}>
              Cancel
            </Button>
          </DialogFooter>
        )}
      </Dialog>
    </DialogTrigger>
  );
}

describe('Dialog', () => {
  it('is closed until the trigger is pressed', () => {
    render(<Example />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a dialog named by its title', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('dialog', { name: 'Delete project' })).toBeInTheDocument();
  });

  it('describes the dialog with its description text', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toHaveAccessibleDescription("This can't be undone.");
  });

  it('moves focus into the dialog when it opens', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Delete' });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('closes from the corner close button', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Close dialog' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes from a custom action using the close function', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await userEvent.click(await screen.findByRole('button', { name: 'Cancel' }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('uses the alertdialog role without a close button when asked', async () => {
    render(<Example role="alertdialog" />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    expect(await screen.findByRole('alertdialog', { name: 'Delete project' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Close dialog' })).not.toBeInTheDocument();
  });

  it.each<[string, Partial<Omit<DialogProps, 'children'>>]>([
    ['dialog', {}],
    ['alertdialog', { role: 'alertdialog' }],
  ])('has no axe violations when open (%s)', async (_name, props) => {
    render(<Example {...props} />);
    await userEvent.click(screen.getByRole('button', { name: 'Delete' }));
    await screen.findByRole(props.role ?? 'dialog');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
