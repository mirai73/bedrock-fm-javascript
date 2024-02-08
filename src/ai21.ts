import { BedrockFoundationModel, GenerationParams } from "./bedrock";

export class Jurassic extends BedrockFoundationModel {
  prepareBody(prompt: string, input: GenerationParams): string {
    const modelArgs = (({ minTokens, numResults }) => ({
      minTokens,
      numResults,
    }))((input.modelArgs as any) ?? {});
    return JSON.stringify({
      prompt: prompt, //@ts-ignore
      maxTokens:
        input.modelArgs?.get("maxTokens") ??
        input.maxTokenCount ??
        this.maxTokenCount, //@ts-ignore
      stopSequences:
        input.modelArgs?.get("stopSequences") ??
        input.stopSequences ??
        this.stopSequences,
      temperature:
        input.modelArgs?.get("temperature") ??
        input.temperature ??
        this.temperature, //@ts-ignore
      topP: input.modelArgs?.get("topP") ?? input.topP ?? this.topP,
      ...modelArgs,
    });
  }

  getResults(body: string): string[] {
    return JSON.parse(body).completions.map((c: any) => c.data.text);
  }
}
