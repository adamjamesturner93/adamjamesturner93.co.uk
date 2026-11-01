export const consentKey: string;
export function parseConsent(value: unknown): 'accepted' | 'rejected' | null;
export function analyticsId(env?: NodeJS.ProcessEnv): string | null;

export function analyticsDemo(env?: NodeJS.ProcessEnv): boolean;
