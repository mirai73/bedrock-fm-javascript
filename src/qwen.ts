import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

export interface Qwen3Params {
  reasoning_effort?: "low" | "medium" | "high";
  top_p?: number;
  max_completion_tokens?: number;
  temperature?: number;
  tools?: any[];
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
    options?: GenerationParams & { modelArgs?: Qwen3Params }
  ): Promise<ChatMessage> {
    return await super.chat(messages, options);
  }

  override async generate(
    message: string,
    options?: GenerationParams & { modelArgs?: Qwen3Params }
  ): Promise<string> {
    return await super.generate(message, options);
  }

  prepareBody(
    messages: ChatMessage[],
    input: GenerationParams & Qwen3Params
  ): string {
    const modelArgs = (({ top_k }) => ({
      top_k,
    }))((input.modelArgs as any) ?? {});

    let model_messages = messages.map((m) => ({
      role: RoleMap[m.role],
      content: m.message,
    }));

    return JSON.stringify({
      messages: model_messages,
      max_tokens:
        input.modelArgs?.max_completion_tokens ??
        input.max_completion_tokens ??
        this.maxTokenCount,
      top_p: input.modelArgs?.top_p ?? input.top_p ?? this.topP,
      temperature:
        input.modelArgs?.temperature ?? input.temperature ?? this.temperature,
      tools: input.modelArgs?.tools ?? input.tools,
      reasoning_effort:
        input.modelArgs?.reasoning_effort ?? input.reasoning_effort,
      ...modelArgs,
    });
  }

  getResults(body: string): string {
    return JSON.parse(body).choices.map(
      (g: any) => g.delta?.content ?? g.message?.content ?? ""
    )[0];
  }
}
