import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

const HUMAN_TOKEN = "\n\nHuman:";
const AI_TOKEN = "\n\nAssistant:";
/**
 * Instantiates a new instance to interact with Claude models via Amazon Bedrock API
 *
 * ```ts
 * const model = new Claude("anthropic.claude-v2:1");
 * const result = await model.generate("What is the meaning of life?", {
 *   temperature: 0.7,
 *   maxTokenCount: 100,
 * }```
 */
export class Claude extends BedrockFoundationModel {
  prepareBody(prompt: string, input: GenerationParams): string {
    const s = [...(input.stopSequences ?? [])];

    if (!s.includes(HUMAN_TOKEN)) {
      s.push(HUMAN_TOKEN);
    }

    // checking for Claude 2.1
    if (this.modelId.endsWith("2:1")) {
      const h_i = prompt.indexOf(HUMAN_TOKEN);
      if (prompt.substring(0, h_i).includes(AI_TOKEN)) {
        prompt = HUMAN_TOKEN + prompt;
      } // else there is a system prompt which is ok
    } else if (!prompt.startsWith(HUMAN_TOKEN)) prompt = HUMAN_TOKEN + prompt;

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

  override getChatPrompt(messages: ChatMessage[]): string {
    let prompt = "";
    if (messages[0]?.role === "system") {
      prompt += messages[0].message;
      messages = messages.slice(1);
    }
    let human = true;
    messages.forEach((m) => {
      prompt += `${human ? HUMAN_TOKEN : AI_TOKEN}: ${m}`;
      human = !human;
    });
    return prompt;
  }

  getResults(body: string): string {
    return JSON.parse(body).completion;
  }
}
