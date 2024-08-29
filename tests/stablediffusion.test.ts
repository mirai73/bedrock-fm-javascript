import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { StableDiffusionXL } from "../src/stability";
import { ImageModels } from "../src/bedrock_image_generation";
import { fromImageModelId } from "../src/main";

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

it("validates prompt parsing 1", async () => {
  const fm = new StableDiffusionXL(
    ImageModels.STABILITY_STABLE_DIFFUSION_XL_V1,
    { client: mockClient }
  );
  const body = await fm.prepareBody(
    "a new house, gothic style  (photographic scene, 1.0), golden hour (national geo style, 2)",
    { imageSize: "1024x1024" }
  );
  const bodyJson = JSON.parse(body);
  expect(bodyJson.width).toBe(1024);
  expect(bodyJson.height).toBe(1024);
  expect(bodyJson.text_prompts).toStrictEqual([
    {
      text: "a new house, gothic style  ",
      weight: 1,
    },
    {
      text: "photographic scene",
      weight: 1,
    },
    {
      text: ", golden hour ",
      weight: 1,
    },
    {
      text: "national geo style",
      weight: 2,
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
