import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

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
  prepareBody(messages: ChatMessage[], input: GenerationParams): string {
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
        input.modelArgs?.get("max_tokens") ??
        input.maxTokenCount ??
        this.maxTokenCount,
      stop_sequences:
        input.modelArgs?.get("stop_sequences") ?? s ?? this.stopSequences,
      top_p: input.modelArgs?.get("top_p") ?? input.topP ?? this.topP,
      temperature:
        input.modelArgs?.get("temperature") ??
        input.temperature ??
        this.temperature,
      ...modelArgs,
    });
  }

  getResults(body: string): string | undefined {
    const jbody = JSON.parse(body);
    console.log(jbody);
    if (jbody.type === "message") {
      return jbody.content[0].text;
    } else if (jbody.type === "content_block_delta") {
      return jbody.delta.text;
    }
    return undefined;
  }
}
