import Link from 'next/link';
export default function NotFound() {
  return (
    <section className="shell page-intro not-found">
      <p className="eyebrow">404 / A path less travelled</p>
      <h1>
        This one’s a<br />
        <span className="text-blue">dead end.</span>
      </h1>
      <p className="intro">
        That page isn’t available. There are other ideas to explore.
      </p>
      <Link className="button" href="/blog">
        Back to the blog ↗
      </Link>
    </section>
  );
}
