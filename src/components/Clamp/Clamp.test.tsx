import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Clamp } from './Clamp';

// jsdom has no layout, so fake how tall the text is versus the clamped box.
function mockLayout(scrollHeight: number, clientHeight: number) {
  Object.defineProperty(HTMLElement.prototype, 'scrollHeight', { configurable: true, get: () => scrollHeight });
  Object.defineProperty(HTMLElement.prototype, 'clientHeight', { configurable: true, get: () => clientHeight });
}

const text = 'A long story. '.repeat(40);

afterEach(() => {
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).scrollHeight;
  delete (HTMLElement.prototype as unknown as Record<string, unknown>).clientHeight;
});

describe('Clamp (text is cut off)', () => {
  beforeEach(() => mockLayout(120, 60));

  it('shows a collapsed toggle with aria-expanded=false', () => {
    render(<Clamp>{text}</Clamp>);
    const button = screen.getByRole('button', { name: 'Read more' });
    expect(button).toHaveAttribute('aria-expanded', 'false');
  });

  it('clamps to the requested number of lines', () => {
    const { container } = render(<Clamp lines={5}>{text}</Clamp>);
    expect((container.firstElementChild?.firstElementChild as HTMLElement).style.webkitLineClamp).toBe('5');
  });

  it('points aria-controls at the text', () => {
    const { container } = render(<Clamp>{text}</Clamp>);
    const content = container.firstElementChild?.firstElementChild as HTMLElement;
    expect(screen.getByRole('button')).toHaveAttribute('aria-controls', content.id);
  });

  it('expands and collapses, keeping the button', async () => {
    const onExpandedChange = vi.fn();
    const { container } = render(<Clamp onExpandedChange={onExpandedChange}>{text}</Clamp>);
    await userEvent.click(screen.getByRole('button', { name: 'Read more' }));
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveAttribute('aria-expanded', 'true');
    expect((container.firstElementChild?.firstElementChild as HTMLElement).style.webkitLineClamp).toBe('');
    await userEvent.click(screen.getByRole('button', { name: 'Show less' }));
    expect(screen.getByRole('button', { name: 'Read more' })).toBeInTheDocument();
    expect(onExpandedChange).toHaveBeenNthCalledWith(1, true);
    expect(onExpandedChange).toHaveBeenNthCalledWith(2, false);
  });

  it('works from the keyboard', async () => {
    render(<Clamp>{text}</Clamp>);
    await userEvent.tab();
    await userEvent.keyboard('{Enter}');
    expect(screen.getByRole('button', { name: 'Show less' })).toHaveFocus();
  });

  it('keeps the full text in the DOM', () => {
    render(<Clamp>{text}</Clamp>);
    expect(screen.getByText(/A long story/)).toHaveTextContent(text.trim());
  });

  it('accepts custom labels and starts expanded on request', () => {
    render(
      <Clamp moreLabel="Continue" lessLabel="Collapse" defaultExpanded>
        {text}
      </Clamp>,
    );
    expect(screen.getByRole('button', { name: 'Collapse' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<Clamp>{text}</Clamp>);
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('Clamp (text fits)', () => {
  it('shows no toggle', () => {
    mockLayout(60, 60);
    render(<Clamp>Short.</Clamp>);
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });
});
