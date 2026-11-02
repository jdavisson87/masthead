import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Sparkline, describeSeries, getSparklinePoints, summarizeSeries } from './Sparkline';

const data = [10, 12, 9, 14, 20];

describe('summarizeSeries', () => {
  it('summarizes an upward series', () => {
    expect(summarizeSeries(data)).toMatchObject({ count: 5, first: 10, last: 20, min: 9, max: 20, change: 10, changePercent: 100, direction: 'up' });
  });
  it('detects down and flat', () => {
    expect(summarizeSeries([5, 4, 3])?.direction).toBe('down');
    expect(summarizeSeries([5, 9, 5])?.direction).toBe('flat');
  });
  it('has no percent change from a zero start', () => {
    expect(summarizeSeries([0, 5])?.changePercent).toBeNull();
  });
  it('ignores non-finite values and returns null when empty', () => {
    expect(summarizeSeries([1, NaN, 3])?.count).toBe(2);
    expect(summarizeSeries([])).toBeNull();
  });
});

describe('getSparklinePoints', () => {
  it('puts the high at the top padding and the low at the bottom padding', () => {
    const pts = getSparklinePoints([0, 10], 100, 40, 3);
    expect(pts[0]).toEqual({ x: 3, y: 37 });
    expect(pts[1]).toEqual({ x: 97, y: 3 });
  });
  it('draws a flat series in the middle', () => {
    expect(getSparklinePoints([5, 5, 5], 100, 40).every((p) => p.y === 20)).toBe(true);
  });
  it('centers a single point', () => {
    expect(getSparklinePoints([7], 100, 40)).toEqual([{ x: 50, y: 20 }]);
  });
});

describe('describeSeries', () => {
  it('speaks start, end, change, low and high', () => {
    const text = describeSeries('Visitors', summarizeSeries(data)!, String);
    expect(text).toBe('Visitors: 5 values. Started at 10, ended at 20, up 100%. Low 9, high 20.');
  });
  it('uses an absolute change when the start is zero', () => {
    expect(describeSeries('Sales', summarizeSeries([0, 5])!, String)).toContain('up 5.');
  });
  it('handles a single value', () => {
    expect(describeSeries('Sales', summarizeSeries([4])!, String)).toBe('Sales: 4.');
  });
});

describe('Sparkline', () => {
  it('is one image named by its spoken summary', () => {
    render(<Sparkline data={data} label="Daily visitors" />);
    expect(screen.getByRole('img', { name: /^Daily visitors: 5 values\. Started at 10, ended at 20, up 100%/ })).toBeInTheDocument();
  });

  it('draws a line with an endpoint dot', () => {
    const { container } = render(<Sparkline data={data} label="Visitors" />);
    expect(container.querySelectorAll('path')).toHaveLength(1);
    expect(container.querySelectorAll('circle')).toHaveLength(1);
  });

  it('can hide the endpoint', () => {
    const { container } = render(<Sparkline data={data} label="Visitors" showEndpoint={false} />);
    expect(container.querySelector('circle')).toBeNull();
  });

  it('adds a filled area', () => {
    const { container } = render(<Sparkline data={data} label="Visitors" variant="area" />);
    expect(container.querySelectorAll('path')).toHaveLength(2);
  });

  it('draws one bar per value', () => {
    const { container } = render(<Sparkline data={data} label="Visitors" variant="bars" />);
    expect(container.querySelectorAll('rect')).toHaveLength(5);
  });

  it('draws a dot for a single value', () => {
    const { container } = render(<Sparkline data={[3]} label="Visitors" />);
    expect(container.querySelectorAll('circle')).toHaveLength(1);
    expect(container.querySelector('path')).toBeNull();
  });

  it('uses a custom formatter in the summary', () => {
    render(<Sparkline data={[1, 2]} label="Revenue" formatValue={(n) => `$${n}`} />);
    expect(screen.getByRole('img')).toHaveAccessibleName(/Started at \$1, ended at \$2/);
  });

  it('renders nothing without data', () => {
    const { container } = render(<Sparkline data={[]} label="Visitors" />);
    expect(container).toBeEmptyDOMElement();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <>
        <Sparkline data={data} label="Line" />
        <Sparkline data={data} label="Area" variant="area" tone="success" />
        <Sparkline data={data} label="Bars" variant="bars" tone="muted" />
      </>,
    );
    expect((await axe(container)).violations).toEqual([]);
  });
});
