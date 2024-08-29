import {
  BedrockImageGenerationModel,
  ImageGenerationParams,
} from "./bedrock_image_generation";

export interface TitanImageGeneratorParams {
  negativeText?: string;
  numberOfImages?: number;
}

export class TitanImageGenerator extends BedrockImageGenerationModel {
  override getResults(body: any): string[] {
    return body.images.map((a: string) => `data:image/png;base64,${a}`);
  }

  override prepareBody(
    prompt: string,
    options: ImageGenerationParams & TitanImageGeneratorParams,
  ): string {
    const body = {
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: prompt,
        negativeText: options.negativeText,
      },
      imageGenerationConfig: {
        numberOfImages: options.numberOfImages,
        height: options.height,
        width: options.width,
        cfgScale: options.scale,
        seed: options.seed,
      },
    };
    return JSON.stringify(body);
  }
}
