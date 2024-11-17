// Definições de módulos CSS
declare module '*.module.css' {
  const classes: { [key: string]: string };
  export default classes;
}

// Definições UUID
declare module 'uuid' {
    export function v4(): string;
    export function v4(options: any): string;
    export function v4(options: any, buffer: any, offset?: number): any;
} 