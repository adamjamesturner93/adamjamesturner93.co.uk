import clsx from 'clsx';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Header() {
  const activeRoute = useRouter().route;

  const isHomeActive = activeRoute === '/';
  const isProjectsActive = activeRoute === '/projects';
  const isMountaineeringActive = activeRoute === '/mountaineering';

  return (
    <header className="bg-zinc-700">
      <nav
        aria-label="Main navigation"
        className="py-4 px-8 flex flex-col md:flex-row md:justify-between text-center text-zinc-50"
      >
        <Link className="font-bold text-2xl" href="/">
          Adam Turner
        </Link>

        <ul className="flex gap-2 justify-center md:justify-end">
          <li
            className={clsx('underline px-2 py-1', {
              'text-zinc-700 bg-zinc-100': isHomeActive
            })}
          >
            <Link href="/" aria-current={isHomeActive ? 'page' : undefined}>
              Me
            </Link>
          </li>
          <li
            className={clsx('underline px-2 py-1', {
              'text-zinc-700 bg-zinc-100': isMountaineeringActive
            })}
          >
            <Link
              href="/mountaineering"
              aria-current={isMountaineeringActive ? 'page' : undefined}
            >
              Mountaineering
            </Link>
          </li>
          <li
            className={clsx('underline px-2 py-1', {
              'text-zinc-700 bg-zinc-100': isProjectsActive
            })}
          >
            <Link
              href="/projects"
              aria-current={isProjectsActive ? 'page' : undefined}
            >
              Projects
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
