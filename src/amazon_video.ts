import {
  GetAsyncInvokeCommand,
  GetAsyncInvokeCommandOutput,
} from "@aws-sdk/client-bedrock-runtime";
import {
  BedrockVideoGenerationModel,
  VideoGenerationParams,
} from "./bedrock_video_generation";

export interface NovaReelParams {
  fps?: 24;
  dimesion?: "1280x720";
  seed?: number;
  image?: string;
}

export class NovaReel extends BedrockVideoGenerationModel {
  override async getResults(
    invocationArn: any,
    timeout?: number,
  ): Promise<{ uri?: string; response: GetAsyncInvokeCommandOutput }> {
    console.log(invocationArn);
    return new Promise(async (res, rej) => {
      if (timeout) {
        setTimeout(() => {
          rej({ message: "Timeout", response });
        }, timeout);
      }
      let response = await this.client.send(
        new GetAsyncInvokeCommand({ invocationArn: invocationArn }),
      );
      while (response.status === "InProgress") {
        await new Promise((r) => setTimeout(r, 1000));
        response = await this.client.send(
          new GetAsyncInvokeCommand({ invocationArn: invocationArn }),
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
    options: VideoGenerationParams & NovaReelParams,
  ): any {
    if (!options.seed) {
      options.seed = Math.round(Math.random() * 2 ** 31);
    }
    const body = {
      taskType: "TEXT_VIDEO",
      textToVideoParams: {
        text: prompt,
        images: options.image
          ? [
              {
                format: options.image
                  ?.split(";")[0]
                  ?.split(":")
                  ?.at(1)
                  ?.split("/")
                  .at(1),
                source: { bytes: options.image?.split(",").at(1) },
              },
            ]
          : undefined,
      },
      videoGenerationConfig: {
        durationSeconds: 6,
        fps: 24,
        dimension: "1280x720",
        seed: options.seed,
      },
    };
    return body;
  }

  public override generateVideo<
    T extends VideoGenerationParams & NovaReelParams,
  >(
    prompt: string,
    options: T,
  ): Promise<{ uri?: string; response: unknown } | any> {
    return super.generateVideo(prompt, options);
  }
}
