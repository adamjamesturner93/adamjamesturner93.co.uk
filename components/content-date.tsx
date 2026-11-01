export function isScheduled(publishedAt?: string) {
  return !!publishedAt && publishedAt > new Date().toISOString().slice(0, 10);
}
export function displayDate(date: string) {
  return new Intl.DateTimeFormat('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(date));
}
export default function ContentDate({
  draft,
  date,
  publishedAt,
}: {
  draft: boolean;
  date: string;
  publishedAt?: string;
}) {
  return (
    <span className="content-date">
      {draft ? 'Drafted ' : isScheduled(publishedAt) ? 'Scheduled for ' : ''}
      <time dateTime={draft ? date : publishedAt}>
        {displayDate(draft ? date : publishedAt!)}
      </time>
    </span>
  );
}
