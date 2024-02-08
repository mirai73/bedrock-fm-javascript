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
  | "anthropic.claude-v1"
  | "anthropic.claude-v2"
  | "cohere.command-text-v14"
  | "cohere.command-light-text-v14"
  | "meta.llama2-13b-chat-v1"
  | "meta.llama2-70b-chat-v1";

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
  /**
   * Model ID
   */
  modelId: Models;
}

export abstract class BedrockFoundationModel {
  public readonly topP: number;
  public readonly temperature: number;
  public readonly maxTokenCount: number;
  public readonly stopSequences: string[];
  public readonly extraArgs?: Map<string, any>;
  readonly client: BedrockRuntimeClient;
  public readonly modelId: string;

  static fromModelId(params: BedrockFoundationModelParams & GenerationParams) {
    const model = new (this as any)(params);
    return model;
  }

  constructor(params: BedrockFoundationModelParams & GenerationParams) {
    this.extraArgs = params.modelArgs;
    this.topP = params.topP ?? 0.9;
    this.temperature = params.temperature ?? 0.7;
    this.maxTokenCount = params.maxTokenCount ?? 512;
    this.stopSequences = params.stopSequences ?? [];
    this.modelId = params.modelId;

    this.client =
      params.client ??
      new BedrockRuntimeClient({
        region: params?.region,
        credentials: params?.credentials,
      });
  }

  public async generateStream(
    prompt: string,
    input: GenerationParams
  ): Promise<AsyncIterable<string>> {
    const body = this.prepareBody(prompt, input);
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
        yield self.getResults(decoder.decode(x.chunk?.bytes))[0] ?? "";
      }
    })();
  }

  public async generate(
    prompt: string,
    input: GenerationParams
  ): Promise<string[]> {
    const body = this.prepareBody(prompt, input);

    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      body: body,
      accept: "application/json",
    });
    const result = await this.client.send(command);
    return this.getResults(result.body.transformToString("utf8"));
  }

  abstract prepareBody(prompt: string, input: GenerationParams): string;
  abstract getResults(body: string): string[];
}
