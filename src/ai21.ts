import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

export class Jurassic extends BedrockFoundationModel {
  prepareBody(messages: ChatMessage[], input: GenerationParams): string {
    const modelArgs = (({ minTokens, numResults }) => ({
      minTokens,
      numResults,
    }))((input.modelArgs as any) ?? {});
    return JSON.stringify({
      prompt: messages.filter((m) => m.role === "human")[0]?.message,
      maxTokens:
        input.modelArgs?.get("maxTokens") ??
        input.maxTokenCount ??
        this.maxTokenCount,
      stopSequences:
        input.modelArgs?.get("stopSequences") ??
        input.stopSequences ??
        this.stopSequences,
      temperature:
        input.modelArgs?.get("temperature") ??
        input.temperature ??
        this.temperature,
      topP: input.modelArgs?.get("topP") ?? input.topP ?? this.topP,
      ...modelArgs,
    });
  }

  getResults(body: string): string {
    return JSON.parse(body).completions.map((c: any) => c.data.text)[0];
  }
}
