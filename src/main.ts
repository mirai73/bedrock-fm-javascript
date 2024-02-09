import { Claude } from "./anthropic";
import { Jurassic } from "./ai21";
import { Titan } from "./amazon";
import { Command } from "./cohere";
import {
  BedrockFoundationModel,
  BedrockFoundationModelParams,
  GenerationParams,
  Models,
} from "./bedrock";

export { Claude, Jurassic, Titan, Command };

export function fromModelId(modelId: Models, 
  params?: BedrockFoundationModelParams & GenerationParams
): BedrockFoundationModel {
  switch (modelId.split("-")[0]) {
    case "anthropic.claude":
      return new Claude(modelId, params);
    case "ai21.j2":
      return new Jurassic(modelId, params);
    case "amazon.titan":
      return new Titan(modelId, params);
    case "cohere.command":
      return new Command(modelId, params);
    default:
      throw new Error(`Unknown model ID: ${modelId}`);
  }
}
