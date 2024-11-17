import styled from 'styled-components';

export const Container = styled.div`
  padding: 2rem;
  max-width: 800px;
  margin: 0 auto;
  margin-top: 70px;
`;

export const SyncHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.5rem;
    color: #fff;
  }
`;

export const SyncButton = styled.button`
  background: #2563eb;
  color: white;s
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #1d4ed8;
  }

  &:disabled {
    background: #94a3b8;
    cursor: not-allowed;
  }
`;

export const LastSyncInfo = styled.div`
  color: #64748b;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`;

export const RecordsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

export const RecordItem = styled.div`
  padding: 1rem;
  background: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  div {
    margin-bottom: 0.5rem;

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    color: #1a1a1a;
    margin-right: 0.5rem;
  }
`;

export const NoRecords = styled.div`
  text-align: center;
  padding: 2rem;
  color: #64748b;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
`; 