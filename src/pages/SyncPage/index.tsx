import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { 
  Container, 
  SyncHeader, 
  SyncButton, 
  LastSyncInfo,
  RecordsList,
  RecordItem,
  NoRecords 
} from './styles';

interface LocationRecord {
  id: string;
  latitude: number;
  longitude: number;
  timestamp: string;
  synced: boolean;
}

export function SyncPage() {
  const [unsyncedRecords, setUnsyncedRecords] = useState<LocationRecord[]>([]);
  const [lastSync, setLastSync] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    loadUnsyncedRecords();
    loadLastSyncTime();
  }, []);

  const loadUnsyncedRecords = async () => {
    // Carregar do localStorage
    const records = JSON.parse(localStorage.getItem('locationRecords') || '[]');
    const unsynced = records.filter((record: LocationRecord) => !record.synced);
    setUnsyncedRecords(unsynced);
  };

  const loadLastSyncTime = () => {
    const lastSyncTime = localStorage.getItem('lastSyncTime');
    setLastSync(lastSyncTime);
  };

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      // Aqui vai sua lógica de sincronização
      // Após sincronizar com sucesso:
      const now = new Date().toISOString();
      localStorage.setItem('lastSyncTime', now);
      setLastSync(now);
      await loadUnsyncedRecords();
    } catch (error) {
      console.error('Erro na sincronização:', error);
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <Container>
      <SyncHeader>
        <h1>Sincronização</h1>
        <SyncButton 
          onClick={handleSync} 
          disabled={isSyncing || unsyncedRecords.length === 0}
        >
          {isSyncing ? 'Sincronizando...' : 'Sincronizar Agora'}
        </SyncButton>
      </SyncHeader>

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
              <div>
                <strong>Localização:</strong> 
                {record.latitude.toFixed(6)}, {record.longitude.toFixed(6)}
              </div>
              <div>
                <strong>Data:</strong> 
                {format(new Date(record.timestamp), "dd/MM/yyyy HH:mm")}
              </div>
            </RecordItem>
          ))}
        </RecordsList>
      ) : (
        <NoRecords>
          Não há registros pendentes de sincronização
        </NoRecords>
      )}
    </Container>
  );
} 