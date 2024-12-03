import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { fromImageModelId, ImageModels, NovaCanvas } from "../src/main";

//@ts-ignore
const mockClient: BedrockRuntimeClient = {
  send: () => ({
    body: {
      transformToString: () => JSON.stringify({ completion: "result1" }),
    },
  }),
  destroy: () => null,
  middlewareStack: () => null,
} as BedrockRuntimeClient;

it("return the right model", async () => {
  const fm = fromImageModelId(ImageModels.AMAZON_NOVA_CANVAS_V1_0, {
    client: mockClient,
  });
  expect(fm).toBeInstanceOf(NovaCanvas);
});

it("validates body generation", async () => {
  const fm = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0, {
    client: mockClient,
  });
  const body = await fm.prepareBody("a nice view", { width: 512, height: 512 });
  expect(body).toBe(
    '{"taskType":"TEXT_IMAGE","textToImageParams":{"text":"a nice view"},"imageGenerationConfig":{"height":512,"width":512}}'
  );
});

it("validates body generation base", async () => {
  const fm = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0, {
    client: mockClient,
  });
  const body = await fm.prepareBody("a nice view", {});
  expect(body).toBe(
    '{"taskType":"TEXT_IMAGE","textToImageParams":{"text":"a nice view"},"imageGenerationConfig":{}}'
  );
});

it("validates the generation", async () => {
  const fm = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0, {
    region: "us-east-1",
  });

  const resp = await fm.generateImage("a nice view", {
    width: 512,
    height: 512,
  });
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);
