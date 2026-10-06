import type { Meta, StoryObj } from '@storybook/react-vite';
import { Select, SelectItem, type SelectProps } from './Select';

/** Story wrapper so the Controls panel can edit label, placeholder, and states. */
function DemoSelect(props: Omit<SelectProps<object>, 'children'>) {
  return (
    <Select {...props}>
      <SelectItem id="dog">Dog</SelectItem>
      <SelectItem id="cat">Cat</SelectItem>
      <SelectItem id="bird">Bird</SelectItem>
      <SelectItem id="fish" isDisabled>
        Fish (unavailable)
      </SelectItem>
      <SelectItem id="rabbit">Rabbit</SelectItem>
    </Select>
  );
}

const meta = {
  title: 'Components/Select',
  component: DemoSelect,
  tags: ['autodocs'],
  args: { label: 'Favorite animal', placeholder: 'Choose one', className: 'w-64' },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    description: { control: 'text' },
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    isRequired: { control: 'boolean' },
  },
} satisfies Meta<typeof DemoSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = { args: { description: 'Used to personalize your dashboard.' } };
export const Selected: Story = { args: { defaultSelectedKey: 'cat' } };
export const Required: Story = { args: { isRequired: true, description: 'Required field.' } };
export const Invalid: Story = { args: { isInvalid: true, errorMessage: 'Please choose an animal.' } };
export const Disabled: Story = { args: { isDisabled: true } };

const people = [
  { id: 'ada', name: 'Ada Lovelace' },
  { id: 'grace', name: 'Grace Hopper' },
  { id: 'alan', name: 'Alan Turing' },
  { id: 'katherine', name: 'Katherine Johnson' },
  { id: 'margaret', name: 'Margaret Hamilton' },
  { id: 'linus', name: 'Linus Torvalds' },
  { id: 'dennis', name: 'Dennis Ritchie' },
  { id: 'barbara', name: 'Barbara Liskov' },
];

/** Long lists scroll inside the popover, and arrow keys move through the items. */
export const DynamicItems: Story = {
  render: () => (
    <Select label="Assignee" placeholder="Select a person" items={people} className="w-64">
      {(person) => <SelectItem id={person.id}>{person.name}</SelectItem>}
    </Select>
  ),
};
