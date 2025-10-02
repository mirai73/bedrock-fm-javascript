import { Claude, ClaudeParams } from "./anthropic";
import { Jamba } from "./ai21";
import { Ray, RayAspectRatio, RayParams, RayResolution } from "./luma";
import { Titan, Nova } from "./amazon";
import { Command, CommandR, CommandParams, CommandRParams } from "./cohere";
import { Llama3Chat } from "./meta";
import { GptOss, GptOssParams } from "./openai";
import { Qwen3, Qwen3Params } from "./qwen";
import { NovaCanvas, NovaParams } from "./amazon_image";
import {
  StableDiffusionXL,
  StableDiffusionXLParams,
  StableDiffusion3,
  StableDiffusion3Params,
  Sampler,
  StylePreset,
  ClipGuidancePreset,
  ImageSize,
} from "./stability";
import {
  BedrockImageGenerationModel,
  ImageGenerationParams,
} from "./bedrock_image_generation";
import {
  BedrockFoundationModel,
  BedrockFoundationModelParams,
  GenerationParams,
  ModelID,
  ChatMessage,
} from "./bedrock";
import { Mistral } from "./mistral";
import { Models, ImageModels, VideoModels } from "./models";
import { NovaReel, NovaReelParams } from "./amazon_video";
import {
  BedrockVideoGenerationModel,
  VideoGenerationParams,
} from "./bedrock_video_generation";

export {
  Claude as Claude3,
  ClaudeParams,
  Jamba,
  Titan,
  Nova,
  Command,
  CommandParams,
  CommandR,
  CommandRParams,
  Llama3Chat,
  GptOss,
  GptOssParams,
  Qwen3,
  Qwen3Params,
  Mistral,
  ChatMessage,
  BedrockFoundationModel,
  Models,
  StableDiffusionXL,
  StableDiffusionXLParams,
  StableDiffusion3,
  StableDiffusion3Params,
  Sampler,
  StylePreset,
  ClipGuidancePreset,
  ImageSize,
  ImageModels,
  NovaParams,
  NovaCanvas,
  NovaReel,
  BedrockVideoGenerationModel,
  VideoGenerationParams,
  VideoModels,
  Ray,
  RayAspectRatio,
  RayResolution,
};

export function fromModelId(
  modelId: ModelID,
  params?: BedrockFoundationModelParams & GenerationParams
): BedrockFoundationModel {
  let _modelId = modelId;
  if (
    modelId.startsWith("us.") ||
    modelId.startsWith("eu.") ||
    modelId.startsWith("apac.")
  ) {
    _modelId = modelId.split(".").slice(1).join(".");
  }
  switch (_modelId.split("-")[0]) {
    case "anthropic.claude":
      return new Claude(modelId, params);
    case "ai21.jamba":
      return new Jamba(modelId, params);
    case "amazon.titan":
      return new Titan(modelId, params);
    case "amazon.nova":
      return new Nova(modelId, params);
    case "cohere.command":
      if (modelId.includes("command-r")) {
        return new CommandR(modelId, params);
      }
      return new Command(modelId, params);
    case "meta.llama3":
      return new Llama3Chat(modelId, params);
    case "meta.llama4":
      return new Llama3Chat(modelId, params);
    case "mistral.mistral":
    case "mistral.mixtral":
      return new Mistral(modelId, params);
    case "openai.gpt":
      return new GptOss(modelId, params);
    case "qwen.qwen3":
      return new Qwen3(modelId, params);
    default:
      throw new Error(`Unknown model ID: ${modelId}`);
  }
}

export function fromImageModelId(
  modelId: ModelID,
  params?: BedrockFoundationModelParams &
    ImageGenerationParams &
    StableDiffusionXLParams &
    StableDiffusion3Params
): BedrockImageGenerationModel {
  switch (modelId.split("-")[0]) {
    case "amazon.nova":
      return new NovaCanvas(modelId, params);
    case "stability.stable":
      if (modelId == "stability.stable-diffusion-xl-v1") {
        return new StableDiffusionXL(modelId, params);
      } else {
        return new StableDiffusion3(modelId, params);
      }
    case "stability.sd3":
      return new StableDiffusion3(modelId, params);
    default:
      throw new Error(`Unknown model ID: ${modelId}`);
  }
}

export function fromVideoModelId(
  modelId: ModelID,
  params: BedrockFoundationModelParams &
    VideoGenerationParams &
    NovaReelParams &
    RayParams
): BedrockVideoGenerationModel {
  switch (modelId.split("-")[0]) {
    case "amazon.nova":
      return new NovaReel(modelId, params);
    case "luma.ray":
      return new Ray(modelId, params);
    default:
      throw new Error(`Unknown model ID: ${modelId}`);
  }
}
