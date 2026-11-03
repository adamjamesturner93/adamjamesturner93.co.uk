import { tagRegistry, type TagId } from '../lib/content/tags.mjs';
export default function TopicChips({
  tags,
  small = false,
}: {
  tags: TagId[];
  small?: boolean;
}) {
  if (!tags.length) return null;
  return (
    <ul
      className={`topic-chips${small ? ' topic-chips-small' : ''}`}
      aria-label="Article topics"
    >
      {tags.map((tag) => (
        <li
          key={tag}
          className={`topic-chip topic-chip-${tagRegistry[tag].tone}`}
        >
          {tagRegistry[tag].label}
        </li>
      ))}
    </ul>
  );
}
