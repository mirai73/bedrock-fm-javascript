import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

export interface GptOssParams {
  system?: string;
  frequency_penalty?: number;
  logit_bias?: Map<string, number>;
  logprobs?: number;
  max_tokens?: number;
  n?: number;
  presence_penalty?: number;
  seed?: number;
  stop?: string[];
  reasoning_effort?: string;

  /* 
    `audio`, `frequency_penalty`, `function_call`, `functions`, `logit_bias`, `logprobs`, 
    `max_completion_tokens`, `max_tokens`, `messages`, `metadata`, `modalities`, `model`, 
    `n`, `parallel_tool_calls`, `prediction`, `presence_penalty`, `prompt_cache_key`, `reasoning_effort`, 
    `response_format`, `safety_identifier`, `seed`, `service_tier`, `stop`, `store`, `stream`, `stream_options`, 
    `temperature`, `text`, `tool_choice`, `tools`, `top_logprobs`, `top_p`, `user`, `verbosity`, 
    `web_search_options`
    */
}

const RoleMap = {
  system: "developer",
  ai: "assistant",
  human: "user",
};
/**
 * Instantiates a new instance to interact with OpenAI GptOss foundation model via Amazon Bedrock
 *
 * https://cookbook.openai.com/articles/openai-harmony
 */

export class GptOss extends BedrockFoundationModel {
  override async chat(
    messages: ChatMessage[],
    options?: GenerationParams & { modelArgs?: GptOssParams },
  ): Promise<ChatMessage> {
    return await super.chat(messages, options);
  }

  override async generate(
    message: string,
    options?: GenerationParams & { modelArgs?: GptOssParams },
  ): Promise<string> {
    return await super.generate(message, options);
  }

  prepareBody(
    messages: ChatMessage[],
    input: GenerationParams & GptOssParams,
  ): string {
    const {
      system,
      stop,
      top_p,
      temperature,
      max_completion_tokens,
      ...modelArgs
    } = (input.modelArgs as any) ?? {};

    let model_messages = messages.map((m) => ({
      role: RoleMap[m.role],
      content: m.message,
    }));
    if (system) {
      model_messages = [{ role: "system", content: system }, ...model_messages];
    }
    return JSON.stringify({
      messages: model_messages,
      max_completion_tokens:
        max_completion_tokens ?? input.maxTokenCount ?? this.maxTokenCount,
      stop: stop ?? input.stopSequences ?? this.stopSequences,
      top_p: top_p ?? input.topP ?? this.topP,
      temperature: temperature ?? input.temperature ?? this.temperature,
      ...modelArgs,
    });
  }

  getResults(body: string): string {
    return JSON.parse(body).choices.map(
      (g: any) => g.message.content.split("</reasoning>")[1],
    )[0];
  }
}
