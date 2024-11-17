import { useTracking } from '../../contexts/TrackingContext';
import styled from 'styled-components';
import { 
  BoltIcon, 
  ChartBarIcon, 
  SparklesIcon, 
  SignalIcon, 
  MapPinIcon,
  PlayIcon, 
  StopIcon 
} from '@heroicons/react/24/solid';

export function LocationTracker() {
  const {
    currentLocation,
    currentSpeed,
    averageSpeed,
    maxSpeed,
    accuracy,
    isTracking,
    startTracking,
    stopTracking,
  } = useTracking();

  return (
    <PageContainer>
      <ContentWrapper>
        <ActionButton
          onClick={isTracking ? stopTracking : startTracking}
          $isTracking={isTracking}
        >
          {isTracking ? (
            <>
              <StopIcon width={20} height={20} />
              <span>Parar Rastreamento</span>
            </>
          ) : (
            <>
              <PlayIcon width={20} height={20} />
              <span>Iniciar Rastreamento</span>
            </>
          )}
        </ActionButton>

        <GridContainer>
          <MetricCard $type="current">
            <MetricHeader>
              <BoltIcon width={20} height={20} color="#3498db" />
              <MetricTitle>Atual</MetricTitle>
            </MetricHeader>
            <MetricValue>{currentSpeed ? currentSpeed.toFixed(1) : '0'}</MetricValue>
            <MetricUnit>km/h</MetricUnit>
          </MetricCard>

          <MetricCard $type="average">
            <MetricHeader>
              <ChartBarIcon width={20} height={20} color="#2ecc71" />
              <MetricTitle>Média</MetricTitle>
            </MetricHeader>
            <MetricValue>{averageSpeed ? averageSpeed.toFixed(1) : '0'}</MetricValue>
            <MetricUnit>km/h</MetricUnit>
          </MetricCard>

          <MetricCard $type="max">
            <MetricHeader>
              <SparklesIcon width={20} height={20} color="#e74c3c" />
              <MetricTitle>Máxima</MetricTitle>
            </MetricHeader>
            <MetricValue>{maxSpeed ? maxSpeed.toFixed(1) : '0'}</MetricValue>
            <MetricUnit>km/h</MetricUnit>
          </MetricCard>

          <MetricCard $type="accuracy">
            <MetricHeader>
              <SignalIcon width={20} height={20} color="#e74c3c" />
              <MetricTitle>Precisão</MetricTitle>
            </MetricHeader>
            <MetricValue>
              {accuracy ? (accuracy > 1000 ? 'Baixa' : 'Boa') : 'N/A'}
            </MetricValue>
            <MetricUnit>{accuracy ? `${accuracy.toFixed(1)}m` : ''}</MetricUnit>
          </MetricCard>
        </GridContainer>

        {currentLocation && (
          <MetricCard $type="coordinates">
            <MetricHeader>
              <MapPinIcon width={20} height={20} color="#9b59b6" />
              <MetricTitle>Coordenadas</MetricTitle>
            </MetricHeader>
            <CoordinatesValue>
              {currentLocation.latitude.toFixed(6)}, {currentLocation.longitude.toFixed(6)}
            </CoordinatesValue>
            <MetricUnit>lat, long</MetricUnit>
          </MetricCard>
        )}
      </ContentWrapper>
    </PageContainer>
  );
}

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  padding: 2rem 1rem;
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
  background-color: #2d2d2d;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1rem;
`;

const getCardColor = (type: string) => {
  switch (type) {
    case 'current': return '#3498db';
    case 'average': return '#2ecc71';
    case 'max': return '#e74c3c';
    case 'accuracy': return '#e74c3c';
    case 'coordinates': return '#9b59b6';
    default: return '#95a5a6';
  }
};

const MetricCard = styled.div<{ $type: string }>`
  background-color: #363636;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid ${props => getCardColor(props.$type)};
  text-align: center;
  margin-top: ${props => props.$type === 'coordinates' ? '1rem' : '0'};
  grid-column: ${props => props.$type === 'coordinates' ? '1 / -1' : 'auto'};
`;

const ActionButton = styled.button<{ $isTracking: boolean }>`
  width: 100%;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 2rem;
  background-color: ${props => props.$isTracking ? '#e74c3c' : '#2ecc71'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    background-color: ${props => props.$isTracking ? '#c0392b' : '#27ae60'};
  }
`;

const MetricHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const MetricTitle = styled.span`
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const MetricValue = styled.div`
  color: white;
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
`;

const MetricUnit = styled.div`
  color: #7f8c8d;
  font-size: 0.8rem;
`;

const CoordinatesValue = styled.div`
  color: white;
  font-size: 1.2rem;
  font-weight: 500;
  margin: 0.5rem 0;
  word-break: break-all;
`; 