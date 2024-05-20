import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

export class Titan extends BedrockFoundationModel {
  override async chat(
    messages: ChatMessage[],
    input?: GenerationParams & { modelArgs: {} },
    rawResponse = false
  ): Promise<ChatMessage> {
    return await super.chat(messages, input, rawResponse);
  }

  override async generate(
    message: string,
    input?: GenerationParams & { modelArgs: {} }
  ): Promise<string> {
    return await super.generate(message, input);
  }

  prepareBody(
    messages: ChatMessage[],
    input: GenerationParams & { modelArgs: {} }
  ): string {
    const modelArgs = (({}) => ({
      // at the moment this model does not support any extra args
    }))((input.modelArgs as any) ?? {});

    return JSON.stringify({
      inputText: messages.filter((m) => m.role === "human")[0]?.message,
      textGenerationConfig: {
        maxTokenCount:
          input.modelArgs?.maxTokenCount ??
          input.maxTokenCount ??
          this.maxTokenCount,
        stopSequences:
          input.modelArgs?.stopSequences ??
          input.stopSequences ??
          this.stopSequences,
        topP: input.modelArgs?.topP ?? input.topP ?? this.topP,
        temperature:
          input.modelArgs?.temperature ?? input.temperature ?? this.temperature,
        ...modelArgs,
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
