# bedrock-fm-javascript
A library to interact with Amazon Bedrock models

## Installation

Install the library with

```
pnpm add @mirai/bedrock-fm
```

```
npm install @mirai/bedrock-fm
```

```
yarn add @mirai/bedrock-fm
```

## Usage



Full response

```ts
import { fromModelId } from "@mirai/bedrcok-fm";

const fm = fromModelId("amazon.titan-text-express-v1", { credentials: { }, region: "us-east-1"});

(async () => {
    const resp = await fm.generate("Hello!");
    console.log(resp[0]);
})();
```


Streaming response

```ts
import { fromModelId } from "@mirai/bedrcok-fm";

const fm = fromModelId("amazon.titan-text-express-v1", { credentials: { }, region: "us-east-1"});

(async () => {
    const resp = await fm.generateStream("Hello!");
    for await (const chunk of resp) {
        console.log(chunk);
    }
})();

```
