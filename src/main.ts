import { Claude, Claude3, ClaudeParams } from "./anthropic";
import { Jurassic, JurassicParams, Penalty } from "./ai21";
import { Titan } from "./amazon";
import { Command, CommandR, CommandParams, CommandRParams } from "./cohere";
import { Llama2Chat, Llama3Chat } from "./meta";
import { TitanImageGenerator, TitanImageGeneratorParams } from "./amazon_image";
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
import { Models, ImageModels } from "./models";

export {
  Claude,
  Claude3,
  ClaudeParams,
  Jurassic,
  JurassicParams,
  Penalty,
  Titan,
  Command,
  CommandParams,
  CommandR,
  CommandRParams,
  Llama2Chat,
  Llama3Chat,
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
  TitanImageGenerator,
  ImageModels,
};

export function fromModelId(
  modelId: ModelID,
  params?: BedrockFoundationModelParams & GenerationParams
): BedrockFoundationModel {
  switch (modelId.split("-")[0]) {
    case "anthropic.claude":
      if (modelId.includes("claude-3")) {
        return new Claude3(modelId, params);
      }
      return new Claude(modelId, params);
    case "ai21.j2":
      return new Jurassic(modelId, params);
    case "amazon.titan":
      return new Titan(modelId, params);
    case "cohere.command":
      if (modelId.includes("command-r")) {
        return new CommandR(modelId, params);
      }
      return new Command(modelId, params);
    case "meta.llama2":
      return new Llama2Chat(modelId, params);
    case "meta.llama3":
      return new Llama3Chat(modelId, params);
    case "mistral.mistral":
    case "mistral.mixtral":
      return new Mistral(modelId, params);

    default:
      throw new Error(`Unknown model ID: ${modelId}`);
  }
}

export function fromImageModelId(
  modelId: ModelID,
  params?: BedrockFoundationModelParams &
    ImageGenerationParams &
    StableDiffusionXLParams &
    StableDiffusion3Params &
    TitanImageGeneratorParams
): BedrockImageGenerationModel {
  switch (modelId.split("-")[0]) {
    case "amazon.titan":
      return new TitanImageGenerator(modelId, params);
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
