import {
  BedrockImageGenerationModel,
  ImageGenerationParams,
} from "./bedrock_image_generation";
import { ImageModels } from "./models";

export type StylePreset =
  | "3d-model"
  | "analog-film"
  | "anime"
  | "cinematic"
  | "comic-book"
  | "digital-art"
  | "enhance"
  | "fantasy-art"
  | "isometric"
  | "line-art"
  | "low-poly"
  | "modeling-compound"
  | "neon-punk"
  | "origami"
  | "photographic"
  | "pixel-art"
  | "tile-texture";

const validStyles = [
  "3d-model",
  "analog-film",
  "anime",
  "cinematic",
  "comic-book",
  "digital-art",
  "enhance",
  "fantasy-art",
  "isometric",
  "line-art",
  "low-poly",
  "modeling-compound",
  "neon-punk",
  "origami",
  "photographic",
  "pixel-art",
  "tile-texture",
];

const validAspectRatios = [
  "1:1",
  "16:9",
  "21:9",
  "2:3",
  "3:2",
  "4:5",
  "5:4",
  "9:16",
  "9:21",
];

export type ImageSize =
  | "1024x1024"
  | "1152x896"
  | "896x1152"
  | "1216x832"
  | "1344x768"
  | "768x1344"
  | "1536x640"
  | "640x1536";

export type ClipGuidancePreset =
  | "FAST_BLUE"
  | "FAST_GREEN"
  | "NONE"
  | "SIMPLE"
  | "SLOW"
  | "SLOWER"
  | "SLOWEST";

export type Sampler =
  | "DDIM"
  | "DDPM"
  | "K_DPMPP_2M"
  | "K_DPMPP_2S_ANCESTRAL"
  | "K_DPM_2"
  | "K_DPM_2_ANCESTRAL"
  | "K_EULER"
  | "K_EULER_ANCESTRAL"
  | "K_HEUN"
  | "K_LMS";

export interface StableDiffusionXLParams {
  sampler?: string;
  samples?: number;
  style_preset?: StylePreset;
  clip_guidance_preset?: ClipGuidancePreset;
  extras?: any;
  imageSize?: ImageSize;
}

export type AspectRatio =
  | "16:9"
  | "1:1"
  | "21:9"
  | "2:3"
  | "3:2"
  | "4:5"
  | "5:4"
  | "9:16"
  | "9:21";

export interface StableDiffusion3Params {
  aspect_ratio?: AspectRatio;
  negative_prompt?: string;
  style_preset?: StylePreset;
  image?: string;
}

export class StableDiffusionXL extends BedrockImageGenerationModel {
  override getResults(body: any): string[] {
    return body.artifacts.map(
      (a: { seed: number; base64: string }) =>
        `data:image/png;base64,${a.base64}`
    );
  }

  override async generateImage(
    prompt: string,
    options: ImageGenerationParams & StableDiffusionXLParams
  ): Promise<string[]> {
    return super.generateImage(prompt, options);
  }

  override prepareBody(
    prompt: string,
    options: ImageGenerationParams & StableDiffusionXLParams
  ): string {
    let { size, ...otherOptions } = options;
    if (otherOptions.imageSize) {
      const [width, heigth] = otherOptions.imageSize.split("x");
      size = { width: parseInt(width!), height: parseInt(heigth!) };
      let { imageSize, ...remainingOptions } = otherOptions;
      otherOptions = remainingOptions;
    }

    const textPrompts = this.parsePrompt(prompt);
    const body = {
      text_prompts: textPrompts,
      width: size?.width,
      height: size?.height,
      ...otherOptions,
    };
    return JSON.stringify(body);
  }

