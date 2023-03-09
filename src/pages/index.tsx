import type { NextPage } from 'next';
import Image from 'next/image';
import { Layout } from '../templates/global';

const Home: NextPage = () => {
  return (
    <Layout className="flex-col gap-4">
      <figure>
        <Image
          width={1920}
          height={1080}
          src="/images/loch-lomand-adam-at-the-shore.jpeg"
          alt="Adam next to the shore of Loch Lomand"
        />
      </figure>
      <section className="flex grow flex-col gap-2">
        <h1 className="text-3xl font-bold">Adam Turner</h1>
        <p>
          Hello! I&apos;m Adam, a Principal Software Engineer and budding
          mountaineer. Professionally, I have a keen interest in Frontend
          Development and accessibility.
        </p>
        <p>
          I will also use this blog as a logbook for my climbing and
          mountaineering adventures towards Mountain Training Association
          courses and assessments.
        </p>
      </section>
    </Layout>
  );
};

export default Home;
