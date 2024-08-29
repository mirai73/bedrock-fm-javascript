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

export interface StableDiffusionParams {
  sampler?: string;
  samples?: number;
  style_preset?: StylePreset;
  clip_guidance_preset?: ClipGuidancePreset;
  extras?: any;
  imageSize?: ImageSize;
}

export class StableDiffusionXL extends BedrockImageGenerationModel {
  override getResults(body: any): string[] {
    return body.artifacts.map(
      (a: { seed: number; base64: string }) =>
        `data:image/png;base64,${a.base64}`
    );
  }

  override prepareBody(
    prompt: string,
    options: ImageGenerationParams & StableDiffusionParams
  ): string {
    if (options.imageSize) {
      const [width, heigth] = options.imageSize.split("x");
      options.width = parseInt(width!);
      options.height = parseInt(heigth!);
    }
    const textPrompts = this.parsePrompt(prompt);
    const body = {
      text_prompts: textPrompts,
      ...options,
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
