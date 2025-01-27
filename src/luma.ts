import {
  GetAsyncInvokeCommand,
  GetAsyncInvokeCommandOutput,
} from "@aws-sdk/client-bedrock-runtime";
import {
  BedrockVideoGenerationModel,
  VideoGenerationParams,
} from "./bedrock_video_generation";

export type RayAspectRatio =
  | "1:1"
  | "5:4"
  | "3:2"
  | "16:9"
  | "21:9"
  | "4:5"
  | "2:3"
  | "9:16"
  | "9:21";

export type RayResolution = "720p" | "540p";

export interface RayParams {
  loop?: boolean;
  aspectRatio?: RayAspectRatio;
  resolution?: RayResolution;
}

export class Ray extends BedrockVideoGenerationModel {
  override async getResults(
    invocationArn: any,
    timeout?: number
  ): Promise<{ uri?: string; response: GetAsyncInvokeCommandOutput }> {
    console.log(invocationArn);
    return new Promise(async (res, rej) => {
      if (timeout) {
        setTimeout(() => {
          rej({ message: "Timeout", response });
        }, timeout);
      }
      let response = await this.client.send(
        new GetAsyncInvokeCommand({ invocationArn: invocationArn })
      );
      while (response.status === "InProgress") {
        await new Promise((r) => setTimeout(r, 1000));
        response = await this.client.send(
          new GetAsyncInvokeCommand({ invocationArn: invocationArn })
        );
      }
      if (response.status === "Completed") {
        res({
          uri: response.outputDataConfig?.s3OutputDataConfig?.s3Uri,
          response,
        });
      } else rej({ message: response.failureMessage, response });
    });
  }

  override prepareModelInput(
    prompt: string,
    options: VideoGenerationParams & RayParams
  ): any {
    const body = {
      prompt,
      duration: `${options.durationSeconds ?? 5}s`,
      loop: options.loop,
      aspect_ratio: options.aspectRatio,
      resolution: options.resolution,
    };
    return body;
  }

  public override generateVideo<T extends VideoGenerationParams & RayParams>(
    prompt: string,
    options: T
  ): Promise<{ uri?: string; response: unknown } | any> {
    return super.generateVideo(prompt, options);
  }
}
