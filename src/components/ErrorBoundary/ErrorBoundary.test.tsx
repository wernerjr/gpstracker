import { render, screen, fireEvent } from '@testing-library/react';
import { ErrorBoundary } from './index';

// Componente que força um erro
const ComponenteComErro = () => {
  throw new Error('Erro de teste');
  return null;
};

// Componente normal para testar renderização sem erros
const ComponenteNormal = () => <div>Conteúdo normal</div>;

describe('ErrorBoundary', () => {
  // Silencia os erros do console durante os testes
  const consoleSpy = jest.spyOn(console, 'error');
  beforeAll(() => {
    consoleSpy.mockImplementation(() => {});
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  beforeEach(() => {
    consoleSpy.mockClear();
  });

  it('deve renderizar children quando não há erros', () => {
    render(
      <ErrorBoundary>
        <ComponenteNormal />
      </ErrorBoundary>
    );

    expect(screen.getByText('Conteúdo normal')).toBeInTheDocument();
  });

  it('deve mostrar mensagem de erro quando ocorre um erro', () => {
    render(
      <ErrorBoundary>
        <ComponenteComErro />
      </ErrorBoundary>
    );

    expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
    expect(screen.getByText('Erro de teste')).toBeInTheDocument();
  });

  it('deve chamar console.error quando ocorre um erro', () => {
    render(
      <ErrorBoundary>
        <ComponenteComErro />
      </ErrorBoundary>
    );

    expect(consoleSpy).toHaveBeenCalled();
  });

  it('deve recarregar a página quando o botão "Tentar Novamente" é clicado', () => {
    const mockReload = jest.fn();
    Object.defineProperty(window, 'location', {
      value: { reload: mockReload },
      writable: true
    });

    render(
      <ErrorBoundary>
        <ComponenteComErro />
      </ErrorBoundary>
    );

    fireEvent.click(screen.getByText('Tentar Novamente'));
    expect(mockReload).toHaveBeenCalledTimes(1);
  });

  it('deve manter o estado de erro até que o componente seja remontado', () => {
    const { rerender } = render(
      <ErrorBoundary>
        <ComponenteComErro />
      </ErrorBoundary>
    );

    expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();

    rerender(
      <ErrorBoundary>
        <ComponenteNormal />
      </ErrorBoundary>
    );

    expect(screen.getByText('Ops! Algo deu errado')).toBeInTheDocument();
  });
}); 