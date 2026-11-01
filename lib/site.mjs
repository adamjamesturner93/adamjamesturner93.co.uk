export const site = Object.freeze({
  name: 'Adam Turner',
  origin: 'https://adamjamesturner93.co.uk',
  linkedin: 'https://www.linkedin.com/in/adamjturner93/',
  description:
    'Engineering leadership, technology strategy and the interesting problems that rarely stop at the code.',
});
export function policy(env = process.env) {
  const local = !env.VERCEL_ENV && env.NODE_ENV === 'development';
  const preview = env.VERCEL_ENV === 'preview';
  return {
    drafts: local || (preview && env.ENABLE_DRAFTS === 'true'),
    index: env.VERCEL_ENV
      ? env.VERCEL_ENV === 'production'
      : env.NODE_ENV === 'production',
  };
}
