import { Claude } from "./anthropic";
import { Jurassic } from "./ai21";
import { Titan } from "./amazon";
import { Command } from "./cohere";
import {
  BedrockFoundationModel,
  BedrockFoundationModelParams,
} from "./bedrock";

export { Claude, Jurassic, Titan, Command };

export function fromModelId(
  params: BedrockFoundationModelParams
): BedrockFoundationModel {
  switch (params.modelId.split("-")[0]) {
    case "anthropic.claude":
      return new Claude(params);
    case "ai21.j2":
      return new Jurassic(params);
    case "amazon.titan":
      return new Titan(params);
    case "cohere.command":
      return new Command(params);
    default:
      throw new Error(`Unknown model ID: ${params.modelId}`);
  }
}
