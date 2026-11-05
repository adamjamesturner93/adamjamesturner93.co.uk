import { pageMetadata } from '../lib/page-metadata';
import { site } from '../lib/site.mjs';
import Link from 'next/link';
import Image from 'next/image';
import List from './list';
import { articles } from '../lib/content';
import PersonalImage from '../components/personal-image';
export const metadata = pageMetadata(
  'Adam Turner — Engineering, leadership & ideas',
  site.description,
  '/',
);
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
            The interesting problems rarely stop at{' '}
            <span className="text-blue">the code.</span>
          </h1>
          <div className="hero-intro">
            <p>
              Hi, I’m Adam. I’m a software engineering leader in financial
              services, working on everything from modernising established
              technology to bringing teams together to deliver complex change.
            </p>
            <p>
              I enjoy solving difficult problems, helping people grow and
              figuring out how we can do things better. This is where I share
              some of the ideas, experiences and lessons I’m picking up along
              the way.
            </p>
          </div>
          <div className="hero-actions">
            <Link className="button" href="/blog">
              Explore the blog <span aria-hidden="true">↗</span>
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
          Engineering leadership comes with plenty of interesting questions, and
          not many straightforward answers. I write about the challenges,
          decisions and ideas that make me stop and think.
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
