import {
  BedrockImageGenerationModel,
  ImageGenerationParams,
} from "./bedrock_image_generation";

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
  override prepareBody(
    prompt: string,
    options: ImageGenerationParams & StableDiffusion3Params
  ): string {
    if (!options.seed) {
      options.seed = Math.round(Math.random() * 2 ** 31);
    }
    const body = {
      prompt: prompt,
      mode: "text-to-image",
      ...(({
        seed,
        aspect_ratio,
        negative_prompt,
        style_preset,
      }: ImageGenerationParams & StableDiffusion3Params) => ({
        seed,
        aspect_ratio,
        negative_prompt,
        style_preset,
      }))(options),
    };
    return JSON.stringify(body);
  }
}
