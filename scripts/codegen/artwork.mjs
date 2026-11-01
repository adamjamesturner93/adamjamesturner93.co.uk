const colours = {
  ink: '#18243B',
  blue: '#4255F4',
  coral: '#FF735C',
  teal: '#16B8AE',
  paper: '#FAFAF7',
  lilac: '#E9E8FF',
  mint: '#D4FAF4',
};
export function artwork(slug, variant) {
  let hash = 0;
  for (const c of slug) hash = (Math.imul(hash, 31) + c.charCodeAt(0)) >>> 0;
  const v = variant ?? hash % 6;
  const c = colours;
  const scenes = [
    `<rect width="960" height="540" fill="${c.lilac}"/><path d="M-60 400C150 400 180 100 390 100S640 440 1020 180" fill="none" stroke="${c.blue}" stroke-width="100"/><path d="M-40 100C250 100 370 470 570 380S780 50 1000 80" fill="none" stroke="${c.coral}" stroke-width="60"/><circle cx="384" cy="265" r="90" fill="${c.teal}"/><circle cx="760" cy="380" r="64" fill="${c.ink}"/><circle cx="384" cy="265" r="25" fill="${c.paper}"/><path d="M100 55v55m-27-27h55M850 100v55m-27-27h55" stroke="${c.ink}" stroke-width="5"/>`,
    `<rect width="960" height="540" fill="${c.mint}"/><g transform="translate(470 275)"><path d="M-330 75L-40-100 330 75 40 250Z" fill="${c.ink}"/><path d="M-330-5L-40-180 330-5 40 170Z" fill="${c.blue}"/><path d="M-330-85L-40-260 330-85 40 90Z" fill="${c.lilac}"/><path d="M-40-260V-100L100-17V-177Z" fill="${c.coral}"/><path d="M100-177L240-94 100-10-40-93Z" fill="${c.teal}"/></g><circle cx="800" cy="100" r="40" fill="${c.coral}"/>`,
    `<rect width="960" height="540" fill="${c.blue}"/><g stroke="${c.lilac}" stroke-width="3" opacity=".4"><path d="M140 0v540M320 0v540M500 0v540M680 0v540M860 0v540M0 90h960M0 270h960M0 450h960"/></g><path d="M-50 370H320Q410 370 410 280V240Q410 150 500 150H820" fill="none" stroke="${c.teal}" stroke-width="110"/><path d="M690 55L860 150 690 245Z" fill="${c.coral}"/><rect x="300" y="95" width="65" height="350" rx="32" fill="${c.paper}"/><rect x="545" y="260" width="65" height="185" rx="32" fill="${c.lilac}"/><circle cx="142" cy="370" r="23" fill="${c.ink}"/>`,
    `<rect width="960" height="540" fill="${c.coral}"/><circle cx="480" cy="270" r="215" fill="${c.paper}"/><path d="M480 55A215 215 0 0 1 695 270H480Z" fill="${c.blue}"/><path d="M265 270H480V485A215 215 0 0 1 265 270" fill="${c.teal}"/><circle cx="480" cy="270" r="65" fill="${c.ink}"/><path d="M60 100h140m-70-70v140M760 420h140m-70-70v140" stroke="${c.ink}" stroke-width="8"/>`,
    `<rect width="960" height="540" fill="${c.lilac}"/><path d="M90 440V220a110 110 0 0 1 220 0v220M370 440V140a110 110 0 0 1 220 0v300M650 440V260a110 110 0 0 1 220 0v180" fill="none" stroke="${c.blue}" stroke-width="65"/><circle cx="200" cy="160" r="50" fill="${c.coral}"/><circle cx="480" cy="100" r="50" fill="${c.teal}"/><circle cx="760" cy="210" r="50" fill="${c.ink}"/>`,
    `<rect width="960" height="540" fill="${c.mint}"/><g transform="translate(160 100)"><rect width="270" height="270" fill="${c.blue}" transform="rotate(-12 135 135)"/><circle cx="370" cy="170" r="145" fill="${c.coral}"/><path d="M410 330L640-20 720 330Z" fill="${c.ink}"/><circle cx="140" cy="140" r="65" fill="${c.lilac}"/><path d="M140 140L370 170 570 260" fill="none" stroke="${c.paper}" stroke-width="14"/></g>`,
  ];
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 960 540" width="960" height="540">${scenes[v % scenes.length]}</svg>\n`;
}
