import React, { Component, ErrorInfo, ReactNode } from 'react';
import styles from './styles.module.css';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Logging do erro
    console.error('Error Boundary capturou um erro:', error, errorInfo);
    
    // Enviar para serviço de monitoramento
    this.logErrorToService(error, errorInfo);
    
    this.setState({
      hasError: true,
      error,
      errorInfo
    });
  }

  private logErrorToService(error: Error, errorInfo: ErrorInfo) {
    // Implementar integração com serviço de monitoramento
    // Ex: Sentry, LogRocket, etc
  }

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className={styles.errorContainer}>
          <h2>Ops! Algo deu errado</h2>
          <p>{this.state.error?.message}</p>
          <button 
            onClick={this.handleReload}
            className={styles.reloadButton}
          >
            Tentar Novamente
          </button>
        </div>
      );
    }

    return this.props.children;
  }
} 