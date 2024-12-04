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

type TaskType =
  | "COLOR_GUIDED_GENERATION"
  | "IMAGE_VARIATION"
  | "OUTPAINTING"
  | "INPAINTING"
  | "BACKGROUND_REMOVAL"
  | "TEXT_IMAGE";

export interface NovaParams {
  image?: string;
  numberOfImages?: number;
  conditionImage?: string;
  quality?: "standard" | "premium";
}
/**
 * NovaCanvas
 *
 * This class uses prompt keywords to steer the different modalities of Nova Canvas
 *
 * NEGATIVE(<text>): defines the negative text. Can be used in all modalities
 *
 * N:<number>: defines the numbe of images to generate
 *
 * SIMILARITY:<float> : triggers the generation of similar images to the reference one. An image must be provided
 *
 * CONDITION(CANNY_EDGES|SEGMENTATION:<strength>): creates an images conditioned on another image with a given strength.
 *      An image must be provided
 *
 * REMOVE_BACKGROUD: removes the background of the image
 *
 * MASK(<text>): define a mask prompt and trigger the INPAINTING mode.
 *      If no other prompt is defined it will remove the object described by the mask, otherwise will replace it
 *      An image must be provided
 *
 * OUTPAINT(DEFAULT|PRECISE): truggers outpainting more and must be used with MASK. An image must be also provided
 *
 * COLORS(<#000000 #AABBCC>): defines a list of colors to guide the image generation. If specified will override any other mode
 *  an image must be provided
 */
export class NovaCanvas extends BedrockImageGenerationModel {
  override getResults(body: any): string[] {
    return body.images.map((a: string) => `data:image/png;base64,${a}`);
  }

  override async generateImage(
    prompt: string,
    options: ImageGenerationParams & NovaParams
  ): Promise<string[]> {
    return await super.generateImage(prompt, options);
  }

  determineType(elements: ReturnType<typeof this.getPromptElements>): TaskType {
    if (elements.colors) {
      return "COLOR_GUIDED_GENERATION";
    }
    if (elements.similarity) {
      return "IMAGE_VARIATION";
    }
    if (elements.outpaint) {
      return "OUTPAINTING";
    }
    if (elements.mask) {
      return "INPAINTING";
    }
    if (elements.removeBackground) {
      return "BACKGROUND_REMOVAL";
    }
    return "TEXT_IMAGE";
  }

