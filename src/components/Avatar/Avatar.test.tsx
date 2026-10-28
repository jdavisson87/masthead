import { describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Avatar, AvatarGroup, getInitials } from './Avatar';

const img = (c: HTMLElement) => c.querySelector('img') as HTMLImageElement | null;

describe('getInitials', () => {
  it('uses the first letter of the first and last words', () => {
    expect(getInitials('Jane Q. Doe')).toBe('JD');
    expect(getInitials('jane doe')).toBe('JD');
  });
  it('uses one letter for a single name', () => {
    expect(getInitials('Cher')).toBe('C');
  });
  it('trims and handles empty input', () => {
    expect(getInitials('  Ada   Lovelace ')).toBe('AL');
    expect(getInitials('   ')).toBe('?');
  });
});

describe('Avatar', () => {
  it('is a single image named after the person', () => {
    render(<Avatar name="Jane Doe" />);
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toBeInTheDocument();
  });

  it('shows initials when there is no photo', () => {
    render(<Avatar name="Jane Doe" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('keeps initials visible until the photo loads, then swaps', () => {
    const { container } = render(<Avatar name="Jane Doe" src="/jane.jpg" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
    expect(img(container)).toHaveClass('invisible');
    fireEvent.load(img(container) as HTMLImageElement);
    expect(screen.queryByText('JD')).not.toBeInTheDocument();
    expect(img(container)).not.toHaveClass('invisible');
  });

  it('falls back to initials when the photo fails', () => {
    const { container } = render(<Avatar name="Jane Doe" src="/missing.jpg" />);
    fireEvent.error(img(container) as HTMLImageElement);
    expect(img(container)).toBeNull();
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('restarts loading when src changes', () => {
    const { container, rerender } = render(<Avatar name="Jane Doe" src="/a.jpg" />);
    fireEvent.load(img(container) as HTMLImageElement);
    rerender(<Avatar name="Jane Doe" src="/b.jpg" />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('hides the photo itself from assistive tech so the name is announced once', () => {
    const { container } = render(<Avatar name="Jane Doe" src="/jane.jpg" />);
    expect(img(container)).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getAllByRole('img')).toHaveLength(1);
  });

  it('can be decorative', () => {
    const { container } = render(<Avatar name="Jane Doe" decorative />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('applies shape', () => {
    render(<Avatar name="Jane Doe" shape="square" />);
    expect(screen.getByRole('img', { name: 'Jane Doe' })).toHaveClass('rounded-sm');
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Avatar name="Jane Doe" />
        <Avatar name="Sam Lee" src="/sam.jpg" shape="square" />
        <Avatar name="Decorative" decorative />
      </>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});

describe('AvatarGroup', () => {
  const people = ['Ada Lovelace', 'Grace Hopper', 'Alan Turing', 'Katherine Johnson', 'Linus Torvalds'].map((name) => ({ name }));

  it('is a labelled list with one item per person', () => {
    render(<AvatarGroup people={people.slice(0, 3)} aria-label="Authors" />);
    expect(screen.getByRole('list', { name: 'Authors' })).toBeInTheDocument();
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getByRole('img', { name: 'Alan Turing' })).toBeInTheDocument();
  });

  it('collapses extras into a count, never exceeding max slots', () => {
    render(<AvatarGroup people={people} max={3} />);
    expect(screen.getAllByRole('listitem')).toHaveLength(3);
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByText('+3')).toBeInTheDocument();
    expect(screen.getByText('and 3 more')).toBeInTheDocument();
  });

  it('shows everyone when they fit', () => {
    render(<AvatarGroup people={people} max={5} />);
    expect(screen.getAllByRole('img')).toHaveLength(5);
    expect(screen.queryByText(/and \d+ more/)).not.toBeInTheDocument();
  });

  it('renders nothing for an empty list', () => {
    render(<AvatarGroup people={[]} />);
    expect(screen.queryByRole('list')).not.toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(<AvatarGroup people={people} max={3} aria-label="Reviewers" />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
