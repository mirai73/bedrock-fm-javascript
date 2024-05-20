import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

export interface CommandParams {
  k?: number;
  num_generations?: number;
}

/**
 * Instantiates a new instance to interact with Command foundation model via Amazon Bedrock
 *
 */

export class Command extends BedrockFoundationModel {
  override async chat(
    messages: ChatMessage[],
    options?: GenerationParams & { modelArgs?: CommandParams }
  ): Promise<ChatMessage> {
    return await super.chat(messages, options);
  }

  override async generate(
    message: string,
    options?: GenerationParams & { modelArgs?: CommandParams }
  ): Promise<string> {
    return await super.generate(message, options);
  }

  prepareBody(
    messages: ChatMessage[],
    input: GenerationParams & CommandParams
  ): string {
    const modelArgs = (({ k, num_generations }) => ({
      num_generations,
      k,
    }))((input.modelArgs as any) ?? {});
    return JSON.stringify({
      prompt: messages.filter((m) => m.role === "human")[0]?.message,
      max_tokens:
        input.modelArgs?.max_tokens ??
        input.maxTokenCount ??
        this.maxTokenCount,
      stop_sequences:
        input.modelArgs?.stop_sequences ??
        input.stopSequences ??
        this.stopSequences,
      p: input.modelArgs?.p ?? input.topP ?? this.topP,
      temperature:
        input.modelArgs?.temperature ?? input.temperature ?? this.temperature,
      stream: false,
      ...modelArgs,
    });
  }

  getResults(body: string): string {
    return JSON.parse(body).generations.map((g: any) => {
      if (g.is_finished) {
        const t = g.text;
        return t === "<EOS_TOKEN>" ? "\n" : t;
      } else if (g.finish_reason === "COMPLETE") {
        return g.text;
      }
      return "";
    })[0];
  }
}

/**
 * See https://docs.cohere.com/reference/chat
 */
export interface CommandRParams {
  /** When specified, the default Cohere preamble will be replaced with the provided one.
   * Preambles are a part of the prompt used to adjust the model's overall behavior and conversation style,
   * and use the `SYSTEM` role.
   *
   * The `SYSTEM` role is also used for the contents of the optional `chat_history=` parameter.
   * When used with the `chat_history=` parameter it adds content throughout a conversation.
   * Conversely, when used with the `preamble=` parameter it adds content at the start of the conversation only.
   */
  preamble?: string;

  /**
   * Defaults to `AUTO` when connectors are specified and `OFF` in all other cases.
   *
   * Dictates how the prompt will be constructed.
   * With prompt_truncation set to `"AUTO"`, some elements from `chat_history` and `documents`.
   * will be dropped in an attempt to construct a prompt that fits within the model's context length limit.
   * During this process the order of the documents and chat history will be changed and ranked by relevance.
   *
   * With prompt_truncation set to `"AUTO_PRESERVE_ORDER"`, some elements from chat_history and documents
   * will be dropped in an attempt to construct a prompt that fits within the model's context length limit.
   * During this process the order of the documents and chat history will be preserved as they are inputted into the API.
   *
   * With prompt_truncation set to `"OFF"`, no elements will be dropped.
   * If the sum of the inputs exceeds the model's context length limit, a `TooManyTokens` error will be returned.
   */
  prompt_truncation?: "AUTO" | "AUTO_PRESERVE_ORDER" | "OFF";

  // connectors?: {
  //   id: string;
  //   user_acess_token?: string;
  //   continue_on_failue?: boolean;
  //   options?: Record<string, unknown>;
  // }[];

  /**
   * Defaults to `false`.
   * When `true`, the response will only contain a list of generated search queries,
   * but no search will take place, and no reply from the model to the user's message will be generated.
   */
  search_queries_only?: boolean;

  /**
   * A list of relevant documents that the model can cite to generate a more accurate reply.
   * Each document is a string-string dictionary.
   *
   * Example:
   * ```
   * [
   *   {
   *     "title": "Tall penguins",
   *     "text": "Emperor penguins are the tallest."
   *   },
   *   {
   *     "title": "Penguin habitats",
   *     "text": "Emperor penguins only live in Antarctica."
   *   }
   * ]
   * ```
   *
   * Keys and values from each document will be serialized to a string and passed to the model.
   * The resulting generation will include citations that reference some of these documents.
   *
   * Some suggested keys are "text", "author", and "date". For better generation quality,
   * it is recommended to keep the total word count of the strings in the dictionary to under 300 words.
   *
   * An `id` field (string) can be optionally supplied to identify the document in the citations.
   * This field will not be passed to the model.
   *
   * An `_excludes` field (array of strings) can be optionally supplied to omit some
   * key-value pairs from being shown to the model. The omitted fields will still
   * show up in the citation object. The `"_excludes"` field will not be passed to the model.
   *
   * See [Document Mode](https://docs.cohere.com/docs/retrieval-augmented-generation-rag#document-mode)
   * in the guide for more information.
   *
   */
  documents?: Record<string, string>[];

