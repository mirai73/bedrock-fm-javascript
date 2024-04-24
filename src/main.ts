import { Claude, Claude3 } from "./anthropic";
import { Jurassic } from "./ai21";
import { Titan } from "./amazon";
import { Command } from "./cohere";
import { Llama2Chat, Llama3Chat } from "./meta";
import {
  BedrockFoundationModel,
  BedrockFoundationModelParams,
  GenerationParams,
  Models,
  ChatMessage,
} from "./bedrock";
import { Mistral } from "./mistral";

export {
  Claude,
  Claude3,
  Jurassic,
  Titan,
  Command,
  Llama2Chat,
  Llama3Chat,
  Mistral,
  ChatMessage,
};

export function fromModelId(
  modelId: Models,
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
