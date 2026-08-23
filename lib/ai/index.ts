export interface StructuredResearchPlan {
  goal: string;
  entities: string[];
  fields: string[];
  constraints: Record<string, any>;
}

/**
 * Fallback Rule-Based NLP Planner when no external LLM API key is present.
 * Deterministically parses natural language research goals into structured plans.
 */
function parseGoalWithRuleEngine(prompt: string): StructuredResearchPlan {
  const cleanPrompt = prompt.trim();
  const lower = cleanPrompt.toLowerCase();

  // 1. Extract Entities
  const entityKeywords = ['laptop', 'notebook', 'phone', 'smartphone', 'monitor', 'gpu', 'headphone', 'car', 'course', 'flight', 'hotel', 'job'];
  const matchedEntities = entityKeywords.filter(e => lower.includes(e));
  const entities = matchedEntities.length > 0 
    ? matchedEntities.map(e => e.endsWith('s') ? e : `${e}s`)
    : ['products'];

  // 2. Extract Fields
  const fieldsSet = new Set<string>(['name', 'price', 'url']);
  if (lower.includes('ram') || lower.includes('memory')) fieldsSet.add('ram');
  if (lower.includes('ssd') || lower.includes('storage') || lower.includes('gb') || lower.includes('tb')) fieldsSet.add('storage');
  if (lower.includes('battery') || lower.includes('hour')) fieldsSet.add('battery_life');
  if (lower.includes('brand') || lower.includes('make')) fieldsSet.add('brand');
  if (lower.includes('rating') || lower.includes('review') || lower.includes('star')) fieldsSet.add('rating');
  if (lower.includes('processor') || lower.includes('cpu') || lower.includes('i5') || lower.includes('i7') || lower.includes('ryzen')) fieldsSet.add('processor');
  
  // Default essential fields
  if (fieldsSet.size <= 3) {
    fieldsSet.add('brand');
    fieldsSet.add('specs');
  }

  // 3. Extract Constraints
  const constraints: Record<string, any> = {};

  // Max Price Extraction (e.g. under ₹80,000, under $1000, under 80k)
  const priceMatch = lower.match(/(under|below|less than|max)\s*(?:[₹$]|rs\.?|inr)?\s*([\d,]+|\d+\s*k)/i);
  if (priceMatch) {
    let rawVal = priceMatch[2].replace(/,/g, '');
    if (rawVal.toLowerCase().endsWith('k')) {
      rawVal = (parseFloat(rawVal) * 1000).toString();
    }
    const numPrice = parseFloat(rawVal);
    if (!isNaN(numPrice)) {
      constraints.max_price = numPrice;
      constraints.currency = lower.includes('$') || lower.includes('usd') ? 'USD' : 'INR';
    }
  }

  // RAM Extraction (e.g. 16gb ram, 8 gb)
  const ramMatch = lower.match(/(\d+)\s*gb\s*(?:ram|memory)?/i);
  if (ramMatch) {
    constraints.ram_gb = parseInt(ramMatch[1], 10);
  }

  // Storage Extraction (e.g. 512gb ssd, 1tb storage)
  const storageMatch = lower.match(/(\d+)\s*(gb|tb)\s*(?:ssd|storage|hdd)?/i);
  if (storageMatch && storageMatch[0] !== ramMatch?.[0]) {
    const unit = storageMatch[2].toLowerCase();
    const size = parseInt(storageMatch[1], 10);
    constraints.min_storage_gb = unit === 'tb' ? size * 1024 : size;
    if (lower.includes('ssd')) constraints.storage_type = 'SSD';
  }

  return {
    goal: cleanPrompt,
    entities,
    fields: Array.from(fieldsSet),
    constraints,
  };
}

/**
 * Provider-Independent AI Goal Planner
 * Primary: OpenAI API (if OPENAI_API_KEY is configured)
 * Secondary / Fallback: Internal Rule Engine
 */
export async function planResearchGoal(prompt: string): Promise<StructuredResearchPlan> {
  if (!prompt || prompt.trim().length === 0) {
    throw new Error('Research goal prompt cannot be empty');
  }

  const apiKey = process.env.OPENAI_API_KEY;

  if (apiKey && apiKey.trim().length > 0) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are WebRescue AI Goal Planner. Convert user's research request into a JSON research plan.
Return ONLY valid JSON matching this schema:
{
  "goal": string,
  "entities": string[],
  "fields": string[],
  "constraints": object
}`,
            },
            {
              role: 'user',
              content: prompt,
            },
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        const content = data.choices?.[0]?.message?.content;
        if (content) {
          const parsed = JSON.parse(content);
          return {
            goal: parsed.goal || prompt,
            entities: Array.isArray(parsed.entities) ? parsed.entities : ['products'],
            fields: Array.isArray(parsed.fields) ? parsed.fields : ['name', 'price', 'url'],
            constraints: typeof parsed.constraints === 'object' ? parsed.constraints : {},
          };
        }
      }
    } catch (err) {
      console.warn('OpenAI API call failed, falling back to rule engine:', err);
    }
  }

  // Fallback to deterministic NLP parsing engine
  return parseGoalWithRuleEngine(prompt);
}
