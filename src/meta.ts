import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

// Prompt build logic based on https://github.com/facebookresearch/llama/blob/main/llama/generation.py#L44

const [B_INST, E_INST] = ["[INST]", "[/INST]"];
const [B_SYS, E_SYS] = ["<<SYS>>\n", "\n<</SYS>>\n\n"];
const [BOS, EOS] = ["<s>", "</s>"];

export class Llama2Chat extends BedrockFoundationModel {
  prepareBody(prompt: string, input: GenerationParams): string {
    const modelArgs = (({}) => ({
      // at the moment this model does not support any extra args
    }))((input.modelArgs as any) ?? {});

    let llamaChatPrompt = `${BOS} ${B_INST} ${prompt.trim()}`;

    if (!llamaChatPrompt.trimEnd().endsWith(E_INST)) {
      llamaChatPrompt += ` ${E_INST}`;
    }

    return JSON.stringify({
      prompt: llamaChatPrompt,
      max_gen_len:
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

  override getChatPrompt(messages: ChatMessage[]): string {
    let llama2ChatPrompt = "";
    if (messages[0]?.role === "system") {
      llama2ChatPrompt += `${B_SYS}${messages[0].message.trim()}${E_SYS} ${messages[1]?.message.trim()} ${E_INST} `;
      messages = messages.slice(2);
    }
    messages.forEach((m, idx) => {
      idx % 2 === 1
        ? (llama2ChatPrompt += `${EOS}${BOS} ${B_INST} ${m.message.trim()} ${E_INST} `)
        : (llama2ChatPrompt += `${m.message.trim()} `);
    });
    return llama2ChatPrompt;
  }

  getResults(body: string): string {
    return JSON.parse(body).generation;
  }
}
