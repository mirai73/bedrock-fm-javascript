[![npm version](https://img.shields.io/npm/v/@mirai73/bedrock-fm.svg)](https://www.npmjs.com/package/@mirai73/bedrock-fm)
[![CI/CD](https://github.com/mirai73/bedrock-fm-javascript/actions/workflows/npm-publish.yml/badge.svg)](https://github.com/mirai73/bedrock-fm-javascript/actions/workflows/npm-publish.yml) [![Test](https://github.com/mirai73/bedrock-fm-javascript/actions/workflows/push.yml/badge.svg)](https://github.com/mirai73/bedrock-fm-javascript/actions/workflows/push.yml) [![CodeQL](https://github.com/mirai73/bedrock-fm-javascript/actions/workflows/github-code-scanning/codeql/badge.svg?branch=main)](https://github.com/mirai73/bedrock-fm-javascript/actions/workflows/github-code-scanning/codeql)

# bedrock-fm

A library to interact with Amazon Bedrock models

## Why this library?

Amazon Bedrock provides a generic API to invoke models, but let's the user to correctly format prompts and know all the names and formats for the parameters to be passed to the model. This library provide utility functions to simplify working with the model exposed via Bedrock in the following way:

1. Idiomatic APIs
2. Generic builder function to create the correct instance of the model class based on model id
3. Formatting of prompts according to model requirements (eg Claude and Llama2Chat)
4. Completion interface (`generate`) and chat interface (`chat`) supporting a common multi turn conversations and system prompt structure
5. Automatic parsing of the model responses

## Installation

```
pnpm add @mirai73/bedrock-fm
```

```
npm install @mirai73/bedrock-fm
```

```
yarn add @mirai73/bedrock-fm
```

## Usage

You can use the models to get full responses or streaming responses. Both APIs are asynchronous.

While it is possible to create models using the model family class, eg

```ts
const claude = new Claude("...");
```

there is currently no type check that the modelId specified is compatible with the model class, and an error will be raised only at runtime.

I strongly advice to use the `fromModelId()` method that returns the correct class from the model id.

### Full response

```ts
import { fromModelId } from "@mirai73/bedrock-fm";

const fm = fromModelId("amazon.titan-text-express-v1", {
  credentials: {},
  region: "us-east-1",
});

(async () => {
  const resp = await fm.generate("Hello!");
  console.log(resp[0]);
})();
```

### Streaming response

```ts
import { fromModelId } from "@mirai73/bedrock-fm";

const fm = fromModelId("amazon.titan-text-express-v1", {
  credentials: {},
  region: "us-east-1",
});

(async () => {
  const resp = await fm.generateStream("Hello!");
  for await (const chunk of resp) {
    console.log(chunk);
  }
})();
```

## Chat

Certain models, like Llama2 Chat or Claude require specific prompts structures when dealing with chat usecases. Creating the correct prompt for hand can be tedious and error prone.
The `chat` completion method allows to easily interact with models when chatting.

A chat is set up via a sequence of `ChatMessages`:

```ts
const messages: ChatMessage[] = [];
messages.push({ role: "system", message: "You are a conversational bot" });
messages.push({ role: "human", message: "What is your name?" });
messages.push({ role: "ai", message: "My name is Bean" });
messages.push({ role: "human", message: "What did you say your name was?" });
```

The last message role should always be `"human"`.

Call the foundation model with

```ts
const aiResponse = await fm.chat(messages);
console.log(aiReponse.message);
```

To continue the conversation, just add the response to the chat history followed by the new user query:

```ts
messages.push(aiResponse);
// collect userQuery
messages.push({ role: "ai", message: userQuery });
```
