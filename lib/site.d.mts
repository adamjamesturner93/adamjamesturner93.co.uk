export const site: Readonly<{
  name: string;
  origin: string;
  linkedin: string;
  description: string;
}>;
export function policy(env?: NodeJS.ProcessEnv): {
  drafts: boolean;
  index: boolean;
};
