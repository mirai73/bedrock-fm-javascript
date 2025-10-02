import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import {
  Command,
  fromModelId,
  Claude3,
  Titan,
  Llama3Chat,
  Mistral,
  Models,
} from "../src/main";

//@ts-ignore
const claudeMockClient: BedrockRuntimeClient = {
  send: () => ({
    body: {
      transformToString: () =>
        JSON.stringify({ type: "message", content: [{ text: "result1" }] }),
    },
  }),
  destroy: () => null,
  middlewareStack: () => null,
} as BedrockRuntimeClient;

//@ts-ignore
const titanMockClient: BedrockRuntimeClient = {
  send: () => ({
    body: {
      transformToString: () =>
        JSON.stringify({ results: [{ outputText: "result1" }] }),
    },
  }),
  destroy: () => null,
  middlewareStack: () => null,
} as BedrockRuntimeClient;

it("returns results for valid prompt and input", async () => {
  // Arrange
  const prompt = "Sample prompt";

  const fm = new Titan("amazon.titan-text-express-v1", {
    client: titanMockClient,
  });

  // Act
  const results = await fm.generate(prompt);

  // Assert
  expect(results).toEqual("result1");
});

it("returns Titan class based on the model", async () => {
  const fm = fromModelId("amazon.titan-text-express-v1", {
    client: titanMockClient,
  });

  // Assert
  expect(fm).toBeInstanceOf(Titan);
});

it("return Claude3 class based on the model", async () => {
  const fm = fromModelId("anthropic.claude-3-haiku-20240307-v1:0", {
    client: titanMockClient,
  });

  // Assert
  expect(fm).toBeInstanceOf(Claude3);
});

it("return Mistral class based on the model", async () => {
  const fm = fromModelId("mistral.mistral-7b-instruct-v0:2", {
    client: titanMockClient,
  });

  // Assert
  expect(fm).toBeInstanceOf(Mistral);
});

it("return Claude class based on the model", async () => {
  const fm = fromModelId("cohere.command-light-text-v14", {
    client: titanMockClient,
  });

  // Assert
  expect(fm).toBeInstanceOf(Command);
});

it("return body for Claude 3", async () => {
  const fm = fromModelId("anthropic.claude-3-haiku-20240307-v1:0", {
    client: titanMockClient,
  });
  const body = fm.prepareBody(
    [
      { role: "system", message: "S" },
      { role: "human", message: "H" },
      { role: "ai", message: "A" },
    ],
    {
      temperature: 1.0,
      topP: 1,
      stopSequences: [],
    }
  );
  // Assert
  expect(JSON.parse(body)).toStrictEqual({
    messages: [
      { role: "user", content: "H" },
      { role: "assistant", content: "A" },
    ],
    system: "S",
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 512,
    stop_sequences: [],
    top_p: 1,
    temperature: 1,
  });
});

it("return body for Claude 3 - override args", async () => {
  const fm = fromModelId("anthropic.claude-3-haiku-20240307-v1:0", {
    client: titanMockClient,
  });
  const body = fm.prepareBody(
    [
      { role: "human", message: "H" },
      { role: "ai", message: "A" },
    ],
    {
      temperature: 1.0,
      topP: 1,
      stopSequences: [],
    }
  );
  // Assert
  expect(JSON.parse(body)).toStrictEqual({
    messages: [
      { role: "user", content: "H" },
      { role: "assistant", content: "A" },
    ],
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 512,
    stop_sequences: [],
    top_p: 1,
    temperature: 1,
  });
});

it("return body for Claude 3 - override args", async () => {
  const fm = fromModelId("anthropic.claude-3-haiku-20240307-v1:0", {
    client: titanMockClient,
  });
  const body = fm.prepareBody(
    [
      { role: "system", message: "S" },
      { role: "human", message: "H" },
      { role: "ai", message: "A" },
    ],
    {
      temperature: 1.0,
      topP: 1,
      stopSequences: [],
      modelArgs: {
        top_p: 0.3,
        max_tokens: 200,
        system: "S1",
      },
    }
  );
  // Assert
  expect(JSON.parse(body)).toStrictEqual({
    messages: [
      { role: "user", content: "H" },
      { role: "assistant", content: "A" },
    ],
    system: "S1",
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 200,
    stop_sequences: [],
    top_p: 0.3,
    temperature: 1,
  });
});

it("return body for Claude < 3", async () => {
  const fm = fromModelId("anthropic.claude-instant-v1", {
    client: titanMockClient,
  });
  const body = fm.prepareBody(
    [
      { role: "system", message: "S" },
      { role: "human", message: "H" },
      { role: "ai", message: "A" },
    ],
    {
      temperature: 1.0,
      topP: 1,
      stopSequences: [],
    }
  );
  // Assert
  expect(JSON.parse(body)).toStrictEqual({
    messages: [
      { role: "user", content: "H" },
      { role: "assistant", content: "A" },
    ],
    system: "S",
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 512,
    stop_sequences: [],
    top_p: 1,
    temperature: 1,
  });
});

