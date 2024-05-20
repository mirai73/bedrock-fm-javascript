import {
  BedrockRuntimeClient,
  InvokeModelCommand,
  InvokeModelWithResponseStreamCommand,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * Supported models
 */
export type ModelID = string;

export class Models {
  public static readonly AMAZON_TITAN_TG1_LARGE = "amazon.titan-tg1-large";
  public static readonly AMAZON_TITAN_TEXT_LITE_V1 =
    "amazon.titan-text-lite-v1";
  public static readonly AMAZON_TITAN_TEXT_EXPRESS_V1 =
    "amazon.titan-text-express-v1";
  public static readonly AMAZON_TITAN_TEXT_PREMIER_V1_0 =
    "amazon.titan-text-premier-v1:0";
  public static readonly AI21_J2_GRANDE_INSTRUCT = "ai21.j2-grande-instruct";
  public static readonly AI21_J2_JUMBO_INSTRUCT = "ai21.j2-jumbo-instruct";
  public static readonly AI21_J2_MID = "ai21.j2-mid";
  public static readonly AI21_J2_MID_V1 = "ai21.j2-mid-v1";
  public static readonly AI21_J2_ULTRA = "ai21.j2-ultra";
  public static readonly AI21_J2_ULTRA_V1 = "ai21.j2-ultra-v1";
  public static readonly ANTHROPIC_CLAUDE_INSTANT_V1 =
    "anthropic.claude-instant-v1";
  public static readonly ANTHROPIC_CLAUDE_V2 = "anthropic.claude-v2";
  public static readonly ANTHROPIC_CLAUDE_V2_1 = "anthropic.claude-v2:1";
  public static readonly ANTHROPIC_CLAUDE_3_SONNET_20240229_V1_0 =
    "anthropic.claude-3-sonnet-20240229-v1:0";
  public static readonly ANTHROPIC_CLAUDE_3_HAIKU_20240307_V1_0 =
    "anthropic.claude-3-haiku-20240307-v1:0";
  public static readonly COHERE_COMMAND_TEXT_V14 = "cohere.command-text-v14";
  public static readonly COHERE_COMMAND_LIGHT_TEXT_V14 =
    "cohere.command-light-text-v14";
  public static readonly COHERE_COMMAND_R_V1_0 = "cohere.command-r-v1:0";
  public static readonly COHERE_COMMAND_R_PLUS_V1_0 =
    "cohere.command-r-plus-v1:0";
  public static readonly META_LLAMA2_13B_CHAT_V1 = "meta.llama2-13b-chat-v1";
  public static readonly META_LLAMA2_70B_CHAT_V1 = "meta.llama2-70b-chat-v1";
  public static readonly META_LLAMA3_8B_INSTRUCT_V1_0 =
    "meta.llama3-8b-instruct-v1:0";
  public static readonly META_LLAMA3_70B_INSTRUCT_V1_0 =
    "meta.llama3-70b-instruct-v1:0";
  public static readonly MISTRAL_MISTRAL_7B_INSTRUCT_V0_2 =
    "mistral.mistral-7b-instruct-v0:2";
  public static readonly MISTRAL_MIXTRAL_8X7B_INSTRUCT_V0_1 =
    "mistral.mixtral-8x7b-instruct-v0:1";
  public static readonly MISTRAL_MISTRAL_LARGE_2402_V1_0 =
    "mistral.mistral-large-2402-v1:0";
}

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
    rawResponse = false
  ): Promise<string> {
    const messages: ChatMessage[] = [{ role: "human", message: prompt }];
    const response = await this._generateRaw(messages, input);
    if (rawResponse) {
      return response;
    } else {
      return this.getResults(response) ?? "";
    }
  }

  private async _generateRaw(
    messages: ChatMessage[],
    input?: GenerationParams
  ): Promise<string> {
    const body = this.prepareBody(messages, input ?? {});
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
    input?: GenerationParams
  ): Promise<AsyncIterable<string>> {
    return await this._generateStream(
      [{ role: "human", message: prompt }],
      input
    );
  }

  public async _generateStream(
    messages: ChatMessage[],
    input?: GenerationParams
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
    rawResponse = false
  ): Promise<ChatMessage> {
    if (!validateChatMessages(messages)) {
      throw new Error("Wrong message alternation");
    }
    const chat_messages = this.getChatPrompt(messages);
    const response = await this._generateRaw(chat_messages, input);

    return {
      role: "ai",
      message: this.getResults(response) ?? "",
      metadata: rawResponse ? JSON.parse(response) : undefined,
    };
  }

  public async chatStream(
    messages: ChatMessage[],
    input?: GenerationParams
  ): Promise<AsyncIterable<string>> {
    if (!validateChatMessages(messages)) {
      throw new Error("Wrong message alternation");
    }
    const chat_messages = this.getChatPrompt(messages);
    return this._generateStream(chat_messages, input);
  }

  abstract prepareBody(
    messages: ChatMessage[],
    input: GenerationParams
  ): string;

  getChatPrompt(messages: ChatMessage[]): ChatMessage[] {
    return messages;
  }

  abstract getResults(body: string): string | undefined;
}
