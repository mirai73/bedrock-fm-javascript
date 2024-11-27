import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

/** @deprecated Jurassic models have reached end-of-life. Use Jamba instead */
export interface Penalty {
  scale: number;
  applyToWhitespaces?: boolean;
  applyToPunctuations?: boolean;
  applyToNumbers?: boolean;
  applyToStopwords?: boolean;
  applyToEmojis?: boolean;
}

/** @deprecated Jurassic models have reached end-of-life. Use Jamba instead */
export interface JurassicParams {
  temperature?: number;
  maxTokens?: number;
  stopSequences?: string[];
  topP?: number;
  minTokens?: number;
  numResults?: number;
  topKReturn?: number;
  countPenalty?: Penalty;
  presencePenalty?: Penalty;
  frequencyPenalty?: Penalty;
}

/**
 * Jurassic models
 *
 * For specific model args refer to AI21 documentation
 * https://docs.ai21.com/reference/j2-complete-api-ref#api-parameters
 *
 * @deprecated Jurassic models have reached end-of-life. Use Jamba instead
 */
export class Jurassic extends BedrockFoundationModel {
  override async chat(
    messages: ChatMessage[],
    options?: GenerationParams & { modelArgs?: JurassicParams }
  ): Promise<ChatMessage> {
    return await super.chat(messages, options);
  }

  override async generate(
    message: string,
    options?: GenerationParams & { modelArgs?: JurassicParams }
  ): Promise<string> {
    return await super.generate(message, options);
  }

  prepareBody(
    messages: ChatMessage[],
    input: GenerationParams & JurassicParams
  ): string {
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

export interface JambaParams {}

function roleMap(role: string): string {
  if (role == "human") return "user";
  return role;
}

export class Jamba extends BedrockFoundationModel {
  override async chat(
    messages: ChatMessage[],
    options?: GenerationParams & { modelArgs?: JambaParams }
  ): Promise<ChatMessage> {
    return await super.chat(messages, options);
  }

  override async generate(
    message: string,
    options?: GenerationParams & { modelArgs?: JambaParams }
  ): Promise<string> {
    return await super.generate(message, options);
  }

  prepareBody(
    messages: ChatMessage[],
    input: GenerationParams & JambaParams
  ): string {
    const modelArgs = (({ response_format, n, documents }) => ({
      response_format,
      n,
      documents,
    }))((input.modelArgs as any) ?? {});
    return JSON.stringify({
      messages: messages.map((m) => ({
        role: roleMap(m.role),
        content: m.message,
      })),
      max_tokens:
        input.modelArgs?.max_tokens ??
        input.maxTokenCount ??
        this.maxTokenCount,
      stop: input.modelArgs?.stop ?? input.stopSequences ?? this.stopSequences,
      temperature:
        input.modelArgs?.temperature ?? input.temperature ?? this.temperature,
      ...modelArgs,
    });
  }

  getResults(body: string): string {
    console.log(body);
    return (
      JSON.parse(body).choices?.map(
        (c: any) => c.message?.content ?? c.delta?.content ?? ""
      )[0] ?? ""
    );
  }
}
