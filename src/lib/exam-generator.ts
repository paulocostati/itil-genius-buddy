export interface Topic {
  id: string;
  name: string;
  area: string;
  weight: number;
}

export interface Question {
  id: string;
  topic_id: string;
  statement: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_option: string;
  explanation: string | null;
}

/**
 * Distributes questions proportionally to topic weights.
 * Ensures the total exactly matches totalQuestions.
 */
export function distributeByWeight(
  topics: Topic[],
  questionsByTopic: Map<string, Question[]>,
  totalQuestions: number
): Question[] {
  const totalWeight = topics.reduce((sum, t) => sum + Number(t.weight), 0);

  // Calculate ideal distribution
  const distribution: { topicId: string; count: number; remainder: number }[] = [];
  let allocated = 0;

  for (const topic of topics) {
    const available = questionsByTopic.get(topic.id)?.length || 0;
    if (available === 0) continue;

    const ideal = (Number(topic.weight) / totalWeight) * totalQuestions;
    const floor = Math.floor(ideal);
    const count = Math.min(floor, available);
    distribution.push({ topicId: topic.id, count, remainder: ideal - floor });
    allocated += count;
  }

  // Distribute remaining questions by largest remainder
  let remaining = totalQuestions - allocated;
  distribution.sort((a, b) => b.remainder - a.remainder);
  for (const d of distribution) {
    if (remaining <= 0) break;
    const available = questionsByTopic.get(d.topicId)?.length || 0;
    if (d.count < available) {
      d.count++;
      remaining--;
    }
  }

  // If still remaining (not enough questions in weighted topics), fill from any topic
  if (remaining > 0) {
    for (const d of distribution) {
      if (remaining <= 0) break;
      const available = questionsByTopic.get(d.topicId)?.length || 0;
      while (d.count < available && remaining > 0) {
        d.count++;
        remaining--;
      }
    }
  }

  // Select random questions per topic
  const selected: Question[] = [];
  for (const d of distribution) {
    const pool = questionsByTopic.get(d.topicId) || [];
    const shuffled = [...pool].sort(() => Math.random() - 0.5);
    selected.push(...shuffled.slice(0, d.count));
  }

  // Final shuffle
  return selected.sort(() => Math.random() - 0.5);
}
