import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Banner } from './Banner';

describe('Banner', () => {
  it('is a polite status by default', () => {
    render(<Banner>Scheduled maintenance tonight.</Banner>);
    expect(screen.getByRole('status')).toHaveTextContent('Scheduled maintenance tonight.');
  });

  it('is an alert when critical', () => {
    render(<Banner severity="critical">Road closures downtown.</Banner>);
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it.each([
    ['info', 'Notice'],
    ['success', 'Update'],
    ['critical', 'Breaking'],
  ] as const)('labels %s banners "%s" so severity is never color alone', (severity, label) => {
    render(<Banner severity={severity}>Message</Banner>);
    expect(screen.getByText(label)).toBeInTheDocument();
  });

  it('accepts a custom label, or none', () => {
    const { rerender } = render(<Banner label="Correction">Fixed a figure.</Banner>);
    expect(screen.getByText('Correction')).toBeInTheDocument();
    rerender(<Banner label="">Fixed a figure.</Banner>);
    expect(screen.queryByText('Correction')).not.toBeInTheDocument();
    expect(screen.queryByText('Notice')).not.toBeInTheDocument();
  });

  it('renders an action', () => {
    render(<Banner action={<a href="/live">Follow live updates</a>}>Developing story.</Banner>);
    expect(screen.getByRole('link', { name: 'Follow live updates' })).toBeInTheDocument();
  });

  it('has no dismiss button unless onDismiss is given', () => {
    render(<Banner>Message</Banner>);
    expect(screen.queryByRole('button', { name: 'Dismiss' })).not.toBeInTheDocument();
  });

  it('dismisses and notifies', async () => {
    const onDismiss = vi.fn();
    render(<Banner onDismiss={onDismiss}>Message</Banner>);
    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('can be dismissed from the keyboard', async () => {
    const onDismiss = vi.fn();
    render(<Banner onDismiss={onDismiss}>Message</Banner>);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(onDismiss).toHaveBeenCalled();
  });

  it('has no axe violations in any severity', async () => {
    const { container } = render(
      <>
        <Banner onDismiss={() => {}}>Info</Banner>
        <Banner severity="success" action={<a href="/x">More</a>}>Done</Banner>
        <Banner severity="critical" onDismiss={() => {}}>Alert</Banner>
      </>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
