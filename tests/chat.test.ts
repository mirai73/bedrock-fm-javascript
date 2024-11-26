import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { fromModelId, ChatMessage, Models } from "../src/main";

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

it("it fails validating the messages - 1", async () => {
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

it("it fails validating the messages - 2", async () => {
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

it("it fails validating the messages - 3", async () => {
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

it("it fails validating the messages - 4", async () => {
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

it("it fails validating the messages - 5", async () => {
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

it("validates the messages - 2", async () => {
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
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates the bot with Llama", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId(Models.META_LLAMA3_1_8B_INSTRUCT_V1_0, {
    region: "us-west-2",
  });
  const resp = await fm.chat(messages);
  console.log(resp.message);
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates the bot with Claude Sonnet", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId(Models.ANTHROPIC_CLAUDE_3_SONNET_20240229_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp.message);
  expect(resp.message.length).toBeGreaterThan(0);
}, 10000);

it("validates the bot with Claude 2.1", async () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "system",
    message: "You are a conversational bot and you answer as funny as possible",
  });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId("anthropic.claude-v2:1", {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp.message);
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates the bot with Claude Haiku stream", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId("anthropic.claude-3-haiku-20240307-v1:0", {
    region: "us-east-1",
  });
  const stream = await fm.chatStream(messages);
  let c = 0;
  //@ts-ignore
  for await (const resp of stream) {
    c += 1;
  }
  expect(c).toBeGreaterThan(0);
});

it("validates the bot with Llama3", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId(Models.META_LLAMA3_8B_INSTRUCT_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp.message);
  expect(resp.message.length).toBeGreaterThan(0);
});