it("return body for Claude 3", async () => {
  const fm = fromModelId(Models.ANTHROPIC_CLAUDE_SONNET_4_5_20250929_V1_0, {
    client: titanMockClient,
  });
  const body = fm.prepareBody(
    [
      { role: "system", message: "S" },
      { role: "human", message: "H" },
      { role: "ai", message: "A" },
    ],
    {
      temperature: 1.0,
      topP: 1,
      stopSequences: [],
    }
  );
  // Assert
  expect(JSON.parse(body)).toStrictEqual({
    messages: [
      { role: "user", content: "H" },
      { role: "assistant", content: "A" },
    ],
    system: "S",
    anthropic_version: "bedrock-2023-05-31",
    max_tokens: 512,
    stop_sequences: [],
    top_p: 1,
    temperature: 1,
  });
});

it("return body for cohere", async () => {
  const fm = fromModelId("cohere.command-light-text-v14", {
    client: titanMockClient,
  });
  const body = fm.prepareBody(
    [
      { role: "system", message: "S" },
      { role: "human", message: "H" },
      { role: "ai", message: "A" },
    ],
    {
      temperature: 1.0,
      topP: 1,
      stopSequences: ["A", "B"],
    }
  );
  // Assert
  expect(JSON.parse(body)).toStrictEqual({
    prompt: "H",
    max_tokens: 512,
    stop_sequences: ["A", "B"],
    temperature: 1,
    p: 1,
    stream: false,
  });
});

it("return body for cohere - model args", async () => {
  const fm = fromModelId("cohere.command-light-text-v14", {
    client: titanMockClient,
  });
  const body = fm.prepareBody(
    [
      { role: "system", message: "S" },
      { role: "human", message: "H" },
      { role: "ai", message: "A" },
    ],
    {
      temperature: 1.0,
      topP: 1,
      stopSequences: ["A", "B"],
      modelArgs: {
        p: 0.5,
        max_tokens: 200,
        k: 4,
      },
    }
  );
  // Assert
  expect(JSON.parse(body)).toStrictEqual({
    prompt: "H",
    max_tokens: 200,
    stop_sequences: ["A", "B"],
    temperature: 1,
    p: 0.5,
    k: 4,
    stream: false,
  });
});

it("return body for Mistral", async () => {
  const fm = fromModelId("mistral.mistral-7b-instruct-v0:2", {
    client: titanMockClient,
  });
  const body = fm.prepareBody(
    [
      { role: "system", message: "S" },
      { role: "human", message: "H" },
      { role: "ai", message: "A" },
    ],
    {
      temperature: 1.0,
      topP: 1,
      stopSequences: ["A", "B"],
      modelArgs: {
        p: 0.5,
        max_tokens: 200,
        k: 4,
      },
    }
  );
  // Assert
  expect(JSON.parse(body)).toStrictEqual({
    prompt: "[INST] H [/INST]",
    max_tokens: 512,
    temperature: 1,
    top_p: 1,
  });
});

it("return chat prompt for mistral - chat", async () => {
  const fm = fromModelId("mistral.mixtral-8x7b-instruct-v0:1", {
    client: titanMockClient,
  });
  const msg = fm.getChatPrompt([
    { role: "system", message: "S" },
    { role: "human", message: "H" },
    { role: "ai", message: "A" },
    { role: "human", message: "H1" },
  ])[0];
  // Assert
  expect(msg).toStrictEqual({
    role: "human",
    message: "<s>[INST] H [/INST] A</s>[INST] H1 [/INST]",
  });
});

it("return chat prompt for llama3 - alternating S,H,A,H", async () => {
  const fm = fromModelId(Models.META_LLAMA3_8B_INSTRUCT_V1_0, {
    client: titanMockClient,
  });
  const msg = fm.getChatPrompt([
    { role: "system", message: "S" },
    { role: "human", message: "H" },
    { role: "ai", message: "A" },
    { role: "human", message: "H1" },
  ])[0];
  // Assert
  expect(msg).toStrictEqual({
    role: "human",
    message:
      "<|begin_of_text|><|start_header_id|>system<|end_header_id|>" +
      "\n\nS<|eot_id|><|start_header_id|>user<|end_header_id|>" +
      "\n\nH<|eot_id|>\n<|start_header_id|>assistant<|end_header_id|>" +
      "\n\nA<|eot_id|>\n<|start_header_id|>user<|end_header_id|>" +
      "\n\nH1<|eot_id|>\n<|start_header_id|>assistant<|end_header_id|>",
  });
});

it("return prompt for llama3 - only user message", async () => {
  const fm = fromModelId(Models.META_LLAMA3_8B_INSTRUCT_V1_0, {
    client: titanMockClient,
  });
  const msg = fm.getChatPrompt([{ role: "human", message: "H" }])[0];
  // Assert
  expect(msg).toStrictEqual({
    role: "human",
    message:
      "<|begin_of_text|><|start_header_id|>user<|end_header_id|>" +
      "\n\nH<|eot_id|>\n<|start_header_id|>assistant<|end_header_id|>",
  });
});

it("throw exception for for llama3 - last message is ai", async () => {
  const fm = new Llama3Chat(Models.META_LLAMA3_8B_INSTRUCT_V1_0, {
    client: titanMockClient,
  });

  try {
    fm.getChatPrompt([
      { role: "system", message: "S" },
      { role: "human", message: "H" },
      { role: "ai", message: "A" },
    ]);
    expect(1).toBe(0);
  } catch (e) {
    expect(1).toBe(1);
  }
});
