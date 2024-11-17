import { render, screen, fireEvent, act } from '@testing-library/react';
import { useToast } from '../../hooks/useToast';
import UpdateButton from './index';

// Mock do useToast
jest.mock('../../hooks/useToast', () => ({
  useToast: jest.fn()
}));

describe('UpdateButton', () => {
  const mockShowToast = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useToast as jest.Mock).mockReturnValue({ showToast: mockShowToast });
  });

  it('deve renderizar o botão corretamente', () => {
    render(<UpdateButton />);
    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button).not.toBeDisabled();
  });

  it('deve desabilitar o botão durante a atualização', async () => {
    // Mock do Service Worker
    const mockRegistration = {
      update: jest.fn().mockResolvedValue(undefined)
    };
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue(mockRegistration)
      },
      configurable: true
    });

    render(<UpdateButton />);
    const button = screen.getByRole('button');
    
    await act(async () => {
      fireEvent.click(button);
    });

    expect(button).toBeDisabled();
    expect(button.querySelector('svg')).toHaveClass('spinning');

    // Aguarda o timeout de 1 segundo
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 1000));
    });

    expect(button).not.toBeDisabled();
    expect(button.querySelector('svg')).not.toHaveClass('spinning');
  });

  it('deve mostrar mensagem de sucesso após atualização', async () => {
    const mockRegistration = {
      update: jest.fn().mockResolvedValue(undefined)
    };
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue(mockRegistration)
      },
      configurable: true
    });

    render(<UpdateButton />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      'Aplicativo atualizado com sucesso!',
      'success'
    );
  });

  it('deve mostrar mensagem de erro quando Service Worker não é suportado', async () => {
    // Remove suporte ao Service Worker
    const originalNavigator = window.navigator;
    
    Object.defineProperty(window, 'navigator', {
      value: {
        ...originalNavigator,
        serviceWorker: null
      },
      configurable: true,
      writable: true
    });

    render(<UpdateButton />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      'Erro ao atualizar: Service Worker não é suportado',
      'error'
    );

    // Restaura o navigator original
    Object.defineProperty(window, 'navigator', {
      value: originalNavigator,
      configurable: true,
      writable: true
    });
  });

  it('deve mostrar mensagem de erro quando a atualização falha', async () => {
    const mockError = new Error('Falha na atualização');
    const mockRegistration = {
      update: jest.fn().mockRejectedValue(mockError)
    };
    
    Object.defineProperty(navigator, 'serviceWorker', {
      value: {
        register: jest.fn().mockResolvedValue(mockRegistration)
      },
      configurable: true
    });

    render(<UpdateButton />);
    
    await act(async () => {
      fireEvent.click(screen.getByRole('button'));
    });

    expect(mockShowToast).toHaveBeenCalledWith(
      'Erro ao atualizar: Falha na atualização',
      'error'
    );
  });
}); 