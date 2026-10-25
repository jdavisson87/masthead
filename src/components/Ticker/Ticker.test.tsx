import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { computeTickerLayout, Ticker, type TickerItem, type TickerProps } from './Ticker';

const strings = ['Yankees 5, Red Sox 3', 'Dodgers 2, Giants 2', 'Cubs 0, Cardinals 4'];
const track = (container: HTMLElement) => container.querySelector('[data-ticker-track]') as HTMLElement;

function setup(props: Partial<TickerProps> = {}) {
  return render(<Ticker label="MLB scores" items={strings} {...props} />);
}

describe('Ticker', () => {
  it('is a labelled region', () => {
    setup();
    expect(screen.getByRole('region', { name: 'MLB scores' })).toBeInTheDocument();
  });

  it('exposes one plain list to assistive tech, not the looping copies', () => {
    const { container } = setup();
    expect(screen.getAllByRole('listitem')).toHaveLength(strings.length);
    // Two halves are rendered so the loop is seamless; the second is hidden from assistive tech.
    expect(container.querySelectorAll('li')).toHaveLength(strings.length * 2);
    expect(container.querySelectorAll('[aria-hidden="true"] li').length).toBeGreaterThanOrEqual(strings.length);
  });

  it('shows a heading tag when given', () => {
    setup({ heading: 'MLB' });
    expect(screen.getByText('MLB')).toBeInTheDocument();
  });

  it('renders nothing for an empty list', () => {
    const { container } = setup({ items: [] });
    expect(container).toBeEmptyDOMElement();
  });

  describe('links', () => {
    const items: TickerItem[] = [
      { id: 1, content: 'React Aria', href: 'https://example.com/aria', target: '_blank' },
      { id: 2, content: 'Plain text' },
    ];

    it('exposes a single tabbable link; the looping copy is hidden and not tabbable', () => {
      const { container } = setup({ items });
      expect(screen.getAllByRole('link')).toHaveLength(1);
      const links = container.querySelectorAll('a');
      expect(links).toHaveLength(2);
      expect(links[1]).toHaveAttribute('tabindex', '-1');
    });

    it('opens safely in a new tab and says so', () => {
      setup({ items });
      const link = screen.getByRole('link', { name: 'React Aria, opens in a new tab' });
      expect(link).toHaveAttribute('target', '_blank');
      expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });
  });

  describe('tones', () => {
    it('adds an arrow and hidden text, not just color', () => {
      const items: TickerItem[] = [
        { id: 'a', content: 'AAPL 227.50', tone: 'up' },
        { id: 'b', content: 'TSLA 249.90', tone: 'down' },
      ];
      setup({ items });
      const [first, second] = screen.getAllByRole('listitem');
      expect(first).toHaveTextContent('AAPL 227.50, up');
      expect(second).toHaveTextContent('TSLA 249.90, down');
      const mark = screen.getAllByText('▲')[0];
      expect(mark).toHaveAttribute('aria-hidden', 'true');
    });
  });

  describe('pausing', () => {
    it('runs by default', () => {
      const { container } = setup();
      expect(track(container).style.animationPlayState).toBe('running');
    });

    it('pauses and resumes with the button, whose name follows the state', async () => {
      const { container } = setup();
      await userEvent.click(screen.getByRole('button', { name: 'Pause ticker' }));
      expect(track(container).style.animationPlayState).toBe('paused');
      await userEvent.click(screen.getByRole('button', { name: 'Play ticker' }));
      expect(track(container).style.animationPlayState).toBe('running');
    });

    it('pauses while hovered', async () => {
      const { container } = setup();
      await userEvent.hover(track(container));
      expect(track(container).style.animationPlayState).toBe('paused');
      await userEvent.unhover(track(container));
      expect(track(container).style.animationPlayState).toBe('running');
    });

    it('can ignore hover', async () => {
      const { container } = setup({ pauseOnHover: false });
      await userEvent.hover(track(container));
      expect(track(container).style.animationPlayState).toBe('running');
    });

    it('pauses while a link has keyboard focus', async () => {
      const { container } = setup({ items: [{ id: 1, content: 'Story', href: '#story' }] });
      await userEvent.tab();
      expect(screen.getByRole('link', { name: 'Story' })).toHaveFocus();
      expect(track(container).style.animationPlayState).toBe('paused');
    });
  });

  it('can hide the controls', () => {
    setup({ showControls: false });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('reverses for right-to-left movement', () => {
    const { container } = setup({ direction: 'right' });
    expect(track(container).style.animationDirection).toBe('reverse');
  });

  it('does not animate and hides the button with reduced motion', () => {
    const { container } = setup();
    expect(track(container)).toHaveClass('motion-reduce:animate-none');
    expect(screen.getByRole('button', { name: 'Pause ticker' }).parentElement).toHaveClass('motion-reduce:hidden');
  });

  it.each<[string, Partial<TickerProps>]>([
    ['default', {}],
    ['with a heading', { heading: 'MLB' }],
    ['no controls', { showControls: false }],
    ['with links and tones', { items: [{ id: 1, content: 'AAPL 227.50', tone: 'up', href: '#aapl' }, { id: 2, content: 'TSLA', tone: 'down' }] }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = setup(props);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

describe('computeTickerLayout', () => {
  it('repeats content until it fills the viewport', () => {
    expect(computeTickerLayout(1000, 400, 100)).toEqual({ repeat: 3, duration: 12 });
  });

  it('needs only one copy when the content is wider than the viewport', () => {
    expect(computeTickerLayout(600, 1500, 100)).toEqual({ repeat: 1, duration: 15 });
  });

  it('keeps the same speed however much it repeats', () => {
    const a = computeTickerLayout(1000, 400, 50);
    const b = computeTickerLayout(1000, 1200, 50);
    expect((a.repeat * 400) / a.duration).toBeCloseTo(50);
    expect((b.repeat * 1200) / b.duration).toBeCloseTo(50);
  });

  it('falls back to a default when nothing can be measured', () => {
    expect(computeTickerLayout(1000, 0, 60)).toEqual({ repeat: 1, duration: 30 });
    expect(computeTickerLayout(1000, 400, 0)).toEqual({ repeat: 1, duration: 30 });
  });
});
