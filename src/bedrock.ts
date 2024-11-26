import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * Supported models
 */
export type ModelID = string;

/**
 * Parameters that can modify the way completions are generated
 */
export interface GenerationParams {
  /**
   * Top-p sampling
   */
  topP?: number;

  /**
   * Temperature. Values between 0.0 and 1.0. Some model might further restrict the range
   */
  temperature?: number;

  /**
   * Maximum number of tokens to generate.
   */
  maxTokenCount?: number;

  /**
   * A list of stop sequences to interrupt the response generation. The number of elements
   * is model specific.
   */
  stopSequences?: string[];

  /**
   * Extra arguments to pass to the model
   */
  modelArgs?: Record<string, any>;

  /**
   * Indicates if the raw response should be returned to the user.
   *
   * If set to `true` the raw response from the model is added as `ChatMessage.metadata` or
   * returned as stringified JSON from the `generate` interface.
   */
  rawResponse?: boolean;
}

export interface BedrockFoundationModelParams {
  /**
   * Region where to access Bedrock
   */
  region?: string;

  /**
   * An optional BedrockRuntimeClient
   */
  client?: BedrockRuntimeClient;

  /**
   * Credentials to be used by client
   */
  credentials?: {
    accessKeyId: string;
    secretAccessKey: string;
    sessionToken?: string;
    expiration?: Date;
  };
}

export interface ChatMessage {
  /**
   * The role of the message. Can be `system`, `ai` or `human`.
   * It is autmatically translated to the value supported by the selected model.
   */
  role: "system" | "ai" | "human";

  /**
   * The message text
   */
  message: string;

  /**
   * An optional list of images for multimodal models, as image URL.
   *
   * It is ignored for text only models
   */
  images?: string[];

  /**
   * Optional metadata. Used in the model answer when enabling raw responses.
   */
  metadata?: Record<string, unknown>;
}

function validateChatMessages(messages: ChatMessage[]): boolean {
  if (messages.length === 0) {
    return false;
  }

  let idx = messages[0]!.role === "system" ? 1 : 0;
  if ((messages.length - idx - 1) % 2 !== 0) return false;
  for (let i = idx; i < messages.length; i++) {
    // Human
    if ((i - idx) % 2 === 0) {
      if (messages[i]?.role !== "human") return false;
    } else {
      // AI
      if (messages[i]?.role !== "ai") return false;
    }
  }
  return true;
}

export abstract class BedrockFoundationModel {
  public readonly topP: number;
  public readonly temperature: number;
  public readonly maxTokenCount: number;
  public readonly stopSequences: string[];
  public readonly extraArgs?: Record<string, any>;
  readonly client: BedrockRuntimeClient;
  public readonly modelId: string;
  public readonly rawResponse: boolean;

  constructor(
    modelId: ModelID,
    params?: BedrockFoundationModelParams & GenerationParams
  ) {
    this.extraArgs = params?.modelArgs;
    this.topP = params?.topP ?? 0.9;
    this.temperature = params?.temperature ?? 0.7;
    this.maxTokenCount = params?.maxTokenCount ?? 512;
    this.stopSequences = params?.stopSequences ?? [];
    this.modelId = modelId;
    this.rawResponse = params?.rawResponse ?? false;

    this.client =
      params?.client ??
      new BedrockRuntimeClient({
        region: params?.region,
        credentials: params?.credentials,
      });
  }

  public async generate(
    prompt: string,
    options?: GenerationParams
  ): Promise<string> {
    const messages: ChatMessage[] = [{ role: "human", message: prompt }];
    const response = await this._generateRaw(messages, options);
    if (this.rawResponse || (options && options.rawResponse)) {
      return response;
    } else {
      return this.getResults(response) ?? "";
    }
  }

  private async _generateRaw(
    messages: ChatMessage[],
    options?: GenerationParams
  ): Promise<string> {
    const body = this.prepareBody(messages, options ?? {});
    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      body: body,
      accept: "application/json",
    });
    const result = await this.client.send(command);
    return result.body.transformToString("utf8");
  }

  public async generateStream(
    prompt: string,
    options?: GenerationParams
  ): Promise<AsyncIterable<string>> {
    return await this._generateStream(
      [{ role: "human", message: prompt }],
      options
    );
  }

  public async _generateStream(
    messages: ChatMessage[],
    options?: GenerationParams
  ): Promise<AsyncIterable<string>> {
    const body = this.prepareBody(messages, options ?? {});
    const command = new InvokeModelWithResponseStreamCommand({
      modelId: this.modelId,
      contentType: "application/json",
      body: body,
      accept: "application/json",
    });
    const decoder = new TextDecoder("utf-8");
    const self = this;
    const resp = await this.client.send(command);
    return (async function* () {
      for await (const x of resp.body!) {
        yield self.getResults(decoder.decode(x.chunk?.bytes)) ?? "";
      }
    })();
  }

  public async chat(
    messages: ChatMessage[],
    options?: GenerationParams
  ): Promise<ChatMessage> {
    if (!validateChatMessages(messages)) {
      throw new Error("Wrong message alternation");
    }
    const chat_messages = this.getChatPrompt(messages);
    const response = await this._generateRaw(chat_messages, options);

    return {
      role: "ai",
      message: this.getResults(response) ?? "",
      metadata:
        this.rawResponse || (options && options.rawResponse)
          ? JSON.parse(response)
          : undefined,
    };
  }

  public async chatStream(
    messages: ChatMessage[],
    options?: GenerationParams
  ): Promise<AsyncIterable<string>> {
    if (!validateChatMessages(messages)) {
      throw new Error("Wrong message alternation");
    }
    const chat_messages = this.getChatPrompt(messages);
    return this._generateStream(chat_messages, options);
  }

  abstract prepareBody(
    messages: ChatMessage[],
    options: GenerationParams
  ): string;

  getChatPrompt(messages: ChatMessage[]): ChatMessage[] {
    return messages;
  }

  abstract getResults(body: string): string | undefined;
}
