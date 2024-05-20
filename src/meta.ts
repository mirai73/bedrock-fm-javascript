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
  prepareBody(messages: ChatMessage[], input: GenerationParams): string {
    const modelArgs = (({}) => ({
      // at the moment this model does not support any extra args
    }))((input.modelArgs as any) ?? {});
    const prompt = messages.filter((m) => m.role === "human")[0]?.message ?? "";
    let llamaChatPrompt = `${B_INST} ${prompt.trim()}`;

    if (!llamaChatPrompt.trimEnd().endsWith(E_INST)) {
      llamaChatPrompt += ` ${E_INST}`;
    }

    return JSON.stringify({
      prompt: llamaChatPrompt,
      max_gen_len:
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
    let llama2ChatPrompt = "";
    if (messages[0]?.role === "system") {
      llama2ChatPrompt += `${B_INST} ${B_SYS}${messages[0].message.trim()}${E_SYS}${messages[1]?.message.trim()} ${E_INST} `;
      messages = messages.slice(2);
    }
    messages.forEach((m, idx) => {
      idx % 2 === 1
        ? (llama2ChatPrompt += `${EOS}${BOS}${B_INST} ${m.message.trim()} ${E_INST} `)
        : (llama2ChatPrompt += `${m.message.trim()} `);
    });
    return [{ role: "human", message: llama2ChatPrompt }];
  }

  getResults(body: string): string {
    return JSON.parse(body).generation;
  }
}

const BEGIN_OF_TEXT = "<|begin_of_text|>";
const SYSTEM_HEADER = "<|start_header_id|>system<|end_header_id|>";
const USER_HEADER = "<|start_header_id|>user<|end_header_id|>";
const ASSISTANT_HEADER = "<|start_header_id|>assistant<|end_header_id|>";
const EOD = "<|eot_id|>";

export class Llama3Chat extends BedrockFoundationModel {
  prepareBody(messages: ChatMessage[], input: GenerationParams): string {
    const modelArgs = (({}) => ({
      // at the moment this model does not support any extra args
    }))((input.modelArgs as any) ?? {});

    const userMessages = messages.filter((m) => m.role === "human");
    if (userMessages.length === 0) {
      throw new Error("There must be at least one User message");
    }
    const prompt = userMessages[0]?.message ?? "";

    return JSON.stringify({
      prompt: prompt,
      max_gen_len:
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
    let llama2ChatPrompt = "";
    if (messages[0]?.role === "system") {
      llama2ChatPrompt += `${BEGIN_OF_TEXT}${SYSTEM_HEADER}\n\n${messages[0].message.trim()}${EOD}`;
      messages = messages.slice(1);
    }
    if (messages.length % 2 != 1)
      throw new Error(
        "Messages should be alternating [SYSTEM], USER, ASSISTANT. Last message should be USER",
      );
    messages.forEach((m, idx) => {
      idx % 2 === 0
        ? (llama2ChatPrompt += `${USER_HEADER}\n\n${m.message.trim()}${EOD}${ASSISTANT_HEADER}`)
        : (llama2ChatPrompt += `\n\n${m.message.trim()}${EOD}`);
    });
    return [{ role: "human", message: llama2ChatPrompt }];
  }

  getResults(body: string): string {
    return JSON.parse(body).generation;
  }
}
