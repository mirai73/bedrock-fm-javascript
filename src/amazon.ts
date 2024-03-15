import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

export class Titan extends BedrockFoundationModel {
  prepareBody(messages: ChatMessage[], input: GenerationParams): string {
    return JSON.stringify({
      inputText: messages.filter((m) => m.role === "human")[0]?.message,
      textGenerationConfig: {
        maxTokenCount:
          input.modelArgs?.get("maxTokenCount") ??
          input.maxTokenCount ??
          this.maxTokenCount,
        stopSequences:
          input.modelArgs?.get("stopSequences") ??
          input.stopSequences ??
          this.stopSequences,
        topP: input.modelArgs?.get("topP") ?? input.topP ?? this.topP,
        temperature:
          input.modelArgs?.get("temperature") ??
          input.temperature ??
          this.temperature,
      },
    });
  }

  getResults(body: string): string {
    const b = JSON.parse(body);
    if (b.results) {
      return b.results.map((r: any) => r.outputText)[0];
    } else {
      return b.outputText;
    }
  }
}
