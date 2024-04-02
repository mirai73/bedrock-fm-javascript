import { ChatMessage, GenerationParams } from "./bedrock";
import { Llama2Chat } from "./meta";

// Prompt build logic based on https://github.com/facebookresearch/llama/blob/main/llama/generation.py#L44

const [B_INST, E_INST] = ["[INST]", "[/INST]"];
const [BOS, EOS] = ["<s>", "</s>"];

export class Mistral extends Llama2Chat {
  override prepareBody(
    messages: ChatMessage[],
    input: GenerationParams
  ): string {
    const modelArgs = (({}) => ({
      // at the moment this model does not support any extra args
    }))((input.modelArgs as any) ?? {});
    const prompt = messages.filter((m) => m.role === "human")[0]?.message ?? "";
    let mistralPrompt = `${B_INST} ${prompt.trim()}`;

    if (!mistralPrompt.trimEnd().endsWith(E_INST)) {
      mistralPrompt += ` ${E_INST}`;
    }

    return JSON.stringify({
      prompt: mistralPrompt,
      max_tokens:
        input.modelArgs?.max_gen_len ??
        input.maxTokenCount ??
        this.maxTokenCount,
      temperature:
        input.modelArgs?.temperature ?? input.temperature ?? this.temperature,
      top_p: input.modelArgs?.top_p ?? input.topP ?? this.topP,
      ...modelArgs,
    });
  }

  override getChatPrompt(messages: ChatMessage[]): ChatMessage[] {
    // ref: https://docs.mistral.ai/models/#chat-template
    let prompt = "";
    if (messages[0]?.role === "system") {
      messages = messages.slice(1); // Ignore System messages - not supported
    }
    prompt += `${BOS}${B_INST} ${messages[0]!.message.trim()} ${E_INST}`;
    messages = messages.slice(1);

    messages.forEach((m, idx) => {
      idx % 2 === 1
        ? (prompt += `${EOS}${B_INST} ${m.message.trim()} ${E_INST}`)
        : (prompt += ` ${m.message.trim()}`);
    });
    return [{ role: "human", message: prompt }];
  }

  override getResults(body: string): string {
    return JSON.parse(body).outputs[0].text;
  }
}
