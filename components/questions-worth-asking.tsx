export default function QuestionsWorthAsking({
  intro,
  questions,
}: {
  intro?: string;
  questions: [string, string, string];
}) {
  if (
    !Array.isArray(questions) ||
    questions.length !== 3 ||
    questions.some((q) => typeof q !== 'string' || !q.trim())
  )
    throw new Error(
      'QuestionsWorthAsking requires exactly three non-empty questions',
    );
  if (intro !== undefined && typeof intro !== 'string')
    throw new Error('QuestionsWorthAsking intro must be a string');
  return (
    <section
      className="questions-worth-asking"
      aria-label="Questions worth asking"
    >
      <h2>Questions worth asking</h2>
      {intro && <p>{intro}</p>}
      <ol>
        {questions.map((question, index) => (
          <li key={index}>{question}</li>
        ))}
      </ol>
    </section>
  );
}
