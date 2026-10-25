import { useRef, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Button } from '../Button/Button';
import { Checkbox } from '../Checkbox/Checkbox';
import { NumberField } from '../NumberField/NumberField';
import { Radio, RadioGroup } from '../RadioGroup/RadioGroup';
import { TextArea } from '../TextArea/TextArea';
import { TextField } from '../TextField/TextField';
import { Stepper, useStepFocus, type StepperStep } from './Stepper';

const meta = {
  title: 'Components/Stepper',
  component: Stepper,
  tags: ['autodocs'],
  parameters: { layout: 'padded' },
  args: { currentStep: 1, steps: [] },
  argTypes: {
    currentStep: { control: { type: 'number', min: 0, max: 4 } },
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    variant: { control: 'inline-radio', options: ['full', 'compact'] },
    shape: { control: 'inline-radio', options: ['circle', 'square'] },
    steps: { control: false },
    onStepPress: { control: false },
  },
} satisfies Meta<typeof Stepper>;

export default meta;
type Story = StoryObj<typeof meta>;

const signupSteps: StepperStep[] = [
  { id: 'account', label: 'Account' },
  { id: 'profile', label: 'Profile' },
  { id: 'prefs', label: 'Preferences' },
  { id: 'review', label: 'Review' },
];

export const Default: Story = { args: { steps: signupSteps } };

export const Vertical: Story = {
  args: {
    orientation: 'vertical',
    currentStep: 1,
    steps: [
      { id: 'account', label: 'Account', description: 'Email and password' },
      { id: 'profile', label: 'Profile', description: 'Name and a short bio' },
      { id: 'prefs', label: 'Preferences', description: 'Plan and notifications', optional: true },
      { id: 'review', label: 'Review', description: 'Check everything and create your account' },
    ],
  },
};

export const WithDescriptions: Story = {
  args: {
    steps: [
      { id: 'account', label: 'Account', description: 'Email and password' },
      { id: 'profile', label: 'Profile', description: 'Name and bio' },
      { id: 'review', label: 'Review', description: 'Confirm details' },
    ],
  },
};

export const Shapes: Story = {
  render: (args) => (
    <div className="flex flex-col gap-8">
      <Stepper {...args} steps={signupSteps} currentStep={2} shape="circle" aria-label="Circle markers" />
      <Stepper {...args} steps={signupSteps} currentStep={2} shape="square" aria-label="Square markers" />
    </div>
  ),
};

export const Compact: Story = {
  args: { steps: signupSteps, variant: 'compact', currentStep: 2 },
  decorators: [(Story) => <div className="max-w-xs"><Story /></div>],
};

export const WithError: Story = {
  args: { currentStep: 2, steps: signupSteps.map((s) => (s.id === 'profile' ? { ...s, error: true } : s)) },
};

export const Finished: Story = { args: { steps: signupSteps, currentStep: 4 } };

/** Finished steps become buttons, so people can go back. */
export const GoBackToCompletedSteps: Story = {
  render: (args) => {
    const [step, setStep] = useState(2);
    return (
      <div className="flex flex-col gap-4">
        <Stepper {...args} steps={signupSteps} currentStep={step} onStepPress={setStep} />
        <div className="flex gap-2">
          <Button intent="secondary" onPress={() => setStep((s) => Math.max(0, s - 1))}>Back</Button>
          <Button onPress={() => setStep((s) => Math.min(signupSteps.length, s + 1))}>Next</Button>
        </div>
      </div>
    );
  },
};

/* ------------------------- A full signup flow ------------------------- */

type Form = {
  email: string;
  password: string;
  name: string;
  bio: string;
  plan: string;
  seats: number;
  updates: boolean;
};

const emptyForm: Form = { email: '', password: '', name: '', bio: '', plan: 'free', seats: 1, updates: true };

function validate(step: number, f: Form): Partial<Record<keyof Form, string>> {
  const errors: Partial<Record<keyof Form, string>> = {};
  if (step === 0) {
    if (!/^\S+@\S+\.\S+$/.test(f.email)) errors.email = 'Enter a valid email address.';
    if (f.password.length < 8) errors.password = 'Use at least 8 characters.';
  }
  if (step === 1) {
    if (f.name.trim().length < 2) errors.name = 'Enter your name.';
  }
  if (step === 2) {
    if (f.plan === 'team' && f.seats < 2) errors.seats = 'A team plan needs at least 2 seats.';
  }
  return errors;
}

const stepTitles = ['Create your account', 'About you', 'Preferences', 'Review and confirm'];

/**
 * Stepper, TextField, TextArea, RadioGroup, NumberField and Checkbox working together.
 * Next validates the current step; a failed step is flagged in the Stepper and focus jumps to the first problem.
 * When a step changes, focus moves to its heading. Completed steps can be revisited.
 */
