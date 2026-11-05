import { pageMetadata } from '../../lib/page-metadata';
import ContentLink from '../../components/content-link';
import Link from 'next/link';
import { site } from '../../lib/site.mjs';
import PersonalImage from '../../components/personal-image';
export const metadata = {
  ...pageMetadata(
    'About Adam Turner | Engineering Leader & Writer',
    'Meet Adam Turner, a Senior Software Engineering Manager writing about the business, people and decisions behind effective engineering leadership.',
    '/about',
  ),
  title: { absolute: 'About Adam Turner | Engineering Leader & Writer' },
};
export default function About() {
  return (
    <>
      <section className="shell about-hero">
        <div>
          <p className="eyebrow">Hello, I’m Adam</p>
          <h1>
            I like solving difficult problems.{' '}
            <span className="text-blue">
              I like helping people solve them even more.
            </span>
          </h1>
          <div className="intro about-introduction">
            <p>
              I’m Adam, a Senior Software Engineering Manager working in
              financial services.
            </p>
            <p>
              Over the years, I’ve become increasingly interested in the parts
              of engineering leadership that happen outside the codebase.
            </p>
            <p>
              The technology matters, of course. But so do the people building
              it, the decisions we make, the risks we’re prepared to take and
              the business we’re ultimately trying to support.
            </p>
          </div>
        </div>
        <div className="about-art portrait-art">
          <PersonalImage
            variant="portrait"
            caption="A moment by the shore of Loch Lomond."
            eager
          />
          <span className="about-sticker">
            Always
            <br />
            learning. ↗
          </span>
        </div>
      </section>
      <nav className="shell about-jumps" aria-label="About sections">
        <ContentLink href="#the-work">The work</ContentLink>
        <ContentLink href="#the-people">The people</ContentLink>
        <ContentLink href="#still-learning">Still learning</ContentLink>
      </nav>
      <section className="shell about-sections">
        <div className="about-label">
          <span className="eyebrow">01 / The work</span>
          <h2 id="the-work">Complicated technology. Real-world challenges.</h2>
          <PersonalImage
            variant="landscape"
            caption="A different kind of challenge: a snowy day outdoors."
          />
        </div>
        <div className="about-copy">
          <p>
            I’ve had the opportunity to lead teams through complex deliveries
            and technology change. Some of my most valuable lessons have come
            from situations where the technically right answer wasn’t
            necessarily the whole answer.
          </p>
          <p>
            Modernising technology sounds relatively straightforward when you’re
            talking about the destination. Getting there is another matter.
          </p>
          <p>
            You have existing systems that the business depends on, competing
            priorities, operational risks, dependencies between teams and
            decisions that can have consequences well beyond engineering.
          </p>
          <p>That’s the part I find fascinating.</p>
          <p>
            I enjoy working through those challenges, understanding how
            everything connects and finding practical ways to move forward.
            Sometimes that involves improving technology or engineering
            practices. Other times it’s about changing an approach, bringing
            different people together or asking whether we’re solving the right
            problem in the first place.
          </p>
          <p>
            That’s what I enjoy exploring here: the business behind engineering
            leadership, the challenges of leading people and what it means to
            become a more rounded leader.
          </p>
        </div>
        <div className="about-label">
          <span className="eyebrow">02 / The people</span>
          <h2 id="the-people">
            Helping people grow is one of the best parts of the job.
          </h2>
        </div>
        <div className="about-copy">
          <p>
            One of the things I’ve enjoyed most about engineering leadership is
            helping other people develop.
          </p>
          <p>
            I’ve supported colleagues as they’ve progressed into senior
            engineering, technical leadership and management roles. Seeing
            someone grow in confidence, take on new challenges and develop their
            own approach to leadership is genuinely rewarding.
          </p>
          <p>
            I’ve also learned how much engineering success depends on
            relationships outside your immediate team.
          </p>
          <p>
            Some of the hardest challenges I’ve faced have involved navigating
            competing priorities, building trust with other departments and
            finding ways to deliver when the people you depend on have their own
            pressures and objectives.
          </p>
          <p>Those experiences have changed how I think about leadership.</p>
          <p>
            It’s not just about setting direction for your own team. It’s about
            understanding the wider organisation, listening to different
            perspectives and helping people work towards something together.
          </p>
          <p>
            I find that side of leadership every bit as interesting as the
            technology itself.
          </p>
        </div>
      </section>
      <section className="learning-band" id="still-learning">
        <div className="shell personal-grid">
          <div>
            <p className="eyebrow">03 / Still learning</p>
            <h2>
              The more I learn,{' '}
              <span className="text-blue">the bigger the questions get.</span>
            </h2>
          </div>
          <div>
            <p>
              I’m currently undertaking a Level 7 Senior Leader Apprenticeship
              with Henley Business School.
            </p>
            <p>
              It’s been a great opportunity to challenge how I think about
              leadership and explore subjects beyond my engineering background,
              particularly business strategy, innovation, responsible leadership
              and organisational change.
            </p>
            <p>
              It’s also made me increasingly curious about the bigger decisions
              engineering leaders face.
            </p>
            <p>
              How should we decide where to invest our engineering capacity? How
              do we build organisations that can deliver today while preparing
              for tomorrow? How do we balance technology change with business
              risk, financial constraints and the needs of our people?
            </p>
            <p>
              They’re questions I’m exploring as I continue to develop as a
              leader. I certainly don’t pretend to have all the answers.
            </p>
            <p>That’s partly why I started this blog.</p>
            <p>
              I wanted somewhere to share my thoughts, reflect on experiences,
              challenge my own assumptions and explore interesting ideas with
              other people.
            </p>
            <p>
              Some articles will be about things I’ve learned through
              experience. Others will be questions I’m still trying to answer.
            </p>
            <p>
              Hopefully, they’ll also start a few interesting conversations.
            </p>
            <ContentLink
              className="button button-ink"
              href={site.linkedin}
              data-analytics-event="linkedin_connect_click"
              data-placement="about"
            >
              Let’s connect on LinkedIn <span aria-hidden="true">↗</span>
            </ContentLink>
          </div>
        </div>
      </section>
      <section className="shell about-end">
        <div>
          <h2>Interested in what I’m thinking about?</h2>
          <p>
            Take a look at the blog for my latest reflections on people,
            business strategy and the decisions behind engineering leadership.
          </p>
        </div>
        <Link className="button" href="/blog">
          Explore the blog <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </>
  );
}
