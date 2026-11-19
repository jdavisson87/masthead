import type { Meta, StoryObj } from '@storybook/react-vite';
import { Accordion, AccordionItem, type AccordionProps } from './Accordion';

const faq = [
  {
    id: 'sources',
    title: 'Where does the data come from?',
    body: (
      <>
        <p>Figures are drawn from public filings and the agencies that publish them, updated each weekday morning.</p>
        <p>Every chart links to its source table, so you can check a number against the original.</p>
      </>
    ),
  },
  {
    id: 'corrections',
    title: 'How are corrections handled?',
    body: <p>Corrections are made in place and noted at the foot of the story with the date and what changed.</p>,
  },
  {
    id: 'methodology',
    title: 'Why do some totals not add up?',
    body: <p>Values are rounded for display. Totals are computed from the unrounded figures, so they can differ by one.</p>,
  },
  {
    id: 'archive',
    title: 'Can I download the archive?',
    body: <p>Bulk downloads are available to subscribers as CSV and Parquet.</p>,
  },
];

/** Story wrapper so the Controls panel can edit the group's props. */
function DemoAccordion(props: Omit<AccordionProps, 'children'>) {
  return (
    <Accordion {...props}>
      {faq.map((item) => (
        <AccordionItem key={item.id} id={item.id} title={item.title}>
          {item.body}
        </AccordionItem>
      ))}
    </Accordion>
  );
}

const meta = {
  title: 'Components/Accordion',
  component: DemoAccordion,
  tags: ['autodocs'],
  args: { className: 'w-[36rem] max-w-full' },
  argTypes: {
    variant: { control: 'inline-radio', options: ['divided', 'boxed'] },
    headingLevel: { control: 'inline-radio', options: [2, 3, 4, 5, 6] },
    allowsMultipleExpanded: { control: 'boolean' },
    isDisabled: { control: 'boolean' },
  },
} satisfies Meta<typeof DemoAccordion>;

export default meta;
type Story = StoryObj<typeof meta>;

/** One section open at a time. Closed sections are still found by the browser's find-in-page. */
export const Default: Story = {};
export const OpenByDefault: Story = { args: { defaultExpandedKeys: ['sources'] } };
export const MultipleOpen: Story = { args: { allowsMultipleExpanded: true, defaultExpandedKeys: ['sources', 'methodology'] } };
/** A bordered box with padded sections, for cards and sidebars. */
export const Boxed: Story = { args: { variant: 'boxed', className: 'w-[28rem] max-w-full' } };

export const DisabledItem: Story = {
  render: (args) => (
    <Accordion {...args}>
      <AccordionItem id="free" title="Included in every plan">
        <p>Dashboards, alerts, and CSV export.</p>
      </AccordionItem>
      <AccordionItem id="team" title="Team plan only (upgrade to view)" isDisabled>
        <p>Shared workspaces and audit logs.</p>
      </AccordionItem>
    </Accordion>
  ),
};

/** On its own, an AccordionItem is a single disclosure, such as a "Show details" toggle. */
export const SingleDisclosure: Story = {
  render: () => (
    <div className="w-[36rem] max-w-full border-t border-border">
      <AccordionItem title="Show methodology" headingLevel={4}>
        <p>Averages are weighted by population. Counties with fewer than 1,000 residents are grouped by state.</p>
      </AccordionItem>
    </div>
  ),
};
