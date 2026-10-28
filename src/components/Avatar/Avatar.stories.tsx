import type { Meta, StoryObj } from '@storybook/react-vite';
import { Avatar, AvatarGroup } from './Avatar';

const photo = (seed: string) =>
  `data:image/svg+xml;utf8,${encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="#${seed}"/><circle cx="40" cy="31" r="14" fill="#fff" opacity=".85"/><path d="M12 80c2-20 16-28 28-28s26 8 28 28z" fill="#fff" opacity=".85"/></svg>`,
  )}`;

const meta = {
  title: 'Components/Avatar',
  component: Avatar,
  args: { name: 'Jane Doe', size: 'md', shape: 'circle' },
  argTypes: {
    size: { control: 'inline-radio', options: ['xs', 'sm', 'md', 'lg', 'xl'] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
  },
} satisfies Meta<typeof Avatar>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Initials: Story = {};
export const WithPhoto: Story = { args: { src: photo('1e40af') } };
export const BrokenPhotoFallsBack: Story = { args: { src: '/does-not-exist.jpg' } };
export const Square: Story = { args: { shape: 'square' } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-end gap-3">
      {(['xs', 'sm', 'md', 'lg', 'xl'] as const).map((size) => (
        <Avatar key={size} {...args} size={size} />
      ))}
    </div>
  ),
};

export const Group: Story = {
  render: () => (
    <div className="flex flex-col gap-6">
      <AvatarGroup
        aria-label="Authors"
        max={4}
        people={[
          { name: 'Ada Lovelace', src: photo('1e40af') },
          { name: 'Grace Hopper', src: photo('92400e') },
          { name: 'Alan Turing' },
          { name: 'Katherine Johnson' },
          { name: 'Linus Torvalds' },
          { name: 'Margaret Hamilton' },
        ]}
      />
      <AvatarGroup aria-label="Reviewers" size="sm" shape="square" people={[{ name: 'Ada Lovelace' }, { name: 'Grace Hopper' }]} />
    </div>
  ),
};