  private extractWeights(
    prompt?: string,
    stdWeight: number = 1
  ): { text?: string; weight?: number }[] {
    if (!prompt) {
      return [];
    }
    const prompts = prompt.match(/[^\(^\)]+|\([\w\s]+\:\s*\d+\.?\d*\s*\)/g);
    if (!prompts || prompts.length == 0) {
      throw new Error("Invalid prompt for SDXL");
    }
    const parts = prompts.map((p) => {
      if (p[0] === "(") {
        p = p.substring(1, p.length - 1);
        const [text, weight] = p.split(":");
        return {
          text: text?.trim(),
          weight: parseFloat(weight ?? "1") * stdWeight,
        };
      }
      return { text: p, weight: stdWeight };
    });

    const stdParts = parts.filter((p) => p.weight == stdWeight);

    let agg = { text: "", weight: stdWeight };
    stdParts.forEach((a) => {
      agg.text += a.text;
    });
    agg.text = agg.text.trim();
    const aggParts = [agg, ...parts.filter((p) => p.weight !== stdWeight)];

    return aggParts;
  }

  private parsePrompt(prompt: string): { text?: string; weight?: number }[] {
    const [positive, negative] = prompt.split("NEGATIVE:").map((x) => x.trim());
    return this.extractWeights(positive).concat(
      this.extractWeights(negative, -1)
    );
  }
}

export class StableDiffusion3 extends BedrockImageGenerationModel {
  override getResults(body: any): string[] {
    return [`data:image/png;base64,${body.images[0]}`];
  }

  override async generateImage(
    prompt: string,
    options: ImageGenerationParams & StableDiffusion3Params
  ): Promise<string[]> {
    return super.generateImage(prompt, options);
  }

  getPromptElements(prompt: string) {
    const negative = prompt.match(/\bNEGATIVE\(([^\)]+)\)/);

    const instructions = prompt
      .replace(negative?.at(0) ?? "", "")
      .replaceAll(/\s+/g, " ")
      .trim();

    return {
      negative: negative?.at(1),
      instructions: instructions.length > 0 ? instructions : undefined,
    };
  }

  getConfigFromString(config: string) {
    const elements = config.split(",");
    let c: any = {};

    elements.forEach((e) => {
      const [key, val] = e.replaceAll(/\s/g, "").trim().split("=");
      if (key === undefined || val === undefined) {
        throw new Error(`Invalid config element ${e}`);
      }
      if (isNaN(parseInt(val))) {
        throw new Error(`Value is not an integer in element ${e}`);
      }
      if (
        ![
          "style_preset",
          "seed",
          "aspect_ratio",
          "cfg_scale",
          "strength",
        ].includes(key)
      ) {
        throw new Error(`Invalid key in element ${e}`);
      }
      if (key === "aspect_ratio") {
        if (!validAspectRatios.includes(val)) {
          throw new Error(
            `Invalid aspect ratio ${val}. Should be one of ${validAspectRatios.join(", ")}`
          );
        }
      }
      if (key === "style_preset") {
        if (!validStyles.includes(val)) {
          throw new Error(
            `Invalid style ${val}. Should be one of ${validStyles.join(", ")}`
          );
        }
      }
      if (["cfg_scale", "strength"].includes(key)) {
        c[key] = parseFloat(val);
      } else if (key === "seed") {
        c[key] = parseInt(val);
      } else {
        c[key] = val;
      }
    });
    return c;
  }

  override prepareBody(
    prompt: string,
    options: ImageGenerationParams & StableDiffusion3Params
  ): string {
    if (!options.seed) {
      options.seed = Math.round(Math.random() * 2 ** 31);
    }
    const [promptInstructions, inferenceConfigString] = prompt.split("|");
    let inferenceConfig = {
      aspect_ratio: options.aspect_ratio,
      style_preset: options.style_preset,
      seed: options.seed,
    };
    if (inferenceConfigString) {
      inferenceConfig = {
        ...inferenceConfig,
        ...this.getConfigFromString(inferenceConfigString),
      };
    }
    const elements = this.getPromptElements(
      (promptInstructions ?? prompt).replaceAll("\n", " ")
    );

    const body = {
      prompt: elements.instructions ?? prompt,
      mode:
        this.modelId === ImageModels.STABILITY_SD3_LARGE_V1_0 && options.image
          ? "image-to-image"
          : "text-to-image",
      negative_prompt: elements.negative ?? options.negative_prompt,
      image:
        this.modelId === ImageModels.STABILITY_SD3_LARGE_V1_0
          ? options.image
          : undefined,
      ...inferenceConfig,
    };

    return JSON.stringify(body);
  }
}
