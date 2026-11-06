import type { Meta, StoryObj } from '@storybook/react-vite';
import { FootnoteRef, Footnotes, Sidenote } from './Footnote';

const meta = {
  title: 'Editorial/Footnotes and Sidenotes',
  parameters: { layout: 'padded' },
} satisfies Meta;
export default meta;
type Story = StoryObj<typeof meta>;

export const Endnotes: Story = {
  render: () => (
    <article className="max-w-prose font-sans text-body-md text-text">
      <p>
        The council approved the budget after a late-night vote.
        <FootnoteRef number={1} /> Ridership had fallen sharply during the pandemic, and officials said weekend routes
        would return first.
        <FootnoteRef number={2} />
      </p>
      <Footnotes
        notes={[
          { number: 1, children: 'The vote was 7 to 2, with two members absent.' },
          { number: 2, children: 'Figures from the agency’s 2025 annual ridership audit.' },
        ]}
      />
    </article>
  ),
};

export const Sidenotes: Story = {
  render: () => (
    <article className="max-w-prose font-sans text-body-md leading-relaxed text-text xl:mr-[18rem]">
      <p>
        The council approved the budget after a late-night vote.
        <Sidenote number={1}>The vote was 7 to 2, with two members absent.</Sidenote> Ridership had fallen sharply during
        the pandemic, and officials said weekend routes would return first.
        <Sidenote number={2}>Figures from the agency’s 2025 annual ridership audit.</Sidenote> A review is planned for the
        spring.
      </p>
      <p className="text-muted">
        Narrow the window: below 1280px the numbers become buttons that open each note under the text. Widen it and the
        notes move into the right margin.
      </p>
    </article>
  ),
};
