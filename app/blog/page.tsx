import { pageMetadata } from '../../lib/page-metadata';
import List from '../list';
import { articles } from '../../lib/content';
export const metadata = pageMetadata(
  'Blog — Ideas, lessons & hard questions',
  'Personal reflections on engineering leadership, business strategy, people, culture and the decisions that shape how technology teams work.',
  '/blog',
);
export default function Blog() {
  return (
    <div className="shell section-space">
      <section className="page-intro">
        <p className="eyebrow">The blog</p>
        <h1>
          Ideas, lessons &amp;{' '}
          <span className="text-blue">hard questions.</span>
        </h1>
        <p className="intro">
          I write about the business behind engineering leadership: people,
          culture, strategy and the decisions that shape how technology teams
          work. Some articles share lessons from experience, others explore
          questions I’m still working through.
        </p>
        <p className="intro">
          The common thread is how we become better leaders, not just better
          engineers.
        </p>
        <span className="intro-doodle" aria-hidden="true">
          ✳
        </span>
      </section>
      <List items={articles()} eager />
    </div>
  );
}
