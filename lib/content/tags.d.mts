export type TagId =
  | 'performance-management'
  | 'people-development'
  | 'feedback'
  | 'organisational-culture'
  | 'leadership'
  | 'communication'
  | 'technology-strategy'
  | 'change-management'
  | 'risk-management'
  | 'stakeholder-management'
  | 'data-migration'
  | 'engineering-practices';
export const tagRegistry: Readonly<
  Record<
    TagId,
    Readonly<{ label: string; tone: 'cobalt' | 'coral' | 'turquoise' }>
  >
>;
export function validateTags(value?: unknown): TagId[];
