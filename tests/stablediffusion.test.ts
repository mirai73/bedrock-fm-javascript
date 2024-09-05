import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import {
  StableDiffusionXL,
  ImageModels,
  fromImageModelId,
  StableDiffusion3,
} from "../src/main";

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
  const fm = fromImageModelId(ImageModels.STABILITY_STABLE_DIFFUSION_XL_V1, {
    client: mockClient,
  });
  expect(fm).toBeInstanceOf(StableDiffusionXL);
});

it("return the right model - Core ", async () => {
  const fm = fromImageModelId(ImageModels.STABILITY_STABLE_IMAGE_CORE_V1_0, {
    client: mockClient,
  });
  expect(fm).toBeInstanceOf(StableDiffusion3);
});

it("return the right model - Ultra ", async () => {
  const fm = fromImageModelId(ImageModels.STABILITY_STABLE_IMAGE_ULTRA_V1_0, {
    client: mockClient,
  });
  expect(fm).toBeInstanceOf(StableDiffusion3);
});

it("return the right model - 3 ", async () => {
  const fm = fromImageModelId(ImageModels.STABILITY_SD3_LARGE_V1_0, {
    client: mockClient,
  });
  expect(fm).toBeInstanceOf(StableDiffusion3);
});

it("validates body generation", async () => {
  const fm = new StableDiffusionXL(
    ImageModels.STABILITY_STABLE_DIFFUSION_XL_V1,
    { client: mockClient }
  );
  const body = await fm.prepareBody("a nice view", { width: 512, height: 512 });
  expect(body).toBe(
    '{"text_prompts":[{"text":"a nice view","weight":1}],"width":512,"height":512}'
  );
});

it("validates body generation - 3", async () => {
  const fm = new StableDiffusion3(
    ImageModels.STABILITY_STABLE_IMAGE_CORE_V1_0,
    { client: mockClient }
  );
  const body = await fm.prepareBody("a nice view", { width: 512, height: 512 });
  expect(body).toBe('{"prompt":"a nice view","mode":"text-to-image"}');
});

it("validates prompt parsing 1", async () => {
  const fm = new StableDiffusionXL(
    ImageModels.STABILITY_STABLE_DIFFUSION_XL_V1,
    { client: mockClient }
  );
  const body = await fm.prepareBody(
    "a new house, gothic style (photographic scene:1.0), golden hour (national geo style:2)",
    { imageSize: "1024x1024" }
  );
  const bodyJson = JSON.parse(body);
  expect(bodyJson.width).toBe(1024);
  expect(bodyJson.height).toBe(1024);
  expect(bodyJson.text_prompts).toStrictEqual([
    {
      text: "a new house, gothic style photographic scene, golden hour",
      weight: 1,
    },
    {
      text: "national geo style",
      weight: 2,
    },
  ]);
});

it("validates prompt parsing 2", async () => {
  const fm = new StableDiffusionXL(
    ImageModels.STABILITY_STABLE_DIFFUSION_XL_V1,
    { client: mockClient }
  );
  const body = await fm.prepareBody(
    "a new house, gothic style, golden hour (national geo style:2) NEGATIVE: low quality (bad hands:1.4)",
    { imageSize: "1024x1024" }
  );
  const bodyJson = JSON.parse(body);
  expect(bodyJson.width).toBe(1024);
  expect(bodyJson.height).toBe(1024);
  expect(bodyJson.text_prompts).toStrictEqual([
    {
      text: "a new house, gothic style, golden hour",
      weight: 1,
    },
    {
      text: "national geo style",
      weight: 2,
    },
    {
      text: "low quality",
      weight: -1,
    },
    {
      text: "bad hands",
      weight: -1.4,
    },
  ]);
});

it("validates the generation", async () => {
  const fm = new StableDiffusionXL(
    ImageModels.STABILITY_STABLE_DIFFUSION_XL_V1,
    { region: "us-east-1" }
  );

  const resp = await fm.generateImage("a nice view", {
    width: 512,
    height: 512,
  });
  expect(resp[0]?.includes("base64")).toBeTruthy();
});

it("validates the generation - 3", async () => {
  const fm = new StableDiffusion3(
    ImageModels.STABILITY_STABLE_IMAGE_CORE_V1_0,
    { region: "us-west-2" }
  );

  const resp = await fm.generateImage("a nice view", {
    negative_prompt: "clouds",
    aspect_ratio: "2:3",
  });
  expect(resp[0]?.includes("base64")).toBeTruthy();
});
