import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

export interface ClaudeParams {
  top_k?: number;
  top_p?: number;
  max_tokens?: number;
  stop_sequences?: string[];
}

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
  override async chat(
    messages: ChatMessage[],
    options?: GenerationParams & { modelArgs: ClaudeParams },
  ): Promise<ChatMessage> {
    return await super.chat(messages, options);
  }

  override async generate(
    message: string,
    options?: GenerationParams & { modelArgs: ClaudeParams },
  ): Promise<string> {
    return await super.generate(message, options);
  }

  prepareBody(
    messages: ChatMessage[],
    input: GenerationParams & ClaudeParams,
  ): string {
    const s = [...(input.stopSequences ?? [])];

    const modelArgs = (({ top_k }) => ({
      top_k,
    }))((input.modelArgs as any) ?? {});

    return JSON.stringify({
      messages: messages
        .filter((m) => m.role !== "system")
        .map((m) => ({
          role: m.role === "human" ? "user" : "assistant",
          content: m.message,
        })),
      system: messages.filter((m) => m.role === "system")[0]?.message,
      anthropic_version: "bedrock-2023-05-31",
      max_tokens:
        input.modelArgs?.max_tokens ??
        input.maxTokenCount ??
        this.maxTokenCount,
      stop_sequences:
        input.modelArgs?.stop_sequences ?? s ?? this.stopSequences,
      top_p: input.modelArgs?.top_p ?? input.topP ?? this.topP,
      temperature:
        input.modelArgs?.temperature ?? input.temperature ?? this.temperature,
      ...modelArgs,
    });
  }

  getResults(body: string): string | undefined {
    const jbody = JSON.parse(body);
    if (jbody.type === "message") {
      return jbody.content[0].text;
    } else if (jbody.type === "content_block_delta") {
      return jbody.delta.text;
    }
    return undefined;
  }
}

/*
{
  "type": "image",
  "source": {
    "type": "base64",
    "media_type": "image/jpeg",
    "data": "iVBORw..."
  }
},
{
  "type": "text",
  "text": "What's in this image?"
}
*/

export class Claude3 extends BedrockFoundationModel {
  override async chat(
    messages: ChatMessage[],
    options?: GenerationParams & { modelArgs?: ClaudeParams },
  ): Promise<ChatMessage> {
    return await super.chat(messages, options);
  }

  override async generate(
    message: string,
    options?: GenerationParams & { modelArgs?: ClaudeParams },
  ): Promise<string> {
    return await super.generate(message, options);
  }

  prepareBody(
    messages: ChatMessage[],
    input: GenerationParams & ClaudeParams,
  ): string {
    const s = [...(input.stopSequences ?? [])];

    const modelArgs = (({ top_k }) => ({
      top_k,
    }))((input.modelArgs as any) ?? {});

    return JSON.stringify({
      messages: messages
        .filter((m) => m.role !== "system")
        .map((m) => {
          if (m.images && m.role === "human") {
            return {
              role: "user",
              content: [
                { type: "text", text: m.message },
                ...m.images.map((im) => ({
                  type: "image",
                  source: {
                    type: "base64",
                    media_type: im.split(";")[0]?.split(":")[1],
                    data: im.split(",")[1],
                  },
                })),
              ],
            };
          } else {
            return {
              role: m.role === "human" ? "user" : "assistant",
              content: m.message,
            };
          }
        }),
      system:
        input.modelArgs?.system ??
        messages.filter((m) => m.role === "system")[0]?.message,
      anthropic_version: "bedrock-2023-05-31",
      max_tokens:
        input.modelArgs?.max_tokens ??
        input.maxTokenCount ??
        this.maxTokenCount,
      stop_sequences:
        input.modelArgs?.stop_sequences ?? s ?? this.stopSequences,
      top_p: input.modelArgs?.top_p ?? input.topP ?? this.topP,
      temperature:
        input.modelArgs?.temperature ?? input.temperature ?? this.temperature,
      ...modelArgs,
    });
  }

  getResults(body: string): string | undefined {
    const jbody = JSON.parse(body);
    if (jbody.type === "message") {
      return jbody.content[0].text;
    } else if (jbody.type === "content_block_delta") {
      return jbody.delta.text;
    }
    return undefined;
  }
}
