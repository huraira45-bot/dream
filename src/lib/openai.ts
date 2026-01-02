import OpenAI from 'openai';

const openAIKey = process.env.OPENAI_API_KEY;
const groqKey = process.env.GROQ_API_KEY;

export const openai = openAIKey ? new OpenAI({
    apiKey: openAIKey,
}) : null;

export const groq = groqKey ? new OpenAI({
    apiKey: groqKey,
    baseURL: "https://api.groq.com/openai/v1"
}) : null;

export async function generateJSONWithLLM<T>(
    prompt: string,
    schema: any,
    options: { temperature?: number; seed?: number; preferredProvider?: 'openai' | 'groq' } = {}
): Promise<T> {
    const provider = options.preferredProvider || (groq ? 'groq' : 'openai');
    const client = provider === 'groq' ? groq : openai;
    const model = provider === 'groq' ? "llama-3.3-70b-versatile" : "gpt-4o";

    if (!client) {
        throw new Error(`${provider.toUpperCase()} API key is missing`);
    }

    try {
        const response = await client.chat.completions.create({
            model: model,
            messages: [
                {
                    role: "system",
                    content: "You are an elite Social Media Production Team. You output raw JSON only."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            response_format: { type: "json_object" },
            temperature: options.temperature ?? 1.0,
            seed: options.seed
        });

        const content = response.choices[0].message.content;
        if (!content) throw new Error(`No response from ${provider.toUpperCase()}`);

        return JSON.parse(content) as T;
    } catch (err: any) {
        // Simple fallback from Groq to OpenAI (or vice versa) if one fails
        if (provider === 'groq' && openai) {
            console.warn(`Groq failed (${err.message}). Falling back to OpenAI...`);
            return generateJSONWithLLM(prompt, schema, { ...options, preferredProvider: 'openai' });
        }
        throw err;
    }
}
