import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import {
  Command,
  Jurassic,
  fromModelId,
  Claude,
  Titan,
  Llama2Chat,
} from "../src/main";

//@ts-ignore
const claudeMockClient: BedrockRuntimeClient = {
  send: () => ({
    body: {
      transformToString: () => JSON.stringify({ completion: "result1" }),
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

  const fm = new Claude("anthropic.claude-v2", {
    client: claudeMockClient,
  });

  // Act
  const results = await fm.generate(prompt);

  // Assert
  expect(results).toEqual("result1");
});

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

it("return Claude class based on the model", async () => {
  const fm = fromModelId("anthropic.claude-v1", {
    client: titanMockClient,
  });

  // Assert
  expect(fm).toBeInstanceOf(Claude);
});

it("return Jurassic class based on the model", async () => {
  const fm = fromModelId("ai21.j2-ultra", {
    client: titanMockClient,
  });

  // Assert
  expect(fm).toBeInstanceOf(Jurassic);
});

it("return Claude class based on the model", async () => {
  const fm = fromModelId("cohere.command-light-text-v14", {
    client: titanMockClient,
  });

  // Assert
  expect(fm).toBeInstanceOf(Command);
});

it("return LLama2Chat class based on the model", async () => {
  const fm = fromModelId("meta.llama2-13b-chat-v1", {
    client: titanMockClient,
  });

  // Assert
  expect(fm).toBeInstanceOf(Llama2Chat);
});
