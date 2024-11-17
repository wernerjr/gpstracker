import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import styled from 'styled-components';
import { TrashIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { db, LocationRecord } from '../../services/localDatabase';
import { syncLocations } from '../../services/syncService';
import { useSync } from '../../contexts/SyncContext';

export function SyncPage() {
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [unsyncedRecords, setUnsyncedRecords] = useState<LocationRecord[]>([]);
  const { updateUnsyncedCount } = useSync();

  // Carrega os registros ao montar o componente e após cada operação
  useEffect(() => {
    loadUnsyncedRecords();
    loadLastSyncTime();
  }, []);

  const loadUnsyncedRecords = async () => {
    try {
      console.log('Carregando registros não sincronizados...');
      const records = await db.getUnsynced();
      console.log('Registros encontrados:', records.length);
      setUnsyncedRecords(records);
    } catch (error) {
      console.error('Erro ao carregar registros:', error);
    }
  };

  const loadLastSyncTime = () => {
    const lastSyncTime = localStorage.getItem('lastSyncTime');
    setLastSync(lastSyncTime);
  };

  const handleSync = async () => {
    if (isSyncing) return;

    setIsSyncing(true);
    try {
      console.log('Iniciando sincronização...');
      const result = await syncLocations();
      
      if (result.success) {
        console.log(`${result.syncedCount} registros sincronizados com sucesso`);
        const now = new Date().toISOString();
        localStorage.setItem('lastSyncTime', now);
        setLastSync(now);
        
        // Recarrega a lista de registros
        await loadUnsyncedRecords();
        await updateUnsyncedCount();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error('Erro na sincronização:', error);
      alert('Erro ao sincronizar: ' + (error instanceof Error ? error.message : 'Erro desconhecido'));
    } finally {
      setIsSyncing(false);
    }
  };

  const handleDeleteUnsynced = async () => {
    if (!window.confirm('Tem certeza que deseja excluir todos os registros não sincronizados?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const records = await db.getUnsynced();
      const ids = records.map(record => record.id!);
      await db.deleteRecords(ids);
      await loadUnsyncedRecords();
      await updateUnsyncedCount();
    } catch (error) {
      console.error('Erro ao excluir registros:', error);
      alert('Erro ao excluir registros');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Title>Sincronização</Title>
          <ButtonGroup>
            <ActionButton 
              $primary
              onClick={handleSync} 
              disabled={isSyncing || unsyncedRecords.length === 0}
            >
              {isSyncing ? (
                <>
                  <ArrowPathIcon 
                    width={20} 
                    height={20} 
                    className="animate-spin" 
                  />
                  <span>Sincronizando...</span>
                </>
              ) : (
                <>
                  <ArrowPathIcon width={20} height={20} />
                  <span>Sincronizar Agora</span>
                </>
              )}
            </ActionButton>
            
            <ActionButton
              $danger
              onClick={handleDeleteUnsynced}
              disabled={isDeleting || unsyncedRecords.length === 0}
            >
              {isDeleting ? (
                'Excluindo...'
              ) : (
                <>
                  <TrashIcon width={20} height={20} />
                  <span>Excluir Registros</span>
                </>
              )}
            </ActionButton>
          </ButtonGroup>
        </Header>

        <LastSyncInfo>
          {lastSync ? (
            <>
              Última sincronização: {format(
                new Date(lastSync),
                "dd 'de' MMMM 'às' HH:mm",
                { locale: ptBR }
              )}
            </>
          ) : (
            'Nenhuma sincronização realizada'
          )}
        </LastSyncInfo>

        {unsyncedRecords.length > 0 ? (
          <RecordsList>
            {unsyncedRecords.map((record) => (
              <RecordItem key={record.id}>
                <RecordInfo>
                  <strong>Localização:</strong> 
                  {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
                </RecordInfo>
                <RecordInfo>
                  <strong>Velocidade:</strong> 
                  {record.speed.toFixed(1)} km/h
                </RecordInfo>
                <RecordInfo>
                  <strong>Data:</strong> 
                  {format(new Date(record.timestamp), "dd/MM/yyyy HH:mm:ss")}
                </RecordInfo>
              </RecordItem>
            ))}
          </RecordsList>
        ) : (
          <NoRecords>
            Não há registros pendentes de sincronização
          </NoRecords>
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

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  
  @media (max-width: 600px) {
    flex-direction: column;
    gap: 1rem;
  }
`;

const Title = styled.h1`
  margin: 0;
  color: white;
  font-size: 2rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 600px) {
    width: 100%;
    flex-direction: column;
  }
`;

const ActionButton = styled.button<{ $primary?: boolean; $danger?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  min-width: 160px;
  
  background-color: ${props => 
    props.$primary ? '#3498db' : 
    props.$danger ? '#e74c3c' : '#7f8c8d'};
  color: white;

  &:hover {
    background-color: ${props => 
      props.$primary ? '#2980b9' : 
      props.$danger ? '#c0392b' : '#95a5a6'};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const LastSyncInfo = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  background-color: rgba(52, 152, 219, 0.1);
  border-radius: 8px;
  color: #7f8c8d;
  text-align: center;
`;

const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const RecordItem = styled.div`
  background-color: #363636;
  padding: 1.5rem;
  border-radius: 8px;
  border: 1px solid rgba(52, 152, 219, 0.3);
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #3498db;
  }
`;

const RecordInfo = styled.div`
  margin-bottom: 0.5rem;
  color: #ecf0f1;
  
  &:last-child {
    margin-bottom: 0;
  }

  strong {
    color: #3498db;
    margin-right: 0.5rem;
  }
`;

const NoRecords = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  color: #7f8c8d;
  background-color: #363636;
  border-radius: 8px;
  border: 1px dashed rgba(127, 140, 141, 0.3);
`; 