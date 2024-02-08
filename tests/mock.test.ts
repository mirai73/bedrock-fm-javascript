import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { Claude } from "../src/anthropic";
import { Titan } from "../src/amazon";

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
  const input = {
    /* valid input params */
  };

  const fm = new Claude({
    modelId: "anthropic.claude-v2",
    client: claudeMockClient,
  });

  // Act
  const results = await fm.generate(prompt, input);

  // Assert
  expect(results).toEqual(["result1"]);
});

it("returns results for valid prompt and input", async () => {
  // Arrange
  const prompt = "Sample prompt";
  const input = {
    /* valid input params */
  };

  const fm = new Titan({
    modelId: "amazon.titan-text-express-v1",
    client: titanMockClient,
  });

  // Act
  const results = await fm.generate(prompt, input);

  // Assert
  expect(results).toEqual(["result1"]);
});
