import { CommandR, fromModelId, Models, ChatMessage } from "../src/main";

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
    rawResponse: true,
  });
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

it("validates system message with CommandR", async () => {
  const fm = new CommandR(Models.COHERE_COMMAND_R_V1_0, {
    region: "us-east-1",
  });

  const resp = await fm.chat(
    [
      {
        role: "system",
        message: `## Task & Context
You help people answer their questions and other requests interactively. You will be asked a very wide array of requests on all kinds of topics. You will be equipped with a wide range of search engines or similar tools to help you, which you use to research your answer. You should focus on serving the user's needs as best you can, which will be wide-ranging.

## Style Guide
Unless the user asks for a different style of answer, you should answer in full sentences, using proper grammar and spelling. You should always answer in Italian`,
      },
      {
        role: "human",
        message: "How tall is the Tour Eiffel?",
      },
    ],
    {
      modelArgs: {},
      rawResponse: true,
    }
  );
  console.log(resp);
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates all model params with CommandR", async () => {
  const fm = new CommandR(Models.COHERE_COMMAND_R_V1_0, {
    region: "us-east-1",
  });

  const resp = await fm.chat(
    [
      {
        role: "system",
        message: `## Task & Context
You help people answer their questions and other requests interactively. You will be asked a very wide array of requests on all kinds of topics. You will be equipped with a wide range of search engines or similar tools to help you, which you use to research your answer. You should focus on serving the user's needs as best you can, which will be wide-ranging.

## Style Guide
Unless the user asks for a different style of answer, you should answer in full sentences, using proper grammar and spelling. You should always answer in Italian`,
      },
      {
        role: "human",
        message: "How tall is the Tour Eiffel?",
      },
    ],
    {
      modelArgs: {
        //citation_quality: "accurate",
        frequency_penalty: 0.1,
        //max_input_tokens: 100,
        k: 100,
        p: 0.99,
        // max_tokens: 1000,
        // presence_penalty: 0.1,
        // connectors: [{ id: "web-search" }],
        documents: [
          { text: "Eiffel tower height", snippet: "Eiffel tower is 2m" },
        ],
        prompt_truncation: "OFF",
        seed: 4,
        stop_sequences: ["hello"],
        temperature: 1,
        search_queries_only: false,
        raw_prompting: false,
      },
      rawResponse: true,
    }
  );
  console.log(resp);
  expect(resp.message.length).toBeGreaterThan(0);
});

it("validates search_query_only with CommandR", async () => {
  const fm = new CommandR(Models.COHERE_COMMAND_R_V1_0, {
    region: "us-east-1",
  });

  const resp = await fm.chat(
    [
      {
        role: "system",
        message: `## Task & Context
You help people answer their questions and other requests interactively. You will be asked a very wide array of requests on all kinds of topics. You will be equipped with a wide range of search engines or similar tools to help you, which you use to research your answer. You should focus on serving the user's needs as best you can, which will be wide-ranging.

## Style Guide
Unless the user asks for a different style of answer, you should answer in full sentences, using proper grammar and spelling. You should always answer in Italian`,
      },
      {
        role: "human",
        message: "How tall is the Tour Eiffel?",
      },
    ],
    {
      modelArgs: {
        search_queries_only: true,
      },
      rawResponse: true,
    }
  );
  console.log(JSON.stringify(resp), undefined, 2);

  expect((resp.metadata as any).search_queries.length).toBeGreaterThan(0);
});
