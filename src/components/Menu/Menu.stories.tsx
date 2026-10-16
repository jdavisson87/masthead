import { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import type { Selection } from 'react-aria-components';
import { Button } from '../Button/Button';
import { IconButton } from '../IconButton/IconButton';
import { Cell, Column, Row, Table, TableBody, TableHeader } from '../Table/Table';
import { Menu, MenuItem, MenuSection, MenuSeparator, MenuTrigger, SubmenuTrigger } from './Menu';

const meta = {
  title: 'Components/Menu',
  component: Menu,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  argTypes: {
    placement: {
      control: 'select',
      options: ['bottom start', 'bottom end', 'top start', 'top end', 'right top', 'left top'],
    },
    children: { control: false },
  },
} satisfies Meta<typeof Menu>;

export default meta;
type Story = StoryObj<typeof meta>;

const icon = { viewBox: '0 0 16 16', fill: 'none', stroke: 'currentColor', strokeWidth: 1.5, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;
const Pencil = () => (
  <svg {...icon}>
    <path d="M10.5 2.5l3 3L5 14H2v-3z" />
  </svg>
);
const Copy = () => (
  <svg {...icon}>
    <rect x="5" y="5" width="8" height="8" rx="1" />
    <path d="M3 10V4a1 1 0 011-1h6" />
  </svg>
);
const Trash = () => (
  <svg {...icon}>
    <path d="M3 4.5h10M6.5 4.5V3h3v1.5M4.5 4.5l.5 8.5h6l.5-8.5M7 7v4M9 9v2" />
  </svg>
);
const Dots = () => (
  <svg viewBox="0 0 16 16" fill="currentColor">
    <circle cx="3" cy="8" r="1.25" />
    <circle cx="8" cy="8" r="1.25" />
    <circle cx="13" cy="8" r="1.25" />
  </svg>
);

export const Default: Story = {
  render: (args) => (
    <MenuTrigger>
      <Button intent="secondary">Actions</Button>
      <Menu {...args} aria-label="Actions" onAction={(key) => console.log('action', key)}>
        <MenuItem id="edit">Edit</MenuItem>
        <MenuItem id="duplicate">Duplicate</MenuItem>
        <MenuItem id="archive">Archive</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

export const WithIconsAndShortcuts: Story = {
  render: (args) => (
    <MenuTrigger>
      <Button intent="secondary">Document</Button>
      <Menu {...args} aria-label="Document actions">
        <MenuItem id="edit" icon={<Pencil />} shortcut="⌘E">
          Edit
        </MenuItem>
        <MenuItem id="duplicate" icon={<Copy />} shortcut="⌘D">
          Duplicate
        </MenuItem>
        <MenuSeparator />
        <MenuItem id="delete" icon={<Trash />} tone="danger" shortcut="⌫">
          Delete
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

export const WithDescriptions: Story = {
  render: (args) => (
    <MenuTrigger>
      <Button intent="secondary">Share</Button>
      <Menu {...args} aria-label="Share options">
        <MenuItem id="link" description="Anyone with the link can view">
          Copy public link
        </MenuItem>
        <MenuItem id="invite" description="Only people you add can open it">
          Invite collaborators
        </MenuItem>
        <MenuItem id="export" description="PDF, Word or Markdown" isDisabled>
          Export
        </MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

export const Sections: Story = {
  render: (args) => (
    <MenuTrigger>
      <Button intent="secondary">Account</Button>
      <Menu {...args} aria-label="Account menu">
        <MenuSection title="Signed in as ada@example.com">
          <MenuItem id="profile">Profile</MenuItem>
          <MenuItem id="settings">Settings</MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuSection title="Workspace">
          <MenuItem id="members">Members</MenuItem>
          <MenuItem id="billing">Billing</MenuItem>
        </MenuSection>
        <MenuSeparator />
        <MenuItem id="signout">Sign out</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

export const SingleSelection: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Selection>(new Set(['newest']));
    return (
      <MenuTrigger>
        <Button intent="secondary">Sort by</Button>
        <Menu {...args} aria-label="Sort by" selectionMode="single" selectedKeys={selected} onSelectionChange={setSelected}>
          <MenuItem id="newest">Newest first</MenuItem>
          <MenuItem id="oldest">Oldest first</MenuItem>
          <MenuItem id="name">Name</MenuItem>
        </Menu>
      </MenuTrigger>
    );
  },
};

export const MultipleSelection: Story = {
  render: (args) => {
    const [selected, setSelected] = useState<Selection>(new Set(['name', 'status']));
    return (
      <MenuTrigger>
        <Button intent="secondary">Columns</Button>
        <Menu {...args} aria-label="Visible columns" selectionMode="multiple" selectedKeys={selected} onSelectionChange={setSelected}>
          <MenuItem id="name">Name</MenuItem>
          <MenuItem id="status">Status</MenuItem>
          <MenuItem id="owner">Owner</MenuItem>
          <MenuItem id="updated">Last updated</MenuItem>
        </Menu>
      </MenuTrigger>
    );
  },
};

export const Submenu: Story = {
  render: (args) => (
    <MenuTrigger>
      <Button intent="secondary">File</Button>
      <Menu {...args} aria-label="File menu">
        <MenuItem id="new">New</MenuItem>
        <SubmenuTrigger>
          <MenuItem id="export">Export as</MenuItem>
          <Menu aria-label="Export formats">
            <MenuItem id="pdf">PDF</MenuItem>
            <MenuItem id="docx">Word</MenuItem>
            <MenuItem id="md">Markdown</MenuItem>
          </Menu>
        </SubmenuTrigger>
        <MenuItem id="print">Print</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

export const DisabledItems: Story = {
  render: (args) => (
    <MenuTrigger>
      <Button intent="secondary">Actions</Button>
      <Menu {...args} aria-label="Actions" disabledKeys={['duplicate']}>
        <MenuItem id="edit">Edit</MenuItem>
        <MenuItem id="duplicate">Duplicate</MenuItem>
        <MenuItem id="archive">Archive</MenuItem>
      </Menu>
    </MenuTrigger>
  ),
};

const people = [
  { id: 'ada', name: 'Ada Lovelace', role: 'Engineer' },
  { id: 'grace', name: 'Grace Hopper', role: 'Admiral' },
  { id: 'alan', name: 'Alan Turing', role: 'Mathematician' },
];

/** A menu per row: the icon button's label names the person, so each trigger is distinct. */
export const TableRowActions: Story = {
  render: (args) => (
    <Table aria-label="People" className="w-[480px] max-w-full">
      <TableHeader>
        <Column id="name" isRowHeader>
          Name
        </Column>
        <Column id="role">Role</Column>
        <Column id="actions" align="end">
          <span className="sr-only">Actions</span>
        </Column>
      </TableHeader>
      <TableBody>
        {people.map((p) => (
          <Row key={p.id} id={p.id}>
            <Cell>{p.name}</Cell>
            <Cell>{p.role}</Cell>
            <Cell>
              <MenuTrigger>
                <IconButton size="sm" aria-label={`Actions for ${p.name}`}>
                  <Dots />
                </IconButton>
                <Menu {...args} placement="bottom end" aria-label={`${p.name} actions`}>
                  <MenuItem id="edit" icon={<Pencil />}>
                    Edit
                  </MenuItem>
                  <MenuItem id="delete" icon={<Trash />} tone="danger">
                    Delete
                  </MenuItem>
                </Menu>
              </MenuTrigger>
            </Cell>
          </Row>
        ))}
      </TableBody>
    </Table>
  ),
};
