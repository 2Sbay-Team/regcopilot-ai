import { describe, it, expect, vi } from 'vitest';
import { render } from '@/test/utils';
import userEvent from '@testing-library/user-event';
import { Button } from '../button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    const button = document.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  it('handles click events', async () => {
    const handleClick = vi.fn();
    const user = userEvent.setup();
    
    render(<Button onClick={handleClick}>Click me</Button>);
    const button = document.querySelector('button');
    if (button) await user.click(button);
    
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('can be disabled', () => {
    render(<Button disabled>Disabled</Button>);
    const button = document.querySelector('button');
    expect(button).toBeDisabled();
  });

  it('applies variant styles', () => {
    const { rerender } = render(<Button variant="default">Default</Button>);
    const button = document.querySelector('button');
    expect(button).toHaveClass('bg-primary');
    
    rerender(<Button variant="destructive">Destructive</Button>);
    expect(button).toHaveClass('bg-destructive');
  });
});
