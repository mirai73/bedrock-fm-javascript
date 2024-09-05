import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * Supported models
 */
export type ModelID = string;

/**
 * Parameters that can modify the way completions are generated
 */
export interface ImageGenerationParams {
  /**
   * The importance of the text prompt in influencing denoising
   */
  scale?: number;

  /**
   * The number of denoising steps to execute to generate an image. Higher values yield better results.
   */
  steps?: number;

  height?: number;
  width?: number;
  seed?: number;

  extraArgs?: Record<string, any>;

  /**
   * Returns the raw response from the InvokeModel call
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

export abstract class BedrockImageGenerationModel {
  public readonly scale: number;
  public readonly steps: number;
  public readonly extraArgs?: Record<string, any>;
  readonly client: BedrockRuntimeClient;
  public readonly modelId: string;
  public readonly rawResponse: boolean;

  constructor(
    modelId: ModelID,
    params?: BedrockFoundationModelParams & Partial<ImageGenerationParams>
  ) {
    this.extraArgs = params?.extraArgs;
    this.modelId = modelId;
    this.rawResponse = params?.rawResponse ?? false;
    this.scale = params?.scale ?? 1.0;
    this.steps = params?.steps ?? 20;

    this.client =
      params?.client ??
      new BedrockRuntimeClient({
        region: params?.region,
        credentials: params?.credentials,
      });
  }

  public async generateImage(
    prompt: string,
    options: ImageGenerationParams
  ): Promise<string[]> {
    if (!options.seed) {
      options.seed = Math.round(Math.random() * 2 ** 32);
    }
    const response = await this._generateRaw(prompt, options);
    if (this.rawResponse || (options && options.rawResponse)) {
      return response;
    } else {
      return this.getResults(response) ?? "";
    }
  }

  private async _generateRaw(
    prompt: string,
    options: ImageGenerationParams
  ): Promise<any> {
    const body = this.prepareBody(prompt, options);
    const command = new InvokeModelCommand({
      modelId: this.modelId,
      contentType: "application/json",
      body: body,
      accept: "application/json",
    });
    const result = await this.client.send(command);
    return JSON.parse(result.body.transformToString("utf8"));
  }

  abstract prepareBody(prompt: string, options: ImageGenerationParams): string;

  abstract getResults(body: any): string[];
}
