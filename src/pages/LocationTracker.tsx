import { useTracking } from '../contexts/TrackingContext';
import { styles } from './LocationTracker/styles';

export function LocationTracker() {
  const { 
    isTracking, 
    startTracking, 
    stopTracking, 
    currentSpeed, 
    averageSpeed, 
    maxSpeed, 
    accuracy,
    currentLocation 
  } = useTracking();

  return (
    <div style={{
      backgroundColor: '#1a1a1a',
      minHeight: '100vh',
      color: 'white',
      padding: '20px'
    }}>
      <main style={{
        maxWidth: '800px',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'column',
        gap: '2rem'
      }}>
        <button 
          onClick={isTracking ? stopTracking : startTracking}
          style={{
            padding: '1rem 2.5rem',
            borderRadius: '50px',
            backgroundColor: isTracking ? '#e74c3c' : '#2ecc71',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.1rem',
            fontWeight: 'bold',
            transition: 'all 0.3s ease',
            margin: '0 auto'
          }}
        >
          {isTracking ? 'Parar Rastreamento' : 'Iniciar Rastreamento'}
        </button>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem'
        }}>
          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#888' }}>Velocidade Atual</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{currentSpeed?.toFixed(1) || '0'} km/h</p>
          </div>

          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#888' }}>Velocidade Média</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{averageSpeed?.toFixed(1) || '0'} km/h</p>
          </div>

          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#888' }}>Velocidade Máxima</h3>
            <p style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{maxSpeed?.toFixed(1) || '0'} km/h</p>
          </div>

          <div style={{
            backgroundColor: '#2a2a2a',
            padding: '1.5rem',
            borderRadius: '15px',
            textAlign: 'center'
          }}>
            <h3 style={{ marginBottom: '0.5rem', color: '#888' }}>Coordenadas</h3>
            <p style={{ 
              fontSize: '1.1rem', 
              fontWeight: 'bold',
              fontFamily: 'monospace',
              wordBreak: 'break-all'
            }}>
              {currentLocation 
                ? `${currentLocation.latitude.toFixed(6)},\n${currentLocation.longitude.toFixed(6)}`
                : 'Aguardando...'}
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          justifyContent: 'center',
          color: accuracy ? (accuracy > 1000 ? '#e74c3c' : '#f1c40f') : '#888'
        }}>
          <div style={{
            width: '10px',
            height: '10px',
            borderRadius: '50%',
            backgroundColor: 'currentColor'
          }} />
          <span>
            Precisão: {accuracy ? `${accuracy.toFixed(1)}m (${accuracy > 1000 ? 'Baixa' : 'Boa'})` : 'Indisponível'}
          </span>
        </div>
      </main>
    </div>
  );
} 