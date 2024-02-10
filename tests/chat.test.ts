import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { fromModelId } from "../src/main";
import { ChatMessage } from "../src/bedrock";

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

it("validates the messages", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a bot" });
  messages.push({ role: "human", message: "human" });
  messages.push({ role: "ai", message: "ai" });
  messages.push({ role: "human", message: "human" });
  const fm = fromModelId("amazon.titan-text-express-v1", {
    client: titanMockClient,
  });
  await fm.chat(messages);
  expect(1).toBe(1);
});

it("it fails validating the messages", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a bot" });
  messages.push({ role: "human", message: "human" });
  messages.push({ role: "system", message: "You are a bot" });
  messages.push({ role: "ai", message: "ai" });
  messages.push({ role: "human", message: "human" });
  const fm = fromModelId("amazon.titan-text-express-v1", {
    client: titanMockClient,
  });
  // test if an exception is thrown
  try {
    await fm.chat(messages);
  } catch (e: any) {
    expect(e.message).toBe("Wrong message alternation");
  }
});

it("it fails validating the messages", async () => {
  const messages: ChatMessage[] = [];
  const fm = fromModelId("amazon.titan-text-express-v1", {
    client: titanMockClient,
  });
  // test if an exception is thrown
  try {
    await fm.chat(messages);
  } catch (e: any) {
    expect(e.message).toBe("Wrong message alternation");
  }
});

it("it fails validating the messages", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a bot" });
  messages.push({ role: "human", message: "human" });
  messages.push({ role: "ai", message: "ai" });

  const fm = fromModelId("amazon.titan-text-express-v1", {
    client: titanMockClient,
  });
  // test if an exception is thrown
  try {
    await fm.chat(messages);
  } catch (e: any) {
    expect(e.message).toBe("Wrong message alternation");
  }
});

it("it fails validating the messages", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a bot" });
  messages.push({ role: "human", message: "human" });
  messages.push({ role: "human", message: "human" });
  const fm = fromModelId("amazon.titan-text-express-v1", {
    client: titanMockClient,
  });
  // test if an exception is thrown
  try {
    await fm.chat(messages);
  } catch (e: any) {
    expect(e.message).toBe("Wrong message alternation");
  }
});

it("it fails validating the messages", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a bot" });
  messages.push({ role: "ai", message: "ai" });
  messages.push({ role: "human", message: "human" });
  const fm = fromModelId("amazon.titan-text-express-v1", {
    client: titanMockClient,
  });
  // test if an exception is thrown
  try {
    await fm.chat(messages);
  } catch (e: any) {
    expect(e.message).toBe("Wrong message alternation");
  }
});

it("validates the messages", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId("amazon.titan-text-express-v1", {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp);
  expect(resp.length).toBeGreaterThan(0);
});

it("validates the bot with Llama", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId("meta.llama2-13b-chat-v1", {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp);
  expect(resp.length).toBeGreaterThan(0);
});

it("validates the bot with Claude", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId("anthropic.claude-v2", {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp);
  expect(resp.length).toBeGreaterThan(0);
});

it("validates the bot with Claude 2.1", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot and you answer as funny as possible" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId("anthropic.claude-v2:1", {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp);
  expect(resp.length).toBeGreaterThan(0);
});