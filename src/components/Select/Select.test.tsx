import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Select, SelectItem, type SelectProps } from './Select';

function Example(props: Partial<SelectProps<object>>) {
  return (
    <Select label="Animal" placeholder="Choose one" {...props}>
      <SelectItem id="dog">Dog</SelectItem>
      <SelectItem id="cat">Cat</SelectItem>
      <SelectItem id="bird">Bird</SelectItem>
    </Select>
  );
}

const getTrigger = () => screen.getByRole('button', { name: /Animal/ });

describe('Select', () => {
  it('is named by its label and shows the placeholder', () => {
    render(<Example />);
    expect(getTrigger()).toHaveTextContent('Choose one');
  });

  it('opens a listbox of options on click', async () => {
    render(<Example />);
    await userEvent.click(getTrigger());
    expect(await screen.findByRole('listbox')).toBeInTheDocument();
    expect(screen.getAllByRole('option')).toHaveLength(3);
  });

  it('selects an option with the mouse, reports the key, and closes', async () => {
    const onSelectionChange = vi.fn();
    render(<Example onSelectionChange={onSelectionChange} />);
    const trigger = getTrigger();
    await userEvent.click(trigger);
    await userEvent.click(await screen.findByRole('option', { name: 'Cat' }));
    expect(onSelectionChange).toHaveBeenCalledWith('cat');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    expect(trigger).toHaveTextContent('Cat');
  });

  it('opens and selects with the keyboard', async () => {
    const onSelectionChange = vi.fn();
    render(<Example onSelectionChange={onSelectionChange} />);
    await userEvent.tab();
    expect(getTrigger()).toHaveFocus();
    await userEvent.keyboard('{ArrowDown}');
    await screen.findByRole('listbox');
    await waitFor(() => expect(screen.getByRole('option', { name: 'Dog' })).toHaveFocus());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onSelectionChange).toHaveBeenCalledWith('cat');
  });

  it('closes on Escape and returns focus to the trigger', async () => {
    render(<Example />);
    const trigger = getTrigger();
    await userEvent.click(trigger);
    await screen.findByRole('listbox');
    await userEvent.keyboard('{Escape}');
    await waitFor(() => expect(screen.queryByRole('listbox')).not.toBeInTheDocument());
    // React Aria restores focus on the next animation frame, so wait for it.
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it('shows a default selection', () => {
    render(<Example defaultSelectedKey="bird" />);
    expect(getTrigger()).toHaveTextContent('Bird');
  });

  it('links the description to the trigger', () => {
    render(<Example description="Pick your favorite." />);
    expect(getTrigger()).toHaveAccessibleDescription('Pick your favorite.');
  });

  it('shows the error message when invalid', () => {
    render(<Example isInvalid errorMessage="Choose an animal." />);
    expect(screen.getByText('Choose an animal.')).toBeInTheDocument();
  });

  it('does not open when disabled', async () => {
    render(<Example isDisabled />);
    const trigger = getTrigger();
    expect(trigger).toBeDisabled();
    await userEvent.click(trigger);
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('supports dynamic items', async () => {
    const animals = [
      { id: 'ant', name: 'Ant' },
      { id: 'bee', name: 'Bee' },
    ];
    render(
      <Select label="Insect" items={animals}>
        {(item) => <SelectItem id={item.id}>{item.name}</SelectItem>}
      </Select>,
    );
    await userEvent.click(screen.getByRole('button', { name: /Insect/ }));
    expect(await screen.findByRole('option', { name: 'Bee' })).toBeInTheDocument();
  });

  it.each([
    ['default', {}],
    ['with description', { description: 'Pick your favorite.' }],
    ['invalid', { isInvalid: true, errorMessage: 'Choose an animal.' }],
    ['disabled', { isDisabled: true }],
  ])('has no axe violations when closed (%s)', async (_name, props) => {
    const { container } = render(<Example {...props} />);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });

  it('has no axe violations when open', async () => {
    render(<Example />);
    await userEvent.click(getTrigger());
    await screen.findByRole('listbox');
    const results = await axe(document.body, { rules: { region: { enabled: false } } });
    expect(results.violations).toEqual([]);
  });
});
