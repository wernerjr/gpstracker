import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    mode?: 'light' | 'dark';
    // ... outras propriedades do seu tema
  }
} 