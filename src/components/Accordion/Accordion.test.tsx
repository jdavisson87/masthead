import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Accordion, AccordionItem, type AccordionProps } from './Accordion';

function Example(props: Partial<AccordionProps>) {
  return (
    <Accordion {...props}>
      <AccordionItem id="shipping" title="Shipping">
        Orders ship within two business days.
      </AccordionItem>
      <AccordionItem id="returns" title="Returns">
        Return anything within 30 days.
      </AccordionItem>
      <AccordionItem id="warranty" title="Warranty" isDisabled>
        Two years, parts and labor.
      </AccordionItem>
    </Accordion>
  );
}

const trigger = (name: string) => screen.getByRole('button', { name });
const panelFor = (name: string) => document.getElementById(trigger(name).getAttribute('aria-controls')!)!;

describe('Accordion', () => {
  it('puts each trigger button inside a heading, collapsed by default', () => {
    render(<Example />);
    const heading = screen.getByRole('heading', { level: 3, name: 'Shipping' });
    expect(heading).toContainElement(trigger('Shipping'));
    expect(trigger('Shipping')).toHaveAttribute('aria-expanded', 'false');
    expect(panelFor('Shipping')).not.toBeVisible();
  });

  it('links each panel to its trigger and names it by the title', () => {
    // A collapsed panel is aria-hidden, which leaves it without a name, so check an open one.
    render(<Example defaultExpandedKeys={['shipping']} />);
    const panel = panelFor('Shipping');
    expect(panel).toHaveAttribute('role', 'group');
    expect(panel).toHaveAccessibleName('Shipping');
    expect(panel).toHaveTextContent('Orders ship within two business days.');
  });

  it('expands and collapses on click', async () => {
    render(<Example />);
    await userEvent.click(trigger('Shipping'));
    expect(trigger('Shipping')).toHaveAttribute('aria-expanded', 'true');
    expect(panelFor('Shipping')).toBeVisible();
    await userEvent.click(trigger('Shipping'));
    expect(trigger('Shipping')).toHaveAttribute('aria-expanded', 'false');
    expect(panelFor('Shipping')).not.toBeVisible();
  });

  it('toggles with Enter and Space', async () => {
    render(<Example />);
    await userEvent.tab();
    expect(trigger('Shipping')).toHaveFocus();
    await userEvent.keyboard('{Enter}');
    expect(trigger('Shipping')).toHaveAttribute('aria-expanded', 'true');
    await userEvent.keyboard(' ');
    expect(trigger('Shipping')).toHaveAttribute('aria-expanded', 'false');
  });

  it('opens one section at a time by default', async () => {
    render(<Example />);
    await userEvent.click(trigger('Shipping'));
    await userEvent.click(trigger('Returns'));
    expect(trigger('Shipping')).toHaveAttribute('aria-expanded', 'false');
    expect(trigger('Returns')).toHaveAttribute('aria-expanded', 'true');
  });

  it('can keep several sections open', async () => {
    render(<Example allowsMultipleExpanded />);
    await userEvent.click(trigger('Shipping'));
    await userEvent.click(trigger('Returns'));
    expect(trigger('Shipping')).toHaveAttribute('aria-expanded', 'true');
    expect(trigger('Returns')).toHaveAttribute('aria-expanded', 'true');
  });

  it('opens the default sections', () => {
    render(<Example defaultExpandedKeys={['returns']} />);
    expect(trigger('Returns')).toHaveAttribute('aria-expanded', 'true');
    expect(panelFor('Returns')).toBeVisible();
  });

  it('can be controlled', async () => {
    const onExpandedChange = vi.fn();
    const { rerender } = render(<Example expandedKeys={[]} onExpandedChange={onExpandedChange} />);
    await userEvent.click(trigger('Returns'));
    expect(onExpandedChange).toHaveBeenCalledWith(new Set(['returns']));
    expect(trigger('Returns')).toHaveAttribute('aria-expanded', 'false');
    rerender(<Example expandedKeys={['returns']} onExpandedChange={onExpandedChange} />);
    expect(trigger('Returns')).toHaveAttribute('aria-expanded', 'true');
  });

  it('skips disabled sections', async () => {
    render(<Example />);
    expect(trigger('Warranty')).toBeDisabled();
    await userEvent.click(trigger('Warranty'));
    expect(trigger('Warranty')).toHaveAttribute('aria-expanded', 'false');
  });

  it('can disable the whole group', () => {
    render(<Example isDisabled />);
    for (const name of ['Shipping', 'Returns', 'Warranty']) expect(trigger(name)).toBeDisabled();
  });

  it('uses the heading level from the group, overridable per item', () => {
    render(
      <Accordion headingLevel={2}>
        <AccordionItem id="a" title="Alpha">
          A
        </AccordionItem>
        <AccordionItem id="b" title="Bravo" headingLevel={4}>
          B
        </AccordionItem>
      </Accordion>,
    );
    expect(screen.getByRole('heading', { level: 2, name: 'Alpha' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 4, name: 'Bravo' })).toBeInTheDocument();
  });

  it('works on its own as a single disclosure', async () => {
    const onExpandedChange = vi.fn();
    render(
      <AccordionItem title="Show details" onExpandedChange={onExpandedChange}>
        Details
      </AccordionItem>,
    );
    await userEvent.click(trigger('Show details'));
    expect(onExpandedChange).toHaveBeenCalledWith(true);
    expect(trigger('Show details')).toHaveAttribute('aria-expanded', 'true');
  });

  it.each([
    ['collapsed', {}],
    ['expanded', { defaultExpandedKeys: ['shipping'] }],
    ['boxed', { variant: 'boxed' as const, defaultExpandedKeys: ['returns'] }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = render(<Example {...props} />);
    expect((await axe(container)).violations).toEqual([]);
  });
});
