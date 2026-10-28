import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { DropCap } from './DropCap';

const text = 'The vote followed three hours of public comment.';

describe('DropCap', () => {
  it('keeps the paragraph as one unbroken string', () => {
    render(<DropCap>{text}</DropCap>);
    const p = screen.getByText(text);
    expect(p.tagName).toBe('P');
    expect(p.childNodes).toHaveLength(1);
  });

  it('styles the first letter through ::first-letter classes', () => {
    render(<DropCap>{text}</DropCap>);
    expect(screen.getByText(text).className).toContain('first-letter:float-left');
  });

  it.each([2, 3, 4] as const)('supports a %s-line initial', (lines) => {
    render(<DropCap lines={lines}>{text}</DropCap>);
    expect(screen.getByText(text).className).toMatch(/first-letter:text-\[/);
  });

  it('can render as a div', () => {
    render(<DropCap as="div">{text}</DropCap>);
    expect(screen.getByText(text).tagName).toBe('DIV');
  });

  it('has no axe violations', async () => {
    const { container } = render(<DropCap>{text}</DropCap>);
    expect((await axe(container)).violations).toEqual([]);
  });
});
