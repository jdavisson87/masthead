import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { axe } from 'vitest-axe';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './Card';

describe('Card', () => {
  it('renders its composed parts', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>$12,400</CardContent>
        <CardFooter>Updated today</CardFooter>
      </Card>,
    );
    expect(screen.getByText('Last 30 days')).toBeInTheDocument();
    expect(screen.getByText('$12,400')).toBeInTheDocument();
    expect(screen.getByText('Updated today')).toBeInTheDocument();
  });

  it('renders the title as an h3 by default', () => {
    render(<CardTitle>Revenue</CardTitle>);
    expect(screen.getByRole('heading', { level: 3, name: 'Revenue' })).toBeInTheDocument();
  });

  it('lets the heading level be chosen', () => {
    render(<CardTitle level={2}>Revenue</CardTitle>);
    expect(screen.getByRole('heading', { level: 2, name: 'Revenue' })).toBeInTheDocument();
  });

  it('merges a custom className and passes through attributes', () => {
    render(
      <Card className="custom-class" data-testid="card">
        Body
      </Card>,
    );
    expect(screen.getByTestId('card')).toHaveClass('custom-class');
  });

  it('can be labelled by its title for screen readers', () => {
    render(
      <Card role="region" aria-labelledby="rev-title">
        <CardHeader>
          <CardTitle id="rev-title">Revenue</CardTitle>
        </CardHeader>
      </Card>,
    );
    expect(screen.getByRole('region', { name: 'Revenue' })).toBeInTheDocument();
  });

  it('has no axe violations', async () => {
    const { container } = render(
      <Card>
        <CardHeader>
          <CardTitle>Revenue</CardTitle>
          <CardDescription>Last 30 days</CardDescription>
        </CardHeader>
        <CardContent>$12,400</CardContent>
        <CardFooter>Updated today</CardFooter>
      </Card>,
    );
    const results = await axe(container);
    expect(results.violations).toEqual([]);
  });
});
