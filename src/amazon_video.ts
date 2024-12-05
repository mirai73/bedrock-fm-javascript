import { GetAsyncInvokeCommand } from "@aws-sdk/client-bedrock-runtime";
import {
  BedrockVideoGenerationModel,
  VideoGenerationParams,
} from "./bedrock_video_generation";

export interface NovaReelParams {}

export class NovaReel extends BedrockVideoGenerationModel {
  override async getResults(
    invocationArn: any,
    timeout?: number
  ): Promise<string | undefined> {
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
        await new Promise((r) => setTimeout(r, 1));
        response = await this.client.send(
          new GetAsyncInvokeCommand({ invocationArn: invocationArn })
        );
      }
      if (response.status === "Completed") {
        res(response.outputDataConfig?.s3OutputDataConfig?.s3Uri);
      } else rej({ message: response.failureMessage, response });
    });
  }

  override prepareBody(
    prompt: string,
    options: VideoGenerationParams & NovaReelParams
  ): any {
    const body = {
      taskType: "TEXT_VIDEO",
      textToVideoParams: {
        text: prompt,
        images: [
          {
            format: options.image
              ?.split(";")[0]
              ?.split(":")
              ?.at(1)
              ?.split("/")
              .at(1),
            source: { bytes: options.image?.split(",").at(1) },
          },
        ],
      },
      videoGenerationConfig: {
        durationSeconds: 6,
        fps: 24,
        dimension: "1280x720",
        seed: options.seed ?? this.params?.seed,
      },
    };
    return body;
  }
}
