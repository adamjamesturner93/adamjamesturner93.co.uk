import Link from 'next/link';

export function Footer() {
  return (
    <footer className="flex justify-center flex-col bg-zinc-700 text-center text-zinc-50 py-4 px-8">
      {/* <nav aria-label="Footer navigation">
        <ul>
          <li>
            <Link href="#">Terms</Link>
          </li>
        </ul>
      </nav> */}
      <p>&copy;{new Date().getFullYear()} Adam Turner</p>
    </footer>
  );
}
