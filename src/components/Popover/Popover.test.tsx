import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '../Button/Button';
import { Popover, PopoverDialog, PopoverTrigger } from './Popover';

function Example() {
  return (
    <PopoverTrigger>
      <Button>Filters</Button>
      <Popover>
        <PopoverDialog aria-label="Filters">Pick some filters.</PopoverDialog>
      </Popover>
    </PopoverTrigger>
  );
}

describe('Popover', () => {
  it('is closed until the trigger is pressed', () => {
    render(<Example />);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('opens a named dialog from the trigger', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    expect(await screen.findByRole('dialog', { name: 'Filters' })).toBeInTheDocument();
    expect(screen.getByText('Pick some filters.')).toBeInTheDocument();
  });

  it('reflects open state on the trigger with aria-expanded', async () => {
    render(<Example />);
    // Grab the trigger first: React Aria hides outside content from the a11y tree while open.
    const trigger = screen.getByRole('button', { name: 'Filters' });
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });

  it('moves focus into the popover when it opens', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    const dialog = await screen.findByRole('dialog');
    expect(dialog).toContainElement(document.activeElement as HTMLElement);
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Filters' });
    await userEvent.click(trigger);
    await screen.findByRole('dialog');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
    // React Aria restores focus on the next animation frame, so wait for it.
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('has no axe violations when open', async () => {
    render(<Example />);
    await userEvent.click(screen.getByRole('button', { name: 'Filters' }));
    await screen.findByRole('dialog');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
