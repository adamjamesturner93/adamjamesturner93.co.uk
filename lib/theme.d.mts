export type Theme = 'system' | 'light' | 'dark';
export const themeKey: string;
export function parseTheme(value: unknown): Theme;
export function resolveTheme(value: unknown, dark: boolean): 'light' | 'dark';
export const themeBootstrap: string;
