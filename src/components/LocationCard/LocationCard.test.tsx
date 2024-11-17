import { render, screen } from '@testing-library/react';
import { LocationCard } from './index';

describe('LocationCard', () => {
  it('deve renderizar corretamente com coordenadas válidas', () => {
    render(
      <LocationCard
        latitude={-23.550520}
        longitude={-46.633308}
        accuracy={8.5}
      />
    );

    expect(screen.getByText(/Coordenadas/i)).toBeInTheDocument();
    expect(screen.getByText(/-23.550520, -46.633308/)).toBeInTheDocument();
    expect(screen.getByText(/8.5m \(Excelente\)/)).toBeInTheDocument();
  });

  it('deve mostrar mensagem de carregamento quando coordenadas são nulas', () => {
    render(
      <LocationCard
        latitude={null}
        longitude={null}
        accuracy={null}
      />
    );

    expect(screen.getByText(/Obtendo localização.../i)).toBeInTheDocument();
  });

  it('deve aplicar classe correta baseada na precisão', () => {
    const { rerender } = render(
      <LocationCard
        latitude={0}
        longitude={0}
        accuracy={5}
      />
    );
    
    expect(screen.getByText(/Excelente/)).toHaveClass('accuracyLow');

    rerender(
      <LocationCard
        latitude={0}
        longitude={0}
        accuracy={20}
      />
    );
    
    expect(screen.getByText(/Boa/)).toHaveClass('accuracyMedium');

    rerender(
      <LocationCard
        latitude={0}
        longitude={0}
        accuracy={50}
      />
    );
    
    expect(screen.getByText(/Inadequada/)).toHaveClass('accuracyHigh');
  });
});