export const SignupFlow: Story = {
  parameters: { layout: 'padded' },
  render: () => {
    const [step, setStep] = useState(0);
    const [form, setForm] = useState<Form>(emptyForm);
    const [attempted, setAttempted] = useState<number | null>(null);
    const [done, setDone] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const focus = useStepFocus(done ? 99 : step);

    const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
    const errors = attempted === step ? validate(step, form) : {};
    const failedStep = attempted !== null && attempted === step && Object.keys(validate(step, form)).length > 0 ? step : -1;

    const steps: StepperStep[] = signupSteps.map((s, i) => ({ ...s, error: i === failedStep }));

    const next = () => {
      if (Object.keys(validate(step, form)).length > 0) {
        setAttempted(step);
        // Wait for the errors to render, then focus the first invalid field.
        requestAnimationFrame(() => formRef.current?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus());
        return;
      }
      setAttempted(null);
      setStep((s) => s + 1);
    };

    const restart = () => {
      setForm(emptyForm);
      setStep(0);
      setAttempted(null);
      setDone(false);
    };

    if (done) {
      return (
        <div className="max-w-xl font-sans text-text">
          <Stepper steps={signupSteps} currentStep={signupSteps.length} aria-label="Signup progress" />
          <div className="mt-8 flex flex-col items-start gap-3">
            <h2 {...focus} className="font-serif text-2xl font-medium outline-hidden">Account created</h2>
            <p className="text-muted">Welcome, {form.name}. We sent a confirmation to {form.email}.</p>
            <Button intent="secondary" onPress={restart}>Start over</Button>
          </div>
        </div>
      );
    }

    return (
      <div className="max-w-xl font-sans text-text">
        <Stepper
          steps={steps}
          currentStep={step}
          aria-label="Signup progress"
          onStepPress={(i) => {
            setAttempted(null);
            setStep(i);
          }}
        />

        <form
          ref={formRef}
          noValidate
          className="mt-8 flex flex-col gap-5"
          onSubmit={(event) => {
            event.preventDefault();
            if (step === signupSteps.length - 1) setDone(true);
            else next();
          }}
        >
          <h2 {...focus} className="font-serif text-2xl font-medium outline-hidden">
            {stepTitles[step]}
          </h2>

          {step === 0 && (
            <>
              <TextField label="Email" type="email" value={form.email} onChange={(v) => set('email', v)} isInvalid={Boolean(errors.email)} errorMessage={errors.email} />
              <TextField label="Password" type="password" description="At least 8 characters." value={form.password} onChange={(v) => set('password', v)} isInvalid={Boolean(errors.password)} errorMessage={errors.password} />
            </>
          )}

          {step === 1 && (
            <>
              <TextField label="Full name" value={form.name} onChange={(v) => set('name', v)} isInvalid={Boolean(errors.name)} errorMessage={errors.name} />
              <TextArea label="Short bio" description="Optional." maxLength={160} value={form.bio} onChange={(v) => set('bio', v)} />
            </>
          )}

          {step === 2 && (
            <>
              <RadioGroup label="Plan" value={form.plan} onChange={(v) => set('plan', v)}>
                <Radio value="free" description="Personal projects">Free</Radio>
                <Radio value="pro" description="For professionals">Pro</Radio>
                <Radio value="team" description="Shared workspaces">Team</Radio>
              </RadioGroup>
              {form.plan === 'team' && (
                <NumberField label="Seats" minValue={1} maxValue={50} value={form.seats} onChange={(v) => set('seats', v)} isInvalid={Boolean(errors.seats)} errorMessage={errors.seats} className="w-40" />
              )}
              <Checkbox isSelected={form.updates} onChange={(v) => set('updates', v)}>Email me product updates</Checkbox>
            </>
          )}

          {step === 3 && (
            <dl className="grid grid-cols-[8rem_1fr] gap-x-4 gap-y-2 text-sm">
              <dt className="text-muted">Email</dt><dd>{form.email}</dd>
              <dt className="text-muted">Name</dt><dd>{form.name}</dd>
              <dt className="text-muted">Bio</dt><dd>{form.bio || 'Not provided'}</dd>
              <dt className="text-muted">Plan</dt><dd className="capitalize">{form.plan}{form.plan === 'team' ? `, ${form.seats} seats` : ''}</dd>
              <dt className="text-muted">Updates</dt><dd>{form.updates ? 'Yes' : 'No'}</dd>
            </dl>
          )}

          <div className="flex gap-2 pt-2">
            {step > 0 && (
              <Button intent="secondary" onPress={() => { setAttempted(null); setStep((s) => s - 1); }}>
                Back
              </Button>
            )}
            <Button type="submit">{step === signupSteps.length - 1 ? 'Create account' : 'Next'}</Button>
          </div>
        </form>
      </div>
    );
  },
};
