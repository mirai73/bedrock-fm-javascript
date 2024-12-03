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
    options: ImageGenerationParams & TitanImageGeneratorParams
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

interface NovaTextImageParams {
  taskType?: "TEXT_IMAGE";
  textToImageParams?: {
    negativeText?: string;
    numberOfImages?: number;
    conditionImage?: string;
  };
}

// interface NovaColorGuidedParams {
//   taskType: "COLOR_GUIDED_GENERATION";
//   colorGuidedGenerationParams: {
//     colors: string[];
//     text: string;
//     negativeText: string;
//   };
// }

// interface NovaImageVariationParams {
//   taskType: "IMAGE_VARIATION";
//   imageVariationParams: {
//     images: string[];
//     similarityStrength: number;
//     text: string;
//     negativeText: string;
//   };
// }

export type NovaParams = NovaTextImageParams;
// | NovaColorGuidedParams
// | NovaImageVariationParams;

export class NovaCanvas extends BedrockImageGenerationModel {
  override getResults(body: any): string[] {
    return body.images.map((a: string) => `data:image/png;base64,${a}`);
  }

  override prepareBody(
    prompt: string,
    options: ImageGenerationParams & NovaParams
  ): string {
    const body = {
      taskType: "TEXT_IMAGE",
      textToImageParams: {
        text: prompt,
        negativeText: options.textToImageParams?.negativeText,
      },
      imageGenerationConfig: {
        numberOfImages: options.textToImageParams?.numberOfImages,
        height: options.height,
        width: options.width,
        cfgScale: options.scale,
        seed: options.seed,
      },
    };
    return JSON.stringify(body);
  }
}
