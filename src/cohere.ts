import { BedrockFoundationModel, GenerationParams } from "./bedrock";

/**
 * Instantiates a new instance to interact with Command foundation model via Amazon Bedrock
 *
 */
export class Command extends BedrockFoundationModel {
  prepareBody(prompt: string, input: GenerationParams): string {
    const modelArgs = (({ k, num_generations }) => ({
      num_generations,
      k,
    }))((input.modelArgs as any) ?? {});
    return JSON.stringify({
      prompt: prompt,
      max_tokens:
        input.modelArgs?.get("max_tokens") ??
        input.maxTokenCount ??
        this.maxTokenCount,
      stop_sequences:
        input.modelArgs?.get("stop_sequences") ??
        input.stopSequences ??
        this.stopSequences,
      p: input.modelArgs?.get("p") ?? input.topP ?? this.topP,
      temperature:
        input.modelArgs?.get("temperature") ??
        input.temperature ??
        this.temperature,
      stream: false,
      ...modelArgs,
    });
  }

  getResults(body: string): string {
    return JSON.parse(body).generations.map((g: any) => {
      if (g.is_finished) {
        const t = g.text;
        return t === "<EOS_TOKEN>" ? "\n" : t;
      } else if (g.finish_reason === "COMPLETE") {
        return g.text;
      }
      return "";
    })[0];
  }
}
