import { render, screen, fireEvent } from '@testing-library/react';
import { TrackingButton } from './index';

describe('TrackingButton', () => {
  const mockStartTracking = jest.fn();
  const mockStopTracking = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o botão de iniciar quando não está rastreando', () => {
    render(
      <TrackingButton
        isTracking={false}
        onStartTracking={mockStartTracking}
        onStopTracking={mockStopTracking}
      />
    );

    const button = screen.getByRole('switch');
    expect(button).toHaveTextContent('Iniciar Rastreamento');
    expect(button).not.toHaveClass('stopping');
    expect(button).toHaveAttribute('aria-checked', 'false');
  });

  it('deve chamar onStartTracking quando clicado no estado inicial', () => {
    render(
      <TrackingButton
        isTracking={false}
        onStartTracking={mockStartTracking}
        onStopTracking={mockStopTracking}
      />
    );

    fireEvent.click(screen.getByRole('switch'));
    expect(mockStartTracking).toHaveBeenCalledTimes(1);
    expect(mockStopTracking).not.toHaveBeenCalled();
  });

  it('deve chamar onStopTracking quando clicado durante rastreamento', () => {
    render(
      <TrackingButton
        isTracking={true}
        onStartTracking={mockStartTracking}
        onStopTracking={mockStopTracking}
      />
    );

    fireEvent.click(screen.getByRole('switch'));
    expect(mockStopTracking).toHaveBeenCalledTimes(1);
    expect(mockStartTracking).not.toHaveBeenCalled();
  });
});
