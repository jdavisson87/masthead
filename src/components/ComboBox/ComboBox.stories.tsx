import { useMemo, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { ComboBox, ComboBoxItem, type ComboBoxProps } from './ComboBox';

/** Story wrapper so the Controls panel can edit label, placeholder, and states. */
function DemoComboBox(props: Omit<ComboBoxProps<object>, 'children'>) {
  return (
    <ComboBox {...props}>
      <ComboBoxItem id="dog">Dog</ComboBoxItem>
      <ComboBoxItem id="cat">Cat</ComboBoxItem>
      <ComboBoxItem id="bird">Bird</ComboBoxItem>
      <ComboBoxItem id="fish" isDisabled>
        Fish (unavailable)
      </ComboBoxItem>
      <ComboBoxItem id="rabbit">Rabbit</ComboBoxItem>
    </ComboBox>
  );
}

const meta = {
  title: 'Components/ComboBox',
  component: DemoComboBox,
  tags: ['autodocs'],
  args: { label: 'Favorite animal', placeholder: 'Type to search', className: 'w-64' },
  argTypes: {
    label: { control: 'text' },
    placeholder: { control: 'text' },
    description: { control: 'text' },
    emptyMessage: { control: 'text' },
    allowsCustomValue: { control: 'boolean' },
    menuTrigger: { control: 'inline-radio', options: ['input', 'focus', 'manual'] },
    isDisabled: { control: 'boolean' },
    isInvalid: { control: 'boolean' },
    isRequired: { control: 'boolean' },
  },
} satisfies Meta<typeof DemoComboBox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithDescription: Story = { args: { description: 'Start typing, or open the list with the arrow.' } };
export const Selected: Story = { args: { defaultSelectedKey: 'cat' } };
/** Typed text is kept on blur instead of reverting to the selected option. */
export const CustomValue: Story = { args: { allowsCustomValue: true, description: 'Pick one, or type your own.' } };
/** The list opens as soon as the input gets focus. */
export const OpenOnFocus: Story = { args: { menuTrigger: 'focus' } };
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

/** Pass `defaultItems` and the combobox filters them for you, matching anywhere in the text. */
export const DynamicItems: Story = {
  render: () => (
    <ComboBox label="Assignee" placeholder="Search people" defaultItems={people} className="w-64">
      {(person) => <ComboBoxItem id={person.id}>{person.name}</ComboBoxItem>}
    </ComboBox>
  ),
};

/** Pass `items` and filter yourself, for example to match only the start of a name. */
export const CustomFiltering: Story = {
  render: function Render() {
    const [query, setQuery] = useState('');
    const items = useMemo(
      () => people.filter((p) => p.name.toLowerCase().startsWith(query.toLowerCase())),
      [query],
    );
    return (
      <ComboBox
        label="Assignee"
        placeholder="Starts with..."
        items={items}
        inputValue={query}
        onInputChange={setQuery}
        emptyMessage="No one's name starts with that."
        className="w-64"
      >
        {(person) => <ComboBoxItem id={person.id}>{person.name}</ComboBoxItem>}
      </ComboBox>
    );
  },
};
