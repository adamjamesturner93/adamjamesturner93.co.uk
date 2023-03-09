import clsx from 'clsx';
import { Footer, Header } from '../components';

export function Layout({
  children,
  className
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <>
      <a
        href="#main"
        className="absolute bg-zinc-50 px-4 py-2 -translate-y-full transition-transform focus:translate-y-0"
      >
        Skip to Content
      </a>
      <Header />
      <main
        id="main"
        className={clsx(
          'flex grow lg:px-24 xl:px-48 bg-zinc-50 text-zinc-800 py-4 px-8',
          className
        )}
      >
        {children}
      </main>
      <Footer />
    </>
  );
}
