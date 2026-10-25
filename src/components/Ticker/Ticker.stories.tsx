import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Ticker, type TickerItem } from './Ticker';

const meta = {
  title: 'Components/Ticker',
  component: Ticker,
  tags: ['autodocs'],
  parameters: { layout: 'fullscreen' },
  args: { label: 'Latest headlines', items: [] },
  argTypes: {
    speed: { control: { type: 'range', min: 20, max: 200, step: 10 } },
    direction: { control: 'inline-radio', options: ['left', 'right'] },
    pauseOnHover: { control: 'boolean' },
    showControls: { control: 'boolean' },
    fade: { control: 'boolean' },
    items: { control: false },
  },
} satisfies Meta<typeof Ticker>;

export default meta;
type Story = StoryObj<typeof meta>;

const headlines = [
  'Design system reaches 1.0 with 24 accessible components',
  'Dark mode gets a lighter surface scale for clearer layers',
  'New increased-contrast theme meets WCAG AAA text contrast',
  'Menu, Tag and Table now ship with full keyboard support',
];

export const Default: Story = { args: { items: headlines } };

export const WithHeading: Story = { args: { heading: 'Newsroom', items: headlines } };

export const Slow: Story = { args: { heading: 'Newsroom', items: headlines, speed: 30 } };

export const RightToLeft: Story = { args: { items: headlines, direction: 'right' } };

export const WithLinks: Story = {
  args: {
    heading: 'Reading list',
    label: 'Reading list',
    items: [
      { id: 1, content: 'React Aria documentation', href: 'https://react-spectrum.adobe.com/react-aria/', target: '_blank' },
      { id: 2, content: 'WCAG 2.2 quick reference', href: 'https://www.w3.org/WAI/WCAG22/quickref/', target: '_blank' },
      { id: 3, content: 'Tailwind CSS v4', href: 'https://tailwindcss.com/', target: '_blank' },
    ],
  },
};

const quotes = [
  ['AAPL', '227.50', '+1.2%', 'up'],
  ['MSFT', '421.10', '-0.4%', 'down'],
  ['NVDA', '138.75', '+2.8%', 'up'],
  ['AMZN', '186.20', '+0.3%', 'up'],
  ['TSLA', '249.90', '-1.6%', 'down'],
  ['GOOGL', '168.45', '-0.1%', 'down'],
] as const;

/** Up and down are shown with an arrow and hidden text as well as color. */
export const StockQuotes: Story = {
  args: {
    heading: 'Markets',
    label: 'Stock quotes',
    items: quotes.map(([symbol, price, change, tone]) => ({
      id: symbol,
      tone,
      content: (
        <>
          <span className="font-medium">{symbol}</span>{' '}
          <span className="tabular-nums">{price}</span>{' '}
          <span className="tabular-nums">{change}</span>
        </>
      ),
    })),
  },
};

/** Items can be replaced at any time; here prices change every few seconds. */
export const LiveUpdates: Story = {
  render: (args) => {
    const [prices, setPrices] = useState(() => quotes.map(([symbol, price]) => ({ symbol, price: Number(price), change: 0 })));
    useEffect(() => {
      const id = setInterval(() => {
        setPrices((list) =>
          list.map((q) => {
            const delta = (Math.random() - 0.5) * 2;
            return { ...q, price: q.price + delta, change: (delta / q.price) * 100 };
          }),
        );
      }, 3000);
      return () => clearInterval(id);
    }, []);
    const items: TickerItem[] = prices.map((q) => ({
      id: q.symbol,
      tone: q.change === 0 ? undefined : q.change > 0 ? 'up' : 'down',
      content: `${q.symbol} ${q.price.toFixed(2)}${q.change === 0 ? '' : ` ${q.change > 0 ? '+' : ''}${q.change.toFixed(2)}%`}`,
    }));
    return <Ticker {...args} heading="Markets" label="Live stock quotes" items={items} />;
  },
};

type MlbGame = {
  gamePk: number;
  status: { detailedState: string };
  teams: { away: { team: { name: string }; score?: number }; home: { team: { name: string }; score?: number } };
};

const sampleScores: string[] = [
  'Yankees 5, Red Sox 3 · Final',
  'Dodgers 2, Giants 2 · Top 7th',
  'Cubs 0, Cardinals 4 · Final',
  'Mets 6, Braves 1 · Bottom 8th',
];

/**
 * Real data: MLB's public Stats API. If the request fails (offline, blocked), sample scores are shown instead.
 * Any API works the same way: fetch, map the response to strings, pass them as `items`.
 */
export const LiveMlbScores: Story = {
  render: (args) => {
    const [scores, setScores] = useState<string[]>(sampleScores);
    const [source, setSource] = useState('sample data');

    useEffect(() => {
      const controller = new AbortController();
      const today = new Date().toISOString().slice(0, 10);
      fetch(`https://statsapi.mlb.com/api/v1/schedule?sportId=1&date=${today}`, { signal: controller.signal })
        .then((res) => (res.ok ? res.json() : Promise.reject(new Error(String(res.status)))))
        .then((data: { dates?: { games: MlbGame[] }[] }) => {
          const games = data.dates?.[0]?.games ?? [];
          if (games.length === 0) return;
          setScores(
            games.map((g) => {
              const { away, home } = g.teams;
              const score = away.score !== undefined ? `${away.team.name} ${away.score}, ${home.team.name} ${home.score ?? 0}` : `${away.team.name} at ${home.team.name}`;
              return `${score} · ${g.status.detailedState}`;
            }),
          );
          setSource('MLB Stats API');
        })
        .catch(() => undefined);
      return () => controller.abort();
    }, []);

    return (
      <div className="flex flex-col gap-3">
        <Ticker {...args} heading="MLB" label="MLB scores" items={scores} />
        <p className="px-4 font-mono text-xs uppercase tracking-wider text-muted">Source: {source}</p>
      </div>
    );
  },
};
