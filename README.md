# bedrock-fm
A library to interact with Amazon Bedrock models

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
const claude = new Claude("...")
```

there is currently no type check that the modelId specified is compatible with the model class, and an error will be raised only at runtime. 

I strongly advice to use the `fromModelId()` method that returns the correct class from the model id.

### Full response

```ts
import { fromModelId } from "@mirai73/bedrcok-fm";

const fm = fromModelId("amazon.titan-text-express-v1", { credentials: { }, region: "us-east-1" });

(async () => {
    const resp = await fm.generate("Hello!");
    console.log(resp[0]);
})();
```


### Streaming response

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
