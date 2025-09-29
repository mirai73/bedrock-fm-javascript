import { GptOss, fromModelId, Models, ChatMessage } from "../src/main";

it("validates the bot with gpt oss", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId(Models.OPENAI_GPT_OSS_20B_1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp.message);
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates the bot with gptoss and model params", async () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "human",
    message: "Where do the tallest penguins live?",
  });
  const fm = new GptOss(Models.OPENAI_GPT_OSS_20B_1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages, {
    modelArgs: {
      system: `You are GptOss, a large language model trained by OpenAI.
Knowledge cutoff: 2024-06
Current date: 2025-06-28

Reasoning: low

# Valid channels: analysis, commentary, final. Channel must be included for every message.`,
    },
  });
  console.log(JSON.stringify(resp.message));
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates the bot with GptOss and system message and raw response", async () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "human",
    message: "Where do the tallest penguins live?",
  });
  const fm = new GptOss(Models.OPENAI_GPT_OSS_20B_1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages, {
    modelArgs: {
      system: `You are GptOss, a large language model trained by OpenAI.
Knowledge cutoff: 2024-06
Current date: 2025-06-28

Reasoning: high

# Valid channels: analysis, commentary, final. Channel must be included for every message.`,
    },
    rawResponse: true,
  });
  console.log(JSON.stringify(resp, undefined, 2));
  expect(resp.metadata).toBeTruthy();
});

it("validates generate with GptOss and system message", async () => {
  const fm = new GptOss(Models.OPENAI_GPT_OSS_20B_1_0, {
    region: "us-east-1",
  });
  const resp = await fm.generate("Where do the tallest penguins live?", {
    modelArgs: {
      system: `You are GptOss, a large language model trained by OpenAI.
Knowledge cutoff: 2024-06
Current date: 2025-06-28

Reasoning: high

# Valid channels: analysis, commentary, final. Channel must be included for every message.`,
    },
  });
  console.log(resp);
  expect(resp.length).toBeGreaterThan(0);
});

it("validates generate with GptOss and additional params", async () => {
  const fm = new GptOss(Models.OPENAI_GPT_OSS_20B_1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(
    [{ role: "human", message: "Where do the tallest penguins live?" }],
    {
      maxTokenCount: 100,
      //stopSequences: ["penguins"],
      modelArgs: {
        reasoning_effort: "low",
      },
      rawResponse: true,
    }
  );
  console.log(JSON.stringify(resp, undefined, 2));
  expect(resp.message.length).toBeGreaterThan(0);
});
