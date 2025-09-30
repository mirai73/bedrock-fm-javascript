import { Qwen3, fromModelId, Models, ChatMessage } from "../src/main";

it("validates the bot with qwen3", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId(Models.QWEN_QWEN3_32B_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp.message);
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates the bot with Qwen3 and model params", async () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "human",
    message: "Where do the tallest penguins live?",
  });
  const fm = new Qwen3(Models.QWEN_QWEN3_32B_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages, {
    modelArgs: {
      top_p: 0.5,
      reasoning_effort: "low",
    },
  });
  console.log(JSON.stringify(resp.message));
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates the bot with Qwen3 and functions", async () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "human",
    message: "What is time right now?",
  });
  const fm = new Qwen3(Models.QWEN_QWEN3_32B_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages, {
    modelArgs: {
      tools: [
        {
          type: "function",
          function: {
            name: "current_time",
            description: "Gets the current time",
            parameters: {},
          },
        },
      ],
    },
    rawResponse: true,
  });
  console.log(JSON.stringify(resp));
  expect((resp.metadata as any).choices[0].finish_reason).toBe("tool_calls");
});

it("validates the bot with qwen3 coder", async () => {
  const fm = fromModelId(Models.QWEN_QWEN3_CODER_30B_A3B_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.generate(
    "A rust program to calculate fibonacci and the instructions to create the project and run it",
    {
      maxTokenCount: 2000,
    }
  );
  console.log(resp);
  expect(resp.length).toBeGreaterThan(0);
}, 30000);
