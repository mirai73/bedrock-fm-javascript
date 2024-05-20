import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

/**
 * Jurassic models
 *
 * For specific model args refer to AI21 documentation
 * https://docs.ai21.com/reference/j2-complete-api-ref#api-parameters
 */
export class Jurassic extends BedrockFoundationModel {
  prepareBody(messages: ChatMessage[], input: GenerationParams): string {
    const modelArgs = (({
      minTokens,
      numResults,
      topKReturn,
      countPenalty,
      presencePenalty,
      frequencyPenalty,
    }) => ({
      minTokens,
      numResults,
      topKReturn,
      countPenalty,
      presencePenalty,
      frequencyPenalty,
    }))((input.modelArgs as any) ?? {});
    return JSON.stringify({
      prompt: messages.filter((m) => m.role === "human")[0]?.message,
      maxTokens:
        input.modelArgs?.maxTokens ?? input.maxTokenCount ?? this.maxTokenCount,
      stopSequences:
        input.modelArgs?.stopSequences ??
        input.stopSequences ??
        this.stopSequences,
      temperature:
        input.modelArgs?.temperature ?? input.temperature ?? this.temperature,
      topP: input.modelArgs?.topP ?? input.topP ?? this.topP,
      ...modelArgs,
    });
  }

  getResults(body: string): string {
    return JSON.parse(body).completions.map((c: any) => c.data.text)[0];
  }
}
