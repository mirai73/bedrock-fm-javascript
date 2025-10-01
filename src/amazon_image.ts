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
        height: options.size?.height,
        width: options.size?.width,
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
  | "TEXT_IMAGE"
  | "VIRTUAL_TRY_ON";

export interface NovaParams {
  images?: string[];
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
 *
 * It also provide separare inference parameter controls via textual prompts:
 *
 * <instructions> | size:320x320, seed:4, scale:4, n:6
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
    if (elements.mask && !elements.virtualTryOn) {
      return "INPAINTING";
    }
    if (elements.removeBackground) {
      return "BACKGROUND_REMOVAL";
    }
    if (elements.virtualTryOn) {
      return "VIRTUAL_TRY_ON";
    }
    return "TEXT_IMAGE";
  }

  // @ts-ignore
  getBodyFromPrompt(prompt: string, images?: (string | undefined)[]): any {
    const elements = this.getPromptElements(prompt);
    const taskType = this.determineType(elements);
    if (taskType === "TEXT_IMAGE") {
      if (elements.conditionImage) {
        return {
          taskType,
          textToImageParams: {
            text: elements.instructions,
            negativeText: elements.negative,
            controlMode: elements.conditionImage.split(":")[0],
            controlStrength: parseFloat(
              elements.conditionImage.split(":")?.at(1) ?? "0"
            ),
            conditionImage: images?.at(0),
            style: elements.style,
          },
        };
      }
      return {
        taskType,
        textToImageParams: {
          text: elements.instructions,
          negativeText: elements.negative,
          style: elements.style,
        },
      };
    }
    if (taskType === "IMAGE_VARIATION") {
      return {
        taskType,
        imageVariationParams: {
          text: elements.instructions,
          negativeText: elements.negative,
          similarityStrength: parseFloat(elements.similarity ?? "0.5"),
          images: images,
        },
      };
    }
    if (taskType === "INPAINTING") {
      return {
        taskType,
        inPaintingParams: {
          maskPrompt: elements.mask,
          negativeText: elements.negative,
          text: elements.instructions,
          image: images?.at(0),
        },
      };
    }
    if (taskType === "OUTPAINTING") {
      return {
        taskType,
        outPaintingParams: {
          text: elements.instructions,
          maskPrompt: elements.mask,
          negativeText: elements.negative,
          image: images?.at(0),
          outPaintingMode:
            elements.outpaint === "OUTPAINT" ? "DEFAULT" : elements.outpaint,
        },
      };
    }
    if (taskType === "COLOR_GUIDED_GENERATION") {
      // const invalid_colors =
      //   elements.colors
      //     ?.toUpperCase()
      //     ?.split(" ")
      //     .map((c) => c.match(/#[A-F0-9]{6}/g)?.at(0))
      //     .filter((x) => x === undefined) ?? [];
      // if (invalid_colors.length > 0) {
      //   throw new Error(
      //     `Invalid colors /${invalid_colors}/ ${elements.colors
      //       ?.toUpperCase()
      //       ?.split(" ")}`
      //   );
      // }

      return {
        taskType,
        colorGuidedGenerationParams: {
          text: elements.instructions,
          colors: elements.colors?.split(" ").map((c) => c.trim()),
          negativeText: elements.negative,
          referenceImage: images?.at(0),
        },
      };
    }
    if (taskType === "BACKGROUND_REMOVAL") {
      return {
        taskType,
        backgroundRemovalParams: {
          image: images?.at(0),
        },
      };
    }
    if (taskType === "VIRTUAL_TRY_ON") {
      return {
        taskType,
        virtualTryOnParams: {
          sourceImage: images?.at(0),
          referenceImage: images?.at(1),
          maskType: elements.maskType,
          garmentBasedMask:
            elements.maskType === "GARMENT"
              ? {
                  maskShape: elements.maskShape ?? "DEFAULT",
                  garmentClass: elements.garmentClass,
                  garmentStyling: elements.garmentStyling,
                }
              : undefined,
          promptBasedMask:
            elements.maskType === "PROMPT"
              ? {
                  maskShape: elements.maskShape ?? "DEFAULT",
                  maskPrompt: elements.mask,
                }
              : undefined,
          mergeStyle: elements.mergeStyle,
          maskExclusions: {
            preserveBodyPose: elements.preserveBodyPose,
            preserveHands: elements.preserveHands,
            preserveFace: elements.preserveFace,
          },
        },
      };
    }
    throw new Error("should never happen");
  }

  getPromptElements(prompt: string) {
    const negative = prompt.match(/\bNEGATIVE\(([^\)]+)\)/);
    const mask = prompt.match(/\bMASK\(([^\)]+)\)/);
    const maskType = prompt.match(/\bMASK_TYPE\((IMAGE|GARMENT|PROMPT)\)/);
    const style = prompt.match(/\bSTYLE\(([^\)]+)\)/);
    /* "UPPER_BODY" | "LOWER_BODY" |
        "FULL_BODY" | "FOOTWEAR" | "LONG_SLEEVE_SHIRT" |
        "SHORT_SLEEVE_SHIRT" | "NO_SLEEVE_SHIRT" |
        "OTHER_UPPER_BODY" | "LONG_PANTS" | "SHORT_PANTS" |
        "OTHER_LOWER_BODY" | "LONG_DRESS" | "SHORT_DRESS" |
        "FULL_BODY_OUTFIT" | "OTHER_FULL_BODY" | "SHOES" |
        "BOOTS" | "OTHER_FOOTWEAR", */
    const garmentClass = prompt.match(/\bGARMENT_CLASS\(([^\)]+)\)/);
    const colors = prompt.match(/\bCOLORS\(([^\)]+)\)/);
    const removeBackground = prompt.match(/\bREMOVE_BACKGROUND\b/);
    const virtualTryOn = prompt.match(/\bVIRTUAL_TRY_ON\b/);
    const conditionImage = prompt.match(
      /\bCONDITION\(((CANNY_EDGE|SEGMENTATION):[01]\.?\d{0,2})\)/
    );
    const similarity = prompt.match(/\bSIMILAR:([01]\.?\d{0,2})\b/);
    const outpaintWithType = prompt.match(/\bOUTPAINT\((DEFAULT|PRECISE)\)/);
    const outpaintDefault = prompt.match(/\bOUTPAINT\b/);
    const mergeStyle = prompt.match(
      /\bMERGE_STYLE\((BALANCED|SEAMLESS|DEFAULT)\)/
    ); // "BALANCED" | "SEAMLESS" | "DETAILED"
    const maskShape = prompt.match(
      /\bMASK_SHAPE\((BOUNDING_BOX|CONTOUR|DEFAULT)\)/
    ); // BOUNDING_BOX" | "CONTOUR" | "DEFAULT"
    const preserveBodyPose = prompt.match(/\bBODY_(ON|OFF)/);
    const preserveHands = prompt.match(/\bHANDS_(ON|OFF)/);
    const preserveFace = prompt.match(/\bFACE_(ON|OFF)/);
    const longSleeveStyle = prompt.match(/\bSLEEVE_(DOWN|UP)/);
    const tuckingStyle = prompt.match(/\b(UNTUCKED|TUCKED)/);
    const outerLayerStyle = prompt.match(/\bOUTER_(CLOSED|OPEN)/);

    const instructions = prompt
      .replace(negative?.at(0) ?? "", "")
      .replace(mask?.at(0) ?? "", "")
      .replace(style?.at(0) ?? "", "")
      .replace(garmentClass?.at(0) ?? "", "")
      .replace(colors?.at(0) ?? "", "")
      .replace(removeBackground?.at(0) ?? "", "")
      .replace(virtualTryOn?.at(0) ?? "", "")
      .replace(conditionImage?.at(0) ?? "", "")
      .replace(similarity?.at(0) ?? "", "")
      .replace(outpaintWithType?.at(0) ?? "", "")
      .replace(outpaintDefault?.at(0) ?? "", "")
      .replace(mergeStyle?.at(0) ?? "", "")
      .replace(maskType?.at(0) ?? "", "")
      .replace(preserveHands?.at(0) ?? "", "")
      .replace(maskShape?.at(0) ?? "", "")
      .replace(preserveBodyPose?.at(0) ?? "", "")
      .replace(preserveFace?.at(0) ?? "", "")
      .replace(longSleeveStyle?.at(0) ?? "", "")
      .replace(outerLayerStyle?.at(0) ?? "", "")
      .replace(tuckingStyle?.at(0) ?? "", "")
      .replaceAll(/\s+/g, " ")
      .trim();

    let garmentStyling: undefined | any = {
      longSleeveStyle: longSleeveStyle?.at(0),
      tuckingStyle: tuckingStyle?.at(0),
      outerLayerStyle: outerLayerStyle?.at(1),
    };
    if (Object.values(garmentStyling).filter((x) => !!x).length === 0) {
      garmentStyling = undefined;
    }
    return {
      negative: negative?.at(1),
      mask: mask?.at(1),
      style: style?.at(1),
      garmentClass: garmentClass?.at(1),
      colors: colors?.at(1),
      removeBackground: removeBackground?.at(0),
      virtualTryOn: virtualTryOn?.at(0),
      conditionImage: conditionImage?.at(1),
      similarity: similarity?.at(1),
      outpaint: outpaintWithType?.at(1) ?? outpaintDefault?.at(0),
      instructions: instructions.length > 0 ? instructions : undefined,
      mergeStyle: mergeStyle?.at(1),
      maskType: maskType?.at(1),
      preserveHands: preserveHands?.at(1) ?? "DEFAULT",
      preserveBodyPose: preserveBodyPose?.at(1) ?? "DEFAULT",
      preserveFace: preserveFace?.at(1) ?? "DEFAULT",
      garmentStyling,
      maskShape: maskShape?.at(1),
    };
  }

  capSizes(x: number, y: number): [number, number] {
    if (x < 320) {
      y = (y * 320) / x;
      x = 320;
    }
    if (y > 4096) {
      x = (x * y) / 4096;
      y = 4096;
    }
    return [x, y];
  }

  getConfigFromString(config: string) {
    const elements = config.split(",");
    let c: any = {};

    const keyMap = (key: string): string => {
      const k = {
        n: "numberOfImages",
        seed: "seed",
        w: "width",
        h: "height",
        scale: "cfgScale",
      }[key];
      if (k === undefined) {
        throw new Error("not a valid key");
      }
      return k;
    };

    elements.forEach((e) => {
      const [key, val] = e.replaceAll(/\s/g, "").trim().split(":");
      if (key === undefined || val === undefined) {
        throw new Error(`Invalid config element ${e}`);
      }
      if (isNaN(parseInt(val))) {
        throw new Error(`Value is not an integer in element ${e}`);
      }
      if (!["n", "size", "seed", "scale"].includes(key)) {
        throw new Error(`Invalid key in element ${e}`);
      }
      if (key === "size") {
        const [width, height] = val.split("x").map((v) => {
          const x = parseInt(v);
          if (isNaN(x)) throw new Error(`Invalid size specified ${val}`);
          return x;
        });

        c["width"] = width;
        c["height"] = height;
      } else {
        c[keyMap(key)] = parseInt(val);
      }
    });
    return c;
  }

  override prepareBody(
    prompt: string,
    options: ImageGenerationParams & NovaParams
  ): string {
    const [promptInstructions, inferenceConfigString] = prompt.split("|");
    let inferenceConfig = {
      numberOfImages: options.numberOfImages,
      height: options.size?.height,
      width: options.size?.width,
      cfgScale: options.scale,
      seed: options.seed,
    };
    if (inferenceConfigString) {
      inferenceConfig = {
        ...inferenceConfig,
        ...this.getConfigFromString(inferenceConfigString),
      };
    }
    const inferredBody = this.getBodyFromPrompt(
      (promptInstructions ?? prompt).replaceAll("\n", " "),
      options.images?.map((im) => im.split(",")?.at(1))
    );

    if (options.size) {
      let { height, width } = options.size;
      if (height > width && height / width > 4) {
        height = width * 4;
      }
      if (height < width && width / height > 4) {
        width = height * 4;
      }

      if (width <= height) {
        [width, height] = this.capSizes(width, height);
      } else {
        [height, width] = this.capSizes(height, width);
      }
      height = Math.floor(height / 16) * 16;
      width = Math.floor(width / 16) * 16;
    }
    const body = {
      ...inferredBody,
      imageGenerationConfig: inferenceConfig,
    };
    if (!body.imageGenerationConfig.seed) {
      body.imageGenerationConfig.seed = Math.round(Math.random() * 2 ** 31);
    }
    return JSON.stringify(body);
  }
}
