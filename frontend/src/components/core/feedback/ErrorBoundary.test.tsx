import { render, screen } from '@testing-library/react';
import ErrorBoundary from './ErrorBoundary';
import { reportClientError } from '../../../utils/errorReporting';

vi.mock('../../../utils/errorReporting', () => ({ reportClientError: vi.fn() }));

const Broken = () => {
  throw new Error('render failed');
};

describe('ErrorBoundary', () => {
  it('shows a reload hint and reports the render error', () => {
    vi.spyOn(console, 'error').mockImplementation(() => undefined);

    render(
      <ErrorBoundary>
        <Broken />
      </ErrorBoundary>
    );

    expect(screen.getByText(/Da ist etwas schiefgelaufen/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Neu laden' })).toBeInTheDocument();
    expect(reportClientError).toHaveBeenCalledWith(
      expect.objectContaining({ kind: 'render_error', message: 'render failed' })
    );
  });

  it('renders its children when nothing fails', () => {
    render(
      <ErrorBoundary>
        <p>alles gut</p>
      </ErrorBoundary>
    );

    expect(screen.getByText('alles gut')).toBeInTheDocument();
  });
});
