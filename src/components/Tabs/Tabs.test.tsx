import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Tab, TabList, TabPanel, Tabs, type TabsProps } from './Tabs';

function Example(props: Partial<TabsProps>) {
  return (
    <Tabs {...props}>
      <TabList aria-label="Project">
        <Tab id="overview">Overview</Tab>
        <Tab id="activity">Activity</Tab>
        <Tab id="billing">Billing</Tab>
      </TabList>
      <TabPanel id="overview">Overview content</TabPanel>
      <TabPanel id="activity">Activity content</TabPanel>
      <TabPanel id="billing">Billing content</TabPanel>
    </Tabs>
  );
}

const tab = (name: string) => screen.getByRole('tab', { name });

describe('Tabs', () => {
  it('renders a named tablist with the first tab selected', () => {
    render(<Example />);
    expect(screen.getByRole('tablist', { name: 'Project' })).toBeInTheDocument();
    expect(screen.getAllByRole('tab')).toHaveLength(3);
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Overview content');
  });

  it('labels the panel with its tab', () => {
    render(<Example />);
    expect(screen.getByRole('tabpanel', { name: 'Overview' })).toBeInTheDocument();
  });

  it('switches panels when a tab is clicked and reports the key', async () => {
    const onSelectionChange = vi.fn();
    render(<Example onSelectionChange={onSelectionChange} />);
    await userEvent.click(tab('Activity'));
    expect(onSelectionChange).toHaveBeenLastCalledWith('activity');
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'true');
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'false');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Activity content');
  });

  it('respects defaultSelectedKey', () => {
    render(<Example defaultSelectedKey="billing" />);
    expect(tab('Billing')).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Billing content');
  });

  it('moves focus and selection with the arrow keys, Home, and End', async () => {
    render(<Example />);
    await userEvent.tab();
    expect(tab('Overview')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Activity')).toHaveFocus();
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{End}');
    expect(tab('Billing')).toHaveFocus();
    await userEvent.keyboard('{Home}');
    expect(tab('Overview')).toHaveFocus();
  });

  it('wraps from the last tab to the first', async () => {
    render(<Example defaultSelectedKey="billing" />);
    await userEvent.tab();
    expect(tab('Billing')).toHaveFocus();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Overview')).toHaveFocus();
  });

  it('only selects on Enter or Space with manual activation', async () => {
    render(<Example keyboardActivation="manual" />);
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Activity')).toHaveFocus();
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'false');
    expect(tab('Overview')).toHaveAttribute('aria-selected', 'true');
    await userEvent.keyboard('{Enter}');
    expect(tab('Activity')).toHaveAttribute('aria-selected', 'true');
  });

  it('skips disabled tabs', async () => {
    render(<Example disabledKeys={['activity']} />);
    expect(tab('Activity')).toHaveAttribute('aria-disabled', 'true');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowRight}');
    expect(tab('Billing')).toHaveFocus();
  });

  it('supports vertical orientation with the up and down arrows', async () => {
    render(<Example orientation="vertical" />);
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical');
    await userEvent.tab();
    await userEvent.keyboard('{ArrowDown}');
    expect(tab('Activity')).toHaveFocus();
  });

  it.each([
    ['horizontal', {}],
    ['vertical', { orientation: 'vertical' as const }],
    ['disabled tab', { disabledKeys: ['activity'] }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<Example {...props} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
