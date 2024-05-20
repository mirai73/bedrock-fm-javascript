import { ChatMessage, Models } from "../src/bedrock";
import { CommandR, fromModelId } from "../src/main";

it("validates the bot with CommandR", async () => {
  const messages: ChatMessage[] = [];
  messages.push({ role: "system", message: "You are a conversational bot" });
  messages.push({ role: "human", message: "What is your name?" });
  messages.push({ role: "ai", message: "My name is Bean" });
  messages.push({ role: "human", message: "What did you say your name was?" });
  const fm = fromModelId(Models.COHERE_COMMAND_R_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages);
  console.log(resp.message);
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates the bot with CommandR and model params", async () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "human",
    message: "Where do the tallest penguins live?",
  });
  const fm = new CommandR(Models.COHERE_COMMAND_R_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(messages, {
    modelArgs: {
      documents: [
        {
          title: "Tall penguins",
          snippet: "Emperor penguins are the tallest.",
        },
        {
          title: "Penguin habitats",
          snippet: "Emperor penguins only live in Antarctica.",
        },
        {
          title: "What are animals?",
          snippet: "Animals are different from plants.",
        },
      ],
    },
  });
  console.log(resp.message);
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates the bot with CommandR and model params ans raw response", async () => {
  const messages: ChatMessage[] = [];
  messages.push({
    role: "human",
    message: "Where do the tallest penguins live?",
  });
  const fm = new CommandR(Models.COHERE_COMMAND_R_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.chat(
    messages,
    {
      modelArgs: {
        documents: [
          {
            title: "Tall penguins",
            snippet: "Emperor penguins are the tallest.",
          },
          {
            title: "Penguin habitats",
            snippet: "Emperor penguins only live in Antarctica.",
          },
          {
            title: "What are animals?",
            snippet: "Animals are different from plants.",
          },
        ],
      },
    },
    true
  );
  console.log(resp);
  expect(resp.metadata).toBeTruthy();
});

it("validates generate with CommandR and model params", async () => {
  const fm = new CommandR(Models.COHERE_COMMAND_R_V1_0, {
    region: "us-east-1",
  });
  const resp = await fm.generate("Where do the tallest penguins live?", {
    modelArgs: {
      documents: [
        {
          title: "Tall penguins",
          snippet: "Emperor penguins are the tallest.",
        },
        {
          title: "Penguin habitats",
          snippet: "Emperor penguins only live in Antarctica.",
        },
        {
          title: "What are animals?",
          snippet: "Animals are different from plants.",
        },
      ],
    },
  });
  console.log(resp);
  expect(resp.length).toBeGreaterThan(0);
});
