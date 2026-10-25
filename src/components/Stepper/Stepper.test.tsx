import { useState } from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe } from 'vitest-axe';
import { Stepper, useStepFocus, type StepperProps, type StepperStep } from './Stepper';

const steps: StepperStep[] = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile', description: 'Tell us about you' },
  { id: 'prefs', label: 'Preferences', optional: true },
  { id: 'review', label: 'Review' },
];

function setup(props: Partial<StepperProps> = {}) {
  return render(<Stepper steps={steps} currentStep={1} {...props} />);
}

const item = (name: string) => screen.getByText(name).closest('li') as HTMLElement;

describe('Stepper', () => {
  it('is a labelled navigation containing an ordered list of steps', () => {
    setup({ 'aria-label': 'Signup progress' });
    const nav = screen.getByRole('navigation', { name: 'Signup progress' });
    expect(within(nav).getByRole('list').tagName).toBe('OL');
    expect(screen.getAllByRole('listitem')).toHaveLength(steps.length);
  });

  it('has a default navigation label', () => {
    setup();
    expect(screen.getByRole('navigation', { name: 'Progress' })).toBeInTheDocument();
  });

  it('marks only the current step with aria-current="step"', () => {
    setup({ currentStep: 2 });
    const current = screen.getAllByRole('listitem').filter((li) => li.getAttribute('aria-current') === 'step');
    expect(current).toHaveLength(1);
    expect(current[0]).toHaveTextContent('Preferences');
  });

  it('says each step\'s state in text, not just color', () => {
    setup();
    expect(item('Account')).toHaveTextContent('Account, completed');
    expect(item('Profile')).toHaveTextContent('Profile, current step');
    expect(item('Preferences')).toHaveTextContent('Preferences');
    expect(item('Preferences')).toHaveTextContent(', optional, upcoming');
    expect(item('Review')).toHaveTextContent('Review, upcoming');
  });

  it('shows a check for finished steps and numbers for the rest', () => {
    setup();
    expect(item('Account').querySelector('svg')).toBeInTheDocument();
    expect(item('Account')).not.toHaveTextContent('1');
    expect(item('Profile')).toHaveTextContent('2');
    expect(item('Review')).toHaveTextContent('4');
  });

  it('shows descriptions and an Optional tag', () => {
    setup();
    expect(screen.getByText('Tell us about you')).toBeInTheDocument();
    expect(screen.getByText('Optional')).toBeInTheDocument();
  });

  it('flags a step with errors in text and with an icon', () => {
    setup({ steps: steps.map((s) => (s.id === 'profile' ? { ...s, error: true } : s)) });
    expect(item('Profile')).toHaveTextContent('Profile, has errors');
    expect(item('Profile').querySelector('svg')).toBeInTheDocument();
  });

  it('shows every step as complete when currentStep is past the end', () => {
    setup({ currentStep: steps.length });
    expect(screen.getAllByRole('listitem').some((li) => li.getAttribute('aria-current') === 'step')).toBe(false);
    steps.forEach((s) => expect(item(s.label)).toHaveTextContent(', completed'));
  });

  it('uses circular markers by default and square ones on request', () => {
    const { rerender } = setup();
    const marker = () => item('Account').querySelector('span[aria-hidden="true"]');
    expect(marker()).toHaveClass('rounded-full');

    rerender(<Stepper steps={steps} currentStep={1} shape="square" />);
    expect(marker()).toHaveClass('rounded-sm');
    expect(marker()).not.toHaveClass('rounded-full');
  });

  it('lays out vertically on request', () => {
    setup({ orientation: 'vertical' });
    expect(screen.getByRole('list')).toHaveClass('flex-col');
  });

  describe('going back', () => {
    it('makes only completed steps into buttons when onStepPress is given', async () => {
      const onStepPress = vi.fn();
      setup({ currentStep: 2, onStepPress });
      const buttons = screen.getAllByRole('button');
      expect(buttons).toHaveLength(2);
      await userEvent.click(screen.getByRole('button', { name: /Account/ }));
      expect(onStepPress).toHaveBeenCalledWith(0);
    });

    it('has no buttons without onStepPress', () => {
      setup({ currentStep: 2 });
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  describe('compact', () => {
    it('shows "Step n of total" and the current label', () => {
      setup({ variant: 'compact' });
      expect(screen.getByText('Step 2 of 4')).toBeInTheDocument();
      expect(screen.getByText('Step 2 of 4').nextElementSibling).toHaveTextContent('Profile');
    });

    it('still gives assistive tech the full list with states', () => {
      setup({ variant: 'compact' });
      expect(screen.getAllByRole('listitem')).toHaveLength(steps.length);
      expect(item('Account')).toHaveTextContent('Account, completed');
    });

    it('does not offer step buttons', () => {
      setup({ variant: 'compact', currentStep: 2, onStepPress: () => {} });
      expect(screen.queryByRole('button')).not.toBeInTheDocument();
    });
  });

  it.each<[string, Partial<StepperProps>]>([
    ['horizontal', {}],
    ['vertical', { orientation: 'vertical' }],
    ['square markers', { shape: 'square' }],
    ['compact', { variant: 'compact' }],
    ['with back buttons', { currentStep: 3, onStepPress: () => {} }],
    ['finished', { currentStep: 4 }],
  ])('has no axe violations (%s)', async (_name, props) => {
    const { container } = setup(props);
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});

describe('useStepFocus', () => {
  function Flow() {
    const [step, setStep] = useState(0);
    const focus = useStepFocus(step);
    return (
      <div>
        <h2 {...focus}>Step {step + 1}</h2>
        <button onClick={() => setStep((s) => s + 1)}>Next</button>
      </div>
    );
  }

  it('does not steal focus on first render', () => {
    render(<Flow />);
    expect(screen.getByRole('heading')).not.toHaveFocus();
  });

  it('moves focus to the heading when the step changes', async () => {
    render(<Flow />);
    await userEvent.click(screen.getByRole('button', { name: 'Next' }));
    expect(screen.getByRole('heading', { name: 'Step 2' })).toHaveFocus();
  });
});
