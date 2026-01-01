import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

export const openai = apiKey ? new OpenAI({
    apiKey: apiKey,
}) : null;

export async function generateJSONWithGPT4o<T>(prompt: string, schema: any): Promise<T> {
    if (!openai) {
        throw new Error("OPENAI_API_KEY is missing");
    }

    const response = await openai.chat.completions.create({
        model: "gpt-4o",
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
        response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    if (!content) throw new Error("No response from GPT-4o");

    return JSON.parse(content) as T;
}
