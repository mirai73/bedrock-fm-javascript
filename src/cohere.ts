import {
  BedrockFoundationModel,
  ChatMessage,
  GenerationParams,
} from "./bedrock";

/**
 * Instantiates a new instance to interact with Command foundation model via Amazon Bedrock
 *
 */
export class Command extends BedrockFoundationModel {
  prepareBody(messages: ChatMessage[], input: GenerationParams): string {
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
  preamble?: string;
  prompt_tuncation?: "AUTO" | "AUTO_PRESERVE_ORDER" | "OFF";
  connectors?: {
    id: string;
    user_acess_token: string;
    continue_on_failue: boolean;
    options: Record<string, unknown>;
  }[];
  search_queries_only?: boolean;
  documents?: Record<string, string>[];
  citation_quality?: "accurate" | "fast";
  max_input_tokens?: number;
  max_tokens?: number;
  temperature?: number;
  stop_sequences?: string[];
  p?: number;
  k?: number;
  seed?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
  tools?: {
    name: string;
    description: string;
    parameter_definitions?: Record<
      string,
      { description?: string; type: string; required: boolean }
    >;
  };
  tool_results?: {
    call: { name: string; parameters: Record<string, unknown> };
    outputs: Record<string, unknown>[];
  }[];
}

/**
 * Instantiates a new instance to interact with Command foundation model via Amazon Bedrock
 *
 */
export class CommandR extends BedrockFoundationModel {
  override async chat(
    messages: ChatMessage[],
    input?: GenerationParams & { modelArgs: CommandRParams },
    rawResponse = false
  ): Promise<ChatMessage> {
    return await super.chat(messages, input, rawResponse);
  }

  override async generate(
    message: string,
    input?: GenerationParams & { modelArgs: CommandRParams }
  ): Promise<string> {
    return await super.generate(message, input);
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
