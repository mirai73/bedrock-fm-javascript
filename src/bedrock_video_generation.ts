import {
  BedrockRuntimeClient,
  StartAsyncInvokeCommand,
} from "@aws-sdk/client-bedrock-runtime";

/**
 * Supported models
 */
export type ModelID = string;

/**
 * Parameters that can modify the way completions are generated
 */
export interface VideoGenerationParams {
  image?: string;
  durationSeconds?: 6;
  fps?: 24;
  dimesion?: "1280x720";
  seed?: number;
  /**
   * Returns the raw response from the InvokeModel call
   */
  rawResponse?: boolean;
  s3Uri?: string;
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

export abstract class BedrockVideoGenerationModel {
  public readonly extraArgs?: Record<string, any>;
  readonly client: BedrockRuntimeClient;
  public readonly modelId: string;
  public readonly rawResponse: boolean;
  params?: BedrockFoundationModelParams & Partial<VideoGenerationParams>;

  constructor(
    modelId: ModelID,
    params?: BedrockFoundationModelParams & Partial<VideoGenerationParams>
  ) {
    this.modelId = modelId;
    this.rawResponse = params?.rawResponse ?? false;
    this.params = params;

    this.client =
      params?.client ??
      new BedrockRuntimeClient({
        region: params?.region,
        credentials: params?.credentials,
      });
  }

  public async generateVideo(
    prompt: string,
    options: VideoGenerationParams
  ): Promise<{ uri?: string; response: unknown } | any> {
    if (!options.seed) {
      options.seed = Math.round(Math.random() * 2 ** 31);
    }
    const response = await this._generateRaw(prompt, options);
    if (this.rawResponse || (options && options.rawResponse)) {
      return response;
    } else {
      return this.getResults(response);
    }
  }

  private async _generateRaw(
    prompt: string,
    options: VideoGenerationParams
  ): Promise<any> {
    const body = this.prepareBody(prompt, options);
    const command = new StartAsyncInvokeCommand({
      modelId: this.modelId,
      modelInput: body,
      outputDataConfig: {
        s3OutputDataConfig: { s3Uri: options.s3Uri ?? this.params?.s3Uri },
      },
    });
    const result = await this.client.send(command);
    return result.invocationArn;
  }

  abstract prepareBody(prompt: string, options: VideoGenerationParams): string;

  abstract getResults(
    body: any,
    timeout?: number
  ): Promise<{ uri?: string; response: unknown }>;
}
