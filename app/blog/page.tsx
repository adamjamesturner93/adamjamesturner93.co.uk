import List from '../list';
import { articles } from '../../lib/content';
export const metadata = {
  title: 'Blog — Ideas, lessons & hard questions',
  description:
    'Thoughts on engineering, leadership, technology strategy and the challenges that do not have straightforward answers.',
  alternates: { canonical: '/blog' },
};
export default function Blog() {
  return (
    <div className="shell section-space">
      <section className="page-intro">
        <p className="eyebrow">The blog</p>
        <h1>
          Ideas, lessons and the occasional{' '}
          <span className="text-blue">hard question.</span>
        </h1>
        <p className="intro">
          Thoughts on engineering, leadership, technology strategy and the
          challenges that don’t always have straightforward answers.
        </p>
        <span className="intro-doodle" aria-hidden="true">
          ✳
        </span>
      </section>
      <List items={articles()} eager />
    </div>
  );
}
