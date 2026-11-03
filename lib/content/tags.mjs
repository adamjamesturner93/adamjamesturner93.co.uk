export const tagRegistry = Object.freeze({
  'performance-management': Object.freeze({
    label: 'Performance Management',
    tone: 'cobalt',
  }),
  'people-development': Object.freeze({
    label: 'People Development',
    tone: 'turquoise',
  }),
  feedback: Object.freeze({ label: 'Feedback', tone: 'coral' }),
  'organisational-culture': Object.freeze({
    label: 'Organisational Culture',
    tone: 'cobalt',
  }),
  leadership: Object.freeze({ label: 'Leadership', tone: 'cobalt' }),
  communication: Object.freeze({ label: 'Communication', tone: 'coral' }),
  'technology-strategy': Object.freeze({
    label: 'Technology Strategy',
    tone: 'turquoise',
  }),
  'change-management': Object.freeze({
    label: 'Change Management',
    tone: 'coral',
  }),
  'risk-management': Object.freeze({
    label: 'Risk Management',
    tone: 'cobalt',
  }),
  'stakeholder-management': Object.freeze({
    label: 'Stakeholder Management',
    tone: 'turquoise',
  }),
  'data-migration': Object.freeze({
    label: 'Data Migration',
    tone: 'turquoise',
  }),
  'engineering-practices': Object.freeze({
    label: 'Engineering Practices',
    tone: 'cobalt',
  }),
});
export function validateTags(value = []) {
  if (!Array.isArray(value) || value.length > 5)
    throw new Error('tags must be an array of at most five identifiers');
  for (const tag of value)
    if (
      typeof tag !== 'string' ||
      !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(tag) ||
      !Object.hasOwn(tagRegistry, tag)
    )
      throw new Error(`Unknown or invalid tag identifier: ${String(tag)}`);
  if (new Set(value).size !== value.length)
    throw new Error('tags contains duplicate identifiers');
  return [...value];
}
