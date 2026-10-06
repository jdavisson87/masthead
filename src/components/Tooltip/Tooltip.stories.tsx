import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Tooltip, TooltipTrigger, type TooltipProps } from './Tooltip';

/** Story-only controls so the text can be edited in Storybook. */
type DemoArgs = TooltipProps & { triggerLabel: string; content: string };

const meta: Meta<DemoArgs> = {
  title: 'Components/Tooltip',
  component: Tooltip,
  tags: ['autodocs'],
  parameters: { controls: { include: ['triggerLabel', 'content', 'placement', 'offset'] } },
  args: { triggerLabel: 'Hover or focus me', content: 'Saves your changes as a draft', placement: 'top' },
  argTypes: {
    triggerLabel: { control: 'text', description: 'Story only: trigger button text' },
    content: { control: 'text', description: 'Story only: tooltip text' },
    placement: { control: 'select', options: ['top', 'bottom', 'left', 'right'] },
  },
};

export default meta;
type Story = StoryObj<DemoArgs>;

export const Default: Story = {
  render: ({ triggerLabel, content, ...tooltipProps }) => (
    <TooltipTrigger>
      <Button intent="secondary">{triggerLabel}</Button>
      <Tooltip {...tooltipProps}>{content}</Tooltip>
    </TooltipTrigger>
  ),
};

/** The most common use: naming an icon-only button for sighted mouse and keyboard users. */
export const OnIconButton: Story = {
  args: { content: 'Delete item', placement: 'bottom' },
  parameters: { controls: { include: ['content', 'placement'] } },
  render: ({ triggerLabel: _label, content, ...tooltipProps }) => (
    <TooltipTrigger>
      <IconButton aria-label={content} intent="secondary">
        <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M2.5 4.5h11M6 4.5V2.5h4v2M4 4.5l.6 9h6.8l.6-9" />
        </svg>
      </IconButton>
      <Tooltip {...tooltipProps}>{content}</Tooltip>
    </TooltipTrigger>
  ),
};

export const Instant: Story = {
  parameters: { controls: { include: ['content', 'placement'] } },
  render: ({ triggerLabel, content, ...tooltipProps }) => (
    <TooltipTrigger delay={0}>
      <Button intent="ghost">{triggerLabel}</Button>
      <Tooltip {...tooltipProps}>{content}</Tooltip>
    </TooltipTrigger>
  ),
};
