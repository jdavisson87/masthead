import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Toaster, toast, toastQueue } from './Toast';

afterEach(() => {
  act(() => toastQueue.clear());
});

describe('Toast', () => {
  it('renders a region labelled with the notification count', () => {
    render(<Toaster />);
    // The region only mounts once there is something to show. Its label is a live count.
    act(() => {
      toast.show('Hello');
    });
    expect(screen.getByRole('region', { name: /1 notification/i })).toBeInTheDocument();
    act(() => {
      toast.show('World');
    });
    expect(screen.getByRole('region', { name: /2 notifications/i })).toBeInTheDocument();
  });

  it('shows a title and description', async () => {
    render(<Toaster />);
    act(() => {
      toast.success('Changes saved', { description: 'Your project is up to date.' });
    });
    expect(await screen.findByText('Changes saved')).toBeInTheDocument();
    expect(screen.getByText('Your project is up to date.')).toBeInTheDocument();
  });

  it('shows more than one toast at a time', async () => {
    render(<Toaster />);
    act(() => {
      toast.show('First');
      toast.error('Second');
    });
    expect(await screen.findByText('First')).toBeInTheDocument();
    expect(screen.getByText('Second')).toBeInTheDocument();
  });

  it('dismisses itself after its timeout', async () => {
    render(<Toaster />);
    act(() => {
      toast.show('Gone soon', { timeout: 50 });
    });
    expect(await screen.findByText('Gone soon')).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByText('Gone soon')).not.toBeInTheDocument());
  });

  it('stays until dismissed when the timeout is 0', async () => {
    render(<Toaster />);
    act(() => {
      toast.show('Sticky', { timeout: 0 });
    });
    expect(await screen.findByText('Sticky')).toBeInTheDocument();
    await new Promise((resolve) => setTimeout(resolve, 150));
    expect(screen.getByText('Sticky')).toBeInTheDocument();
  });

  it('closes from the dismiss button and calls onClose', async () => {
    const onClose = vi.fn();
    render(<Toaster />);
    act(() => {
      toast.show('Dismiss me', { timeout: 0, onClose });
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Dismiss notification' }));
    await waitFor(() => expect(screen.queryByText('Dismiss me')).not.toBeInTheDocument());
    expect(onClose).toHaveBeenCalled();
  });

  it('runs an action and dismisses the toast', async () => {
    const onPress = vi.fn();
    render(<Toaster />);
    act(() => {
      toast.show('Item deleted', { timeout: 0, action: { label: 'Undo', onPress } });
    });
    await userEvent.click(await screen.findByRole('button', { name: 'Undo' }));
    expect(onPress).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByText('Item deleted')).not.toBeInTheDocument());
  });

  it('clears every toast with toast.clear()', async () => {
    render(<Toaster />);
    act(() => {
      toast.show('One', { timeout: 0 });
      toast.show('Two', { timeout: 0 });
    });
    await screen.findByText('One');
    act(() => toast.clear());
    await waitFor(() => expect(screen.queryByText('One')).not.toBeInTheDocument());
    expect(screen.queryByText('Two')).not.toBeInTheDocument();
  });

  it.each(['show', 'info', 'success', 'error'] as const)('has no axe violations (%s)', async (tone) => {
    render(<Toaster />);
    act(() => {
      toast[tone]('Something happened', { description: 'More detail here.', timeout: 0 });
    });
    await screen.findByText('Something happened');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
