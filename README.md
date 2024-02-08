# bedrock-fm-javascript
A library to interact with Amazon Bedrock models

## Installation

Install the library with

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



Full response

```ts
import { fromModelId } from "@mirai73/bedrcok-fm";

const fm = fromModelId("amazon.titan-text-express-v1", { credentials: { }, region: "us-east-1"});

(async () => {
    const resp = await fm.generate("Hello!");
    console.log(resp[0]);
})();
```


Streaming response

```ts
import { fromModelId } from "@mirai73/bedrcok-fm";

const fm = fromModelId("amazon.titan-text-express-v1", { credentials: { }, region: "us-east-1"});

(async () => {
    const resp = await fm.generateStream("Hello!");
    for await (const chunk of resp) {
        console.log(chunk);
    }
})();

```
