import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { ComboBox, ComboBoxItem, type ComboBoxProps } from './ComboBox';

function Example(props: Partial<ComboBoxProps<object>>) {
  return (
    <ComboBox label="Animal" placeholder="Type to search" {...props}>
      <ComboBoxItem id="dog">Dog</ComboBoxItem>
      <ComboBoxItem id="cat">Cat</ComboBoxItem>
      <ComboBoxItem id="bird">Bird</ComboBoxItem>
    </ComboBox>
  );
}

const getInput = () => screen.getByRole('combobox', { name: 'Animal' });
const getButton = () => screen.getByRole('button');

describe('ComboBox', () => {
  it('is a combobox named by its label', () => {
    render(<Example />);
    expect(getInput()).toHaveAttribute('placeholder', 'Type to search');
    expect(getInput()).toHaveAttribute('aria-expanded', 'false');
  });

  it('filters the options as you type', async () => {
    render(<Example />);
    await userEvent.type(getInput(), 'ca');
    await screen.findByRole('listbox');
    expect(getInput()).toHaveAttribute('aria-expanded', 'true');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Cat']);
  });

  it('selects a filtered option with the keyboard', async () => {
    const onSelectionChange = vi.fn();
    render(<Example onSelectionChange={onSelectionChange} />);
    await userEvent.type(getInput(), 'b');
    await screen.findByRole('listbox');
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelectionChange).toHaveBeenCalledWith('bird');
    expect(getInput()).toHaveValue('Bird');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
  });

  it('shows every option from the button and selects one with the mouse', async () => {
    const onSelectionChange = vi.fn();
    render(<Example onSelectionChange={onSelectionChange} />);
    await userEvent.click(getButton());
    await screen.findByRole('listbox');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    await userEvent.click(screen.getByRole('option', { name: 'Cat' }));
    expect(onSelectionChange).toHaveBeenCalledWith('cat');
    expect(getInput()).toHaveValue('Cat');
  });

  it('keeps the button out of the tab order', async () => {
    render(<Example />);
    await userEvent.tab();
    expect(getInput()).toHaveFocus();
    expect(getButton()).toHaveAttribute('tabindex', '-1');
  });

  it('shows the empty message when nothing matches', async () => {
    render(<Example emptyMessage="No animals match." />);
    await userEvent.type(getInput(), 'zzz');
    expect(await screen.findByText('No animals match.')).toBeInTheDocument();
    // React Aria wraps the empty message in a role="option" element so the listbox stays valid,
    // so check that none of the real options are left.
    for (const name of ['Dog', 'Cat', 'Bird']) expect(screen.queryByRole('option', { name })).not.toBeInTheDocument();
  });

  it('closes on Escape and keeps focus in the input', async () => {
    render(<Example />);
    await userEvent.type(getInput(), 'd');
    await screen.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(getInput()).toHaveFocus();
  });

  it('shows a default selection', () => {
    render(<Example defaultSelectedKey="bird" />);
    expect(getInput()).toHaveValue('Bird');
  });

  it('keeps typed text when custom values are allowed', async () => {
    render(<Example allowsCustomValue />);
    await userEvent.type(getInput(), 'Ferret');
    await userEvent.tab();
    expect(getInput()).toHaveValue('Ferret');
  });

  it('reverts typed text to the selection when custom values are not allowed', async () => {
    render(<Example defaultSelectedKey="dog" />);
    // Clearing the input removes the selection, so append to the selected text instead.
    await userEvent.type(getInput(), 'xyz');
    await userEvent.tab();
    expect(getInput()).toHaveValue('Dog');
  });

  it('links the description to the input', () => {
    render(<Example description="Start typing a name." />);
    expect(getInput()).toHaveAccessibleDescription('Start typing a name.');
  });

  it('shows the error message when invalid', () => {
    render(<Example isInvalid errorMessage="Choose an animal." />);
    expect(screen.getByText('Choose an animal.')).toBeInTheDocument();
    expect(getInput()).toHaveAttribute('aria-invalid', 'true');
  });

  it('cannot be used when disabled', async () => {
    render(<Example isDisabled />);
    expect(getInput()).toBeDisabled();
    await userEvent.click(getButton());
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('filters dynamic items passed as defaultItems', async () => {
    const people = [
      { id: 'ada', name: 'Ada Lovelace' },
      { id: 'grace', name: 'Grace Hopper' },
      { id: 'alan', name: 'Alan Turing' },
    ];
    render(
      <ComboBox label="Assignee" defaultItems={people}>
        {(person) => <ComboBoxItem id={person.id}>{person.name}</ComboBoxItem>}
      </ComboBox>,
    );
    const input = screen.getByRole('combobox', { name: 'Assignee' });
    await userEvent.type(input, 'a');
    await screen.findByRole('listbox');
    expect(screen.getAllByRole('option')).toHaveLength(3);
    // The default filter matches anywhere in the text, ignoring case.
    await userEvent.clear(input);
    await userEvent.type(input, 'LA');
    expect(screen.getAllByRole('option').map((o) => o.textContent)).toEqual(['Ada Lovelace', 'Alan Turing']);
  });

  it.each([
    ['default', {}],
    ['with description', { description: 'Start typing a name.' }],
    ['invalid', { isInvalid: true, errorMessage: 'Choose an animal.' }],
    ['disabled', { isDisabled: true }],
  ])('has no axe violations when closed (%s)', async (_name, props) => {
    const { container } = render(<Example {...props} />);
    expect((await axe(container)).violations).toEqual([]);
  });

  it('has no axe violations when open', async () => {
    render(<Example />);
    await userEvent.click(getButton());
    await screen.findByRole('listbox');
    expect((await axe(document.body, { rules: { region: { enabled: false } } })).violations).toEqual([]);
  });

  it('has no axe violations when showing the empty message', async () => {
    render(<Example />);
    await userEvent.type(getInput(), 'zzz');
    await screen.findByText('No results');
    expect((await axe(document.body, { rules: { region: { enabled: false } } })).violations).toEqual([]);
  });
});
