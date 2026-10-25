import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Key, Selection } from 'react-aria-components';
import { Button } from '../Button/Button';
import { TextField } from '../TextField/TextField';
import { Tag, TagGroup } from './Tag';

const meta = {
  title: 'Components/Tag',
  component: TagGroup,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { label: 'Topics', children: null },
  argTypes: {
    size: { control: 'inline-radio', options: ['sm', 'md'] },
    selectionMode: { control: 'inline-radio', options: ['none', 'single', 'multiple'] },
    hideLabel: { control: 'boolean' },
    children: { control: false },
  },
} satisfies Meta<typeof TagGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: (args) => (
    <TagGroup {...args}>
      <Tag id="design">Design systems</Tag>
      <Tag id="a11y">Accessibility</Tag>
      <Tag id="react">React</Tag>
    </TagGroup>
  ),
};

export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-6">
      <TagGroup {...args} size="sm" label="Small">
        <Tag id="a">Alpha</Tag>
        <Tag id="b">Beta</Tag>
      </TagGroup>
      <TagGroup {...args} size="md" label="Medium">
        <Tag id="a">Alpha</Tag>
        <Tag id="b">Beta</Tag>
      </TagGroup>
    </div>
  ),
};

export const SingleSelection: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Selection>(new Set(['week']));
    return (
      <TagGroup
        {...args}
        label="Time range"
        selectionMode="single"
        disallowEmptySelection
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        <Tag id="day">Today</Tag>
        <Tag id="week">This week</Tag>
        <Tag id="month">This month</Tag>
        <Tag id="year">This year</Tag>
      </TagGroup>
    );
  },
};

export const MultipleSelection: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Selection>(new Set(['open', 'urgent']));
    return (
      <TagGroup
        {...args}
        label="Filter by status"
        description="Arrow keys move between filters; Space toggles one."
        selectionMode="multiple"
        selectedKeys={selected}
        onSelectionChange={setSelected}
      >
        <Tag id="open">Open</Tag>
        <Tag id="urgent">Urgent</Tag>
        <Tag id="blocked">Blocked</Tag>
        <Tag id="done">Done</Tag>
      </TagGroup>
    );
  },
};

type Skill = { id: string; name: string };

export const Removable: Story = {
  render: (args) => {
    const [skills, setSkills] = useState<Skill[]>([
      { id: 'react', name: 'React' },
      { id: 'ts', name: 'TypeScript' },
      { id: 'a11y', name: 'Accessibility' },
    ]);
    const remove = (keys: Set<Key>) => setSkills((list) => list.filter((s) => !keys.has(s.id)));
    return (
      <TagGroup
        {...args}
        label="Skills"
        description="Backspace or Delete removes the focused tag."
        items={skills}
        onRemove={remove}
        emptyMessage="No skills added."
      >
        {(skill: Skill) => <Tag id={skill.id}>{skill.name}</Tag>}
      </TagGroup>
    );
  },
};

/** Tags, TextField and Button working together. */
export const AddAndRemove: Story = {
  render: (args) => {
    const [skills, setSkills] = useState<Skill[]>([{ id: 'react', name: 'React' }]);
    const [draft, setDraft] = useState('');
    const add = (event: React.FormEvent) => {
      event.preventDefault();
      const name = draft.trim();
      if (!name || skills.some((s) => s.name.toLowerCase() === name.toLowerCase())) return;
      setSkills((list) => [...list, { id: name.toLowerCase(), name }]);
      setDraft('');
    };
    return (
      <div className="flex w-96 flex-col gap-4">
        <form onSubmit={add} className="flex items-end gap-2">
          <TextField label="Add a skill" value={draft} onChange={setDraft} className="flex-1" />
          <Button type="submit" intent="secondary">
            Add
          </Button>
        </form>
        <TagGroup
          {...args}
          label="Your skills"
          items={skills}
          onRemove={(keys) => setSkills((list) => list.filter((s) => !keys.has(s.id)))}
          emptyMessage="No skills yet."
        >
          {(skill: Skill) => <Tag id={skill.id}>{skill.name}</Tag>}
        </TagGroup>
      </div>
    );
  },
};

export const DisabledTag: Story = {
  render: (args) => (
    <TagGroup {...args} label="Plans" selectionMode="single" disabledKeys={['team']}>
      <Tag id="free">Free</Tag>
      <Tag id="pro">Pro</Tag>
      <Tag id="team">Team</Tag>
    </TagGroup>
  ),
};

export const HiddenLabel: Story = {
  render: (args) => (
    <TagGroup {...args} label="Article tags" hideLabel>
      <Tag id="a11y">Accessibility</Tag>
      <Tag id="react">React</Tag>
    </TagGroup>
  ),
};
