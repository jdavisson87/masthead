import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Button } from '../Button/Button';
import { Tooltip, TooltipTrigger } from './Tooltip';

function Example() {
  return (
    <TooltipTrigger delay={0} closeDelay={0}>
      <Button>Save</Button>
      <Tooltip>Save your changes</Tooltip>
    </TooltipTrigger>
  );
}

describe('Tooltip', () => {
  it('is hidden by default', () => {
    render(<Example />);
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument();
  });

  it('shows on hover and hides when the pointer leaves', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Save' });
    // React Aria shows hover tooltips only once it has seen a pointer move (a real mouse always
    // has), so move the pointer first to switch it out of its initial "keyboard" assumption.
    await userEvent.hover(document.body);
    await userEvent.hover(trigger);
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Save your changes');
    await userEvent.unhover(trigger);
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('shows on keyboard focus', async () => {
    render(<Example />);
    await userEvent.tab();
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Save your changes');
  });

  it('describes the trigger while open', async () => {
    render(<Example />);
    const trigger = screen.getByRole('button', { name: 'Save' });
    await userEvent.tab();
    await screen.findByRole('tooltip');
    await waitFor(() => expect(trigger).toHaveAccessibleDescription('Save your changes'));
  });

  it('closes on Escape', async () => {
    render(<Example />);
    await userEvent.tab();
    await screen.findByRole('tooltip');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('tooltip')).not.toBeInTheDocument());
  });

  it('has no axe violations when open', async () => {
    render(<Example />);
    await userEvent.tab();
    await screen.findByRole('tooltip');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