  // @ts-ignore
  getBodyFromPrompt(
    prompt: string,
    image?: string
  ): { body: any; numberOfImages: number } {
    const elements = this.getPromptElements(prompt);
    const taskType = this.determineType(elements);
    if (taskType === "TEXT_IMAGE") {
      if (elements.conditionImage) {
        return {
          body: {
            taskType,
            textToImageParams: {
              text: elements.instructions,
              negativeText: elements.negative,
              controlMode: elements.conditionImage.split(":")[0],
              controlStrength: parseFloat(
                elements.conditionImage.split(":")?.at(1) ?? "0"
              ),
              conditionImage: image,
            },
          },
          numberOfImages: parseFloat(elements.numberOfImages ?? "1"),
        };
      }
      return {
        body: {
          taskType,
          textToImageParams: {
            text: elements.instructions,
            negativeText: elements.negative,
          },
        },
        numberOfImages: parseFloat(elements.numberOfImages ?? "1"),
      };
    }
    if (taskType === "IMAGE_VARIATION") {
      return {
        body: {
          taskType,
          imageVariationParams: {
            text: elements.instructions,
            negativeText: elements.negative,
            similarityStrength: parseFloat(elements.similarity ?? "0.5"),
            images: [image],
          },
        },
        numberOfImages: parseFloat(elements.numberOfImages ?? "1"),
      };
    }
    if (taskType === "INPAINTING") {
      return {
        body: {
          taskType,
          inPaintingParams: {
            maskPrompt: elements.mask,
            negativeText: elements.negative,
            text: elements.instructions,
            image,
          },
        },
        numberOfImages: parseFloat(elements.numberOfImages ?? "1"),
      };
    }
    if (taskType === "OUTPAINTING") {
      return {
        body: {
          taskType,
          outPaintingParams: {
            text: elements.instructions,
            maskPrompt: elements.mask,
            negativeText: elements.negative,
            image,
            outPaintingMode:
              elements.outpaint === "OUTPAINT" ? "DEFAULT" : elements.outpaint,
          },
        },
        numberOfImages: parseFloat(elements.numberOfImages ?? "1"),
      };
    }
    if (taskType === "COLOR_GUIDED_GENERATION") {
      if (
        elements.colors
          ?.split(" ")
          .map((c) => c.match(/#[A-F0-9]{6}/)?.at(0))
          .filter((x) => x === undefined) ??
        [].length > 0
      ) {
        throw new Error(`Invalid color ${elements.colors}`);
      }

      return {
        body: {
          taskType,
          colorGuidedGenerationParams: {
            text: elements.instructions,
            colors: elements.colors?.split(" ").map((c) => c.trim()),
            negativeText: elements.negative,
            referenceImage: image,
          },
        },
        numberOfImages: parseFloat(elements.numberOfImages ?? "1"),
      };
    }
    if (taskType === "BACKGROUND_REMOVAL") {
      return {
        body: {
          taskType,
          backgroundRemovalParams: {
            image,
          },
        },
        numberOfImages: parseFloat(elements.numberOfImages ?? "1"),
      };
    }
    throw new Error("should never happen");
  }

  getPromptElements(prompt: string) {
    const negative = prompt.match(/\bNEGATIVE\(([^\)]+)\)/);
    const mask = prompt.match(/\bMASK\(([^\)]+)\)/);
    const colors = prompt.match(/\bCOLORS\(([^\)]+)\)/);
    const removeBackground = prompt.match(/\bREMOVE_BACKGROUND\b/);
    const conditionImage = prompt.match(
      /\bCONDITION\(((CANNY_EDGE|SEGMENTATION):[01]\.?\d{0,2})\)/
    );
    const similarity = prompt.match(/\bSIMILAR:([01]\.?\d{0,2})\b/);
    const numberOfImages = prompt.match(/\bN:([1-5])\b/);
    const outpaintWithType = prompt.match(/\bOUTPAINT\((DEFAULT|PRECISE)\)/);
    const outpaintDefault = prompt.match(/\bOUTPAINT\b/);
    const instructions = prompt
      .replace(negative?.at(0) ?? "", "")
      .replace(mask?.at(0) ?? "", "")
      .replace(colors?.at(0) ?? "", "")
      .replace(removeBackground?.at(0) ?? "", "")
      .replace(conditionImage?.at(0) ?? "", "")
      .replace(similarity?.at(0) ?? "", "")
      .replace(numberOfImages?.at(0) ?? "", "")
      .replace(outpaintWithType?.at(0) ?? "", "")
      .replace(outpaintDefault?.at(0) ?? "", "")
      .replaceAll(/\s+/g, " ")
      .trim();

    return {
      negative: negative?.at(1),
      mask: mask?.at(1),
      colors: colors?.at(1),
      removeBackground: removeBackground?.at(0),
      conditionImage: conditionImage?.at(1),
      similarity: similarity?.at(1),
      numberOfImages: numberOfImages?.at(1),
      outpaint: outpaintWithType?.at(1) ?? outpaintDefault?.at(0),
      instructions: instructions.length > 0 ? instructions : undefined,
    };
  }

  override prepareBody(
    prompt: string,
    options: ImageGenerationParams & NovaParams
  ): string {
    // @ts-ignore
    const inferredBody = this.getBodyFromPrompt(
      prompt.replace("\n", " "),
      options.image?.split(",")?.at(1)
    );
    const body = {
      ...inferredBody.body,
      imageGenerationConfig: {
        numberOfImages: options.numberOfImages ?? inferredBody.numberOfImages,
        height: options.height,
        width: options.width,
        cfgScale: options.scale,
        seed: options.seed,
      },
    };
    return JSON.stringify(body);
  }
}
