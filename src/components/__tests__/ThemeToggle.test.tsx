import { describe, it, expect } from 'vitest';
import { render } from '@/test/utils';
import { ThemeToggle } from '../ThemeToggle';

describe('ThemeToggle Component', () => {
  it('renders theme toggle button', () => {
    render(<ThemeToggle />);
    const button = document.querySelector('button');
    expect(button).toBeInTheDocument();
  });

  it('has accessible role', () => {
    const { container } = render(<ThemeToggle />);
    const button = container.querySelector('button');
    expect(button).toBeInTheDocument();
  });
});
