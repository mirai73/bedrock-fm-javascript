import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

export interface Qwen3Params {
  enableThinking?: boolean;
  top_p?: number;
  top_k?: number;
  max_tokens?: number;
  temperature?: number;
  presence_penalty?: number;
}

const RoleMap = {
  system: "system",
  ai: "assistant",
  human: "user",
};
/**
 * Instantiates a new instance to interact with Qwen3 foundation model via Amazon Bedrock
 */

export class Qwen3 extends BedrockFoundationModel {
  override async chat(
    messages: ChatMessage[],
    options?: GenerationParams & { modelArgs?: Qwen3Params },
  ): Promise<ChatMessage> {
    return await super.chat(messages, options);
  }

  override async generate(
    message: string,
    options?: GenerationParams & { modelArgs?: Qwen3Params },
  ): Promise<string> {
    return await super.generate(message, options);
  }

  prepareBody(
    messages: ChatMessage[],
    input: GenerationParams & Qwen3Params,
  ): string {
    const { top_p, temperature, max_tokens, ...modelArgs } =
      (input.modelArgs as any) ?? {};

    let model_messages = messages.map((m) => ({
      role: RoleMap[m.role],
      content: m.message,
    }));

    return JSON.stringify({
      messages: model_messages,
      max_tokens:
        input.modelArgs?.max_tokens ??
        input.maxTokenCount ??
        this.maxTokenCount,
      top_p: input.modelArgs?.p ?? input.topP ?? this.topP,
      temperature:
        input.modelArgs?.temperature ?? input.temperature ?? this.temperature,
      ...modelArgs,
    });
  }

  getResults(body: string): string {
    return JSON.parse(body).choices.map((g: any) => g.message.content)[0];
  }
}
