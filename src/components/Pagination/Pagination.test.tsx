import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Pagination, getPaginationRange, type PaginationProps } from './Pagination';

function setup(props: Partial<PaginationProps> = {}) {
  const onPageChange = vi.fn();
  render(<Pagination count={10} page={5} onPageChange={onPageChange} {...props} />);
  return { onPageChange };
}

describe('getPaginationRange', () => {
  it('shows every page when they all fit', () => {
    expect(getPaginationRange(3, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(getPaginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it('truncates the end near the start', () => {
    expect(getPaginationRange(1, 10)).toEqual([1, 2, 3, 4, 5, 'end-ellipsis', 10]);
  });

  it('truncates both sides in the middle', () => {
    expect(getPaginationRange(50, 100)).toEqual([1, 'start-ellipsis', 49, 50, 51, 'end-ellipsis', 100]);
  });

  it('truncates the start near the end', () => {
    expect(getPaginationRange(10, 10)).toEqual([1, 'start-ellipsis', 6, 7, 8, 9, 10]);
  });

  it('keeps a constant length across every page', () => {
    for (const count of [8, 10, 20, 100]) {
      const lengths = new Set(Array.from({ length: count }, (_, i) => getPaginationRange(i + 1, count).length));
      expect(lengths.size).toBe(1);
    }
  });

  it('honours siblings and boundaries', () => {
    expect(getPaginationRange(10, 20, 2, 1)).toEqual([1, 'start-ellipsis', 8, 9, 10, 11, 12, 'end-ellipsis', 20]);
    expect(getPaginationRange(10, 20, 1, 2)).toEqual([1, 2, 'start-ellipsis', 9, 10, 11, 'end-ellipsis', 19, 20]);
  });

  it('handles empty and single-page counts', () => {
    expect(getPaginationRange(1, 0)).toEqual([]);
    expect(getPaginationRange(1, 1)).toEqual([1]);
  });
});

describe('Pagination', () => {
  it('is a labelled navigation containing a list', () => {
    setup({ 'aria-label': 'Results pages' });
    const nav = screen.getByRole('navigation', { name: 'Results pages' });
    expect(within(nav).getByRole('list')).toBeInTheDocument();
  });

  it('has a default navigation label', () => {
    setup();
    expect(screen.getByRole('navigation', { name: 'Pagination' })).toBeInTheDocument();
  });

  it('marks only the current page with aria-current="page"', () => {
    setup({ page: 5 });
    const current = screen.getAllByRole('button').filter((b) => b.getAttribute('aria-current') === 'page');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveAccessibleName('Page 5');
  });

  it('calls onPageChange when a page is pressed', async () => {
    const { onPageChange } = setup({ page: 5 });
    await userEvent.click(screen.getByRole('button', { name: 'Page 6' }));
    expect(onPageChange).toHaveBeenCalledWith(6);
  });

  it('goes to the previous and next pages', async () => {
    const { onPageChange } = setup({ page: 5 });
    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }));
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(onPageChange).toHaveBeenNthCalledWith(1, 4);
    expect(onPageChange).toHaveBeenNthCalledWith(2, 6);
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination count={10} page={1} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Next page' })).toBeEnabled();
    rerender(<Pagination count={10} page={10} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('exposes ellipses to screen readers as "More pages"', () => {
    setup({ page: 5 });
    expect(screen.getAllByText('More pages')).toHaveLength(2);
  });

  it('disables every control when isDisabled', () => {
    setup({ isDisabled: true });
    screen.getAllByRole('button').forEach((b) => expect(b).toBeDisabled());
  });

  it('supports keyboard use', async () => {
    const { onPageChange } = setup({ page: 5 });
    await userEvent.tab();
    expect(screen.getByRole('button', { name: 'Previous page' })).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(onPageChange).toHaveBeenCalledWith(4);
  });

  it('shows a summary when asked', () => {
    setup({ showSummary: true, page: 3, count: 12 });
    expect(screen.getByText('Page 3 of 12')).toBeInTheDocument();
  });

  it('renders links when getHref is provided', () => {
    setup({ getHref: (p) => `/results?page=${p}`, page: 5 });
    expect(screen.getByRole('link', { name: 'Page 6' })).toHaveAttribute('href', '/results?page=6');
    expect(screen.getByRole('link', { name: 'Page 5' })).toHaveAttribute('aria-current', 'page');
  });

  it('renders nothing when there are no pages', () => {
    setup({ count: 0 });
    expect(screen.queryByRole('navigation')).not.toBeInTheDocument();
  });

  it('works when controlled', async () => {
    function Controlled() {
      const [page, setPage] = useState(1);
      return <Pagination count={10} page={page} onPageChange={setPage} />;
    }
    render(<Controlled />);
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }));
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('has no axe violations', async () => {
    const { container } = render(<Pagination count={10} page={5} onPageChange={() => {}} showSummary />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations as links or when disabled', async () => {
    const { container } = render(
      <>
        <Pagination count={10} page={1} onPageChange={() => {}} getHref={(p) => `?page=${p}`} aria-label="Linked" />
        <Pagination count={10} page={1} onPageChange={() => {}} isDisabled aria-label="Disabled" />
      </>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
