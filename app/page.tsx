import { pageMetadata } from '../lib/page-metadata';
import Link from 'next/link';
import Image from 'next/image';
import List from './list';
import { articles } from '../lib/content';
import PersonalImage from '../components/personal-image';
export const metadata = {
  ...pageMetadata(
    'Adam Turner | Engineering Leadership Beyond the Code',
    'Thoughts on engineering leadership beyond the code: people, business strategy, technology decisions and what it takes to lead teams through change.',
    '/',
  ),
  title: { absolute: 'Adam Turner | Engineering Leadership Beyond the Code' },
};
export default function Home() {
  return (
    <>
      <section className="home-hero shell">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="accent-dot" />
            Engineering / Leadership / Ideas
          </p>
          <h1>
            Engineering leadership{' '}
            <span className="text-blue">beyond the code.</span>
          </h1>
          <div className="hero-intro">
            <p>
              I’m Adam, a Senior Software Engineering Manager. I write about the
              people, business decisions and challenges behind leading
              technology teams, drawing on my experiences of what works, what
              doesn’t and what I’ve learned along the way.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="button" href="/blog">
              Read my writing <span aria-hidden="true">↗</span>
            </Link>
            <Link className="text-link" href="/about">
              More about me <span aria-hidden="true">→</span>
            </Link>
          </div>
        </div>
        <div className="hero-art">
          <Image
            src="/images/hero.svg"
            alt=""
            width={760}
            height={740}
            loading="eager"
            fetchPriority="high"
          />
          <div className="art-caption">
            <span>Technology / People / Change</span>
            <span aria-hidden="true">↗</span>
          </div>
        </div>
      </section>
      <section className="latest shell section-space">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Thinking out loud</p>
            <h2>A few things I’ve been thinking about.</h2>
          </div>
          <Link className="text-link" href="/blog">
            All articles <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <p className="section-description">
          From developing people to making commercial judgements, engineering
          leadership comes with plenty of questions. These are the experiences
          and decisions that make me stop and think.
        </p>
        <List items={articles().slice(0, 3)} />
      </section>
      <section className="personal-band">
        <div className="shell personal-grid">
          <div>
            <p className="eyebrow">A little about me</p>
            <h2>
              I enjoy a good engineering challenge.{' '}
              <span>Especially when people are involved.</span>
            </h2>
            <PersonalImage
              variant="landscape"
              caption="Away from the screen, out in the snow."
            />
          </div>
          <div>
            <p>
              I lead engineering teams and deliver technology change in complex
              environments. The most rewarding parts often involve people:
              helping someone grow, bringing teams together and finding a
              practical way through a difficult problem.
            </p>
            <p>
              I’m increasingly interested in the bigger questions too: how we
              organise engineering, where we invest, and how technology creates
              value. There’s always something new to figure out.
            </p>
            <Link className="text-link" href="/about">
              A bit more about me <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
