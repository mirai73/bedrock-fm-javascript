import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * Supported models
 */
export type Models =
  | "amazon.titan-tg1-large"
  | "amazon.titan-text-lite-v1"
  | "amazon.titan-text-express-v1"
  | "ai21.j2-grande-instruct"
  | "ai21.j2-jumbo-instruct"
  | "ai21.j2-mid"
  | "ai21.j2-mid-v1"
  | "ai21.j2-ultra"
  | "ai21.j2-ultra-v1"
  | "anthropic.claude-instant-v1"
  | "anthropic.claude-v2"
  | "anthropic.claude-v2:1"
  | "anthropic.claude-3-sonnet-20240229-v1:0"
  | "anthropic.claude-3-haiku-20240307-v1:0"
  | "cohere.command-text-v14"
  | "cohere.command-light-text-v14"
  | "meta.llama2-13b-chat-v1"
  | "meta.llama2-70b-chat-v1"
  | "mistral.mistral-7b-instruct-v0:2"
  | "mistral.mixtral-8x7b-instruct-v0:1";

/**
 * Parameters that can modify the way completions are generated
 */
export interface GenerationParams {
  /**
   * Top-p sampling
   */
  topP?: number;
  /**
   * Temperature
   */
  temperature?: number;
  /**
   * Maximum number of tokens to generate
   */
  maxTokenCount?: number;
  /**
   * Stop sequences
   */
  stopSequences?: string[];
  /**
   * Extra arguments to pass to the model
   */
  modelArgs?: Map<string, any>;
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
  credentials?: any;
}

export interface ChatMessage {
  role: "system" | "ai" | "human";
  message: string;
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
  public readonly extraArgs?: Map<string, any>;
  readonly client: BedrockRuntimeClient;
  public readonly modelId: string;

  constructor(
    modelId: Models,
    params?: BedrockFoundationModelParams & GenerationParams,
  ) {
    this.extraArgs = params?.modelArgs;
    this.topP = params?.topP ?? 0.9;
    this.temperature = params?.temperature ?? 0.7;
    this.maxTokenCount = params?.maxTokenCount ?? 512;
    this.stopSequences = params?.stopSequences ?? [];
    this.modelId = modelId;

    this.client =
      params?.client ??
      new BedrockRuntimeClient({
        region: params?.region,
        credentials: params?.credentials,
      });
  }

  public async generate(
    prompt: string,
    input?: GenerationParams,
  ): Promise<string> {
    const messages: ChatMessage[] = [{ role: "human", message: prompt }];
    return (await this._generate(messages, input)) ?? "";
  }

  private async _generate(messages: ChatMessage[], input?: GenerationParams) {
    const body = this.prepareBody(messages, input ?? {});
    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      body: body,
      accept: "application/json",
    });
    const result = await this.client.send(command);
    return this.getResults(result.body.transformToString("utf8"));
  }

  public async generateStream(
    prompt: string,
    input?: GenerationParams,
  ): Promise<AsyncIterable<string>> {
    return await this._generateStream(
      [{ role: "human", message: prompt }],
      input,
    );
  }

  public async _generateStream(
    messages: ChatMessage[],
    input?: GenerationParams,
  ): Promise<AsyncIterable<string>> {
    const body = this.prepareBody(messages, input ?? {});
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
    input?: GenerationParams,
  ): Promise<ChatMessage> {
    if (!validateChatMessages(messages)) {
      throw new Error("Wrong message alternation");
    }
    const chat_messages = this.getChatPrompt(messages);
    return {
      role: "ai",
      message: (await this._generate(chat_messages, input)) ?? "",
    };
  }

  public async chatStream(
    messages: ChatMessage[],
    input?: GenerationParams,
  ): Promise<AsyncIterable<string>> {
    if (!validateChatMessages(messages)) {
      throw new Error("Wrong message alternation");
    }
    const chat_messages = this.getChatPrompt(messages);
    return this._generateStream(chat_messages, input);
  }

  abstract prepareBody(
    messages: ChatMessage[],
    input: GenerationParams,
  ): string;

  getChatPrompt(messages: ChatMessage[]): ChatMessage[] {
    return messages;
  }

  abstract getResults(body: string): string | undefined;
}