  //citation_quality?: "accurate" | "fast";

  //max_input_tokens?: number;

  /**
   * The maximum number of tokens the model will generate as part of the response.
   * Note: Setting a low value may result in incomplete generations.
   */
  max_tokens?: number;

  /**
   * Defaults to `0.3`.
   *
   * A non-negative float that tunes the degree of randomness in generation.
   * Lower temperatures mean less random generations, and higher temperatures mean more random generations.
   *
   * Randomness can be further maximized by increasing the value of the `p` parameter.
   */
  temperature?: number;

  /**
   * A list of up to 5 strings that the model will use to stop generation.
   * If the model generates a string that matches any of the strings in the list,
   * it will stop generating tokens and return the generated text up to that point not including the stop sequence.
   */
  stop_sequences?: string[];

  /**
   * Ensures that only the most likely tokens, with total probability mass of p, are considered for generation at each step. If both `k` and `p` are enabled, `p` acts after `k`.
   *
   * Defaults to `0.75`. min value of `0.01`, max value of `0.99`.
   */
  p?: number;

  /**
   * Ensures only the top k most likely tokens are considered for generation at each step.
   * Defaults to `0`, min value of `0`, max value of `500`
   */
  k?: number;

  /**
   * If specified, the backend will make a best effort to sample tokens
   * deterministically, such that repeated requests with the same
   * seed and parameters should return the same result. However,
   * determinism cannot be totally guaranteed.
   */
  seed?: number;

  /**
   * Defaults to `0.0`, min value of `0.0`, max value of `1.0`.
   *
   * Used to reduce repetitiveness of generated tokens. The higher the value, the stronger a penalty is
   * applied to previously present tokens, proportional to how many times they have
   * already appeared in the prompt or prior generation.
   */
  frequency_penalty?: number;

  /**
   * Defaults to `0.0`, min value of `0.0`, max value of `1.0`.
   *
   * Used to reduce repetitiveness of generated tokens. Similar to `frequency_penalty`,
   * except that this penalty is applied equally to all tokens that have already appeared,
   * regardless of their exact frequencies.
   */
  presence_penalty?: number;

  raw_prompting?: boolean;

  // tools?: {
  //   name: string;
  //   description: string;
  //   parameter_definitions?: Record<
  //     string,
  //     { description?: string; type: string; required: boolean } | undefined
  //   >;
  // }[];
  // tool_results?: {
  //   call: { name: string; parameters: Record<string, unknown> };
  //   outputs: Record<string, unknown>[];
  // }[];
}

/**
 * Instantiates a new instance to interact with Command foundation model via Amazon Bedrock
 *
 */
export class CommandR extends BedrockFoundationModel {
  override async chat(
    messages: ChatMessage[],
    options?: GenerationParams & { modelArgs?: CommandRParams }
  ): Promise<ChatMessage> {
    return await super.chat(messages, options);
  }

  override async generate(
    message: string,
    options?: GenerationParams & { modelArgs?: CommandRParams }
  ): Promise<string> {
    return await super.generate(message, options);
  }

  prepareBody(
    messages: ChatMessage[],
    {
      maxTokenCount,
      stopSequences,
      topP,
      temperature,
      modelArgs = {},
    }: GenerationParams & { modelArgs: CommandRParams }
  ): string {
    const _role_map = {
      human: "USER",
      ai: "CHATBOT",
      system: "SYSTEM",
    };

    return JSON.stringify({
      message: messages.filter((m) => m.role === "human").slice(-1)[0]?.message,
      chat_history: messages
        .filter((m) => m.role !== "system")
        .slice(0, -1)
        .map((m) => ({ role: _role_map[m.role], message: m.message })),
      max_tokens: maxTokenCount ?? this.maxTokenCount,
      stop_sequences:
        modelArgs.stop_sequences ?? stopSequences ?? this.stopSequences,
      p: topP ?? this.topP,
      temperature: modelArgs.temperature ?? temperature ?? this.temperature,
      preamble:
        modelArgs.preamble ?? messages[0]!.role === "system"
          ? messages[0]!.message
          : undefined,
      ...modelArgs,
    });
  }

  getResults(body: string): string {
    console.log(body);
    return JSON.parse(body).text;
  }
}
