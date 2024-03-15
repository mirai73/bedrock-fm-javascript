import { ChatMessage, GenerationParams } from "./bedrock";
import { Llama2Chat } from "./meta";

// Prompt build logic based on https://github.com/facebookresearch/llama/blob/main/llama/generation.py#L44

const [B_INST, E_INST] = ["[INST]", "[/INST]"];

export class Mistral extends Llama2Chat {
  override prepareBody(
    messages: ChatMessage[],
    input: GenerationParams,
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
        input.modelArgs?.get("max_gen_len") ??
        input.maxTokenCount ??
        this.maxTokenCount,
      temperature:
        input.modelArgs?.get("temperature") ??
        input.temperature ??
        this.temperature,
      top_p: input.modelArgs?.get("top_p") ?? input.topP ?? this.topP,
      ...modelArgs,
    });
  }

  override getResults(body: string): string {
    return JSON.parse(body).outputs[0].text;
  }
}
