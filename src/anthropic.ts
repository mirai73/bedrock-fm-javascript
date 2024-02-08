import { BedrockFoundationModel, GenerationParams } from "./bedrock";

const HUMAN_TOKEN = "\n\nHuman:";
const AI_TOKEN = "\n\nAssistant:";
/**
 * Instantiates a new instance to interact with Claude models via Amazon Bedrock API
 *
 * ```ts
 * const model = new Claude();
 * const result = await model.generate("What is the meaning of life?", {
 *   temperature: 0.7,
 *   maxTokenCount: 100,
 *   stopSequences: ["\n\nHuman:"],
 * }```
 */
export class Claude extends BedrockFoundationModel {
  prepareBody(prompt: string, input: GenerationParams): string {
    const s = [...(input.stopSequences ?? [])];
    if (!s.includes(HUMAN_TOKEN)) {
      s.push(HUMAN_TOKEN);
    }

    if (!prompt.startsWith(HUMAN_TOKEN)) prompt = HUMAN_TOKEN + prompt;

    const a_i = prompt.lastIndexOf(AI_TOKEN);
    if (a_i < 0 || (a_i > 0 && prompt.indexOf(HUMAN_TOKEN, a_i) > -1))
      prompt = prompt + AI_TOKEN;

    const modelArgs = (({ top_k }) => ({
      top_k,
    }))((input.modelArgs as any) ?? {});

    return JSON.stringify({
      prompt: prompt,
      max_tokens_to_sample:
        input.modelArgs?.get("max_tokens_to_sample") ??
        input.maxTokenCount ??
        this.maxTokenCount,
      stop_sequences:
        input.modelArgs?.get("stop_sequences") ??
        input.stopSequences ??
        this.stopSequences,
      top_p: input.modelArgs?.get("top_p") ?? input.topP ?? this.topP,
      temperature:
        input.modelArgs?.get("temperature") ??
        input.temperature ??
        this.temperature,
      ...modelArgs,
    });
  }

  getResults(body: string): string[] {
    return [JSON.parse(body).completion];
  }
}
