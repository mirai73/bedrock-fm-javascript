import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { fromImageModelId, ImageModels, NovaCanvas } from "../src/main";
import fs from "fs";

const fm = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0, {
  region: "us-east-1",
});

function getTestImage(): string {
  const bytes = fs.readFileSync("tests/test-image.jpg");
  const data = bytes.toString("base64");
  return `data:image/jpeg;base64,${data}`;
}

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
  const body = await fm.prepareBody("a nice view", {
    size: { width: 512, height: 512 },
    seed: 300,
  });
  expect(body).toBe(
    '{"taskType":"TEXT_IMAGE","textToImageParams":{"text":"a nice view"},"imageGenerationConfig":{"height":512,"width":512,"seed":300}}',
  );
});

it("validates body generation base", async () => {
  const fm = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0, {
    client: mockClient,
  });
  const body = await fm.prepareBody("a nice view | seed:86", { seed: 51 });
  expect(body).toBe(
    '{"taskType":"TEXT_IMAGE","textToImageParams":{"text":"a nice view"},"imageGenerationConfig":{"seed":86}}',
  );
});

it("image gen with conditioning text", async () => {
  const resp = await fm.generateImage(
    "a lanscape with mountains CONDITION(CANNY_EDGE:0.7)",
    { image: getTestImage() },
  );
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);

it("background", async () => {
  const resp = await fm.generateImage("REMOVE_BACKGROUND", {
    image: getTestImage(),
  });
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);

it("colors", async () => {
  const resp = await fm.generateImage(
    "change the roof COLORS(#000000 #AABB00)",
    { image: getTestImage() },
  );
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);

it("validates the generation", async () => {
  const resp = await fm.generateImage("a nice view | size:768x1024, seed:34", {
    size: {
      width: 512,
      height: 512,
    },
  });
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);

it("object", async () => {
  const resp = await fm.generateImage("curtains MASK(windows)", {
    image: getTestImage(),
  });
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);

it("remove", async () => {
  const resp = await fm.generateImage("MASK(windows)", {
    image: getTestImage(),
  });
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);

it("similar", async () => {
  const resp = await fm.generateImage(
    "different landscapes SIMILAR:0.5|n:3, size:320x320, seed:5",
    {
      image: getTestImage(),
    },
  );
  expect(resp.length).toBe(3);
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);

it("outpaint", async () => {
  const resp = await fm.generateImage("a large barge MASK(houses) OUTPAINT", {
    image: getTestImage(),
  });
  expect(resp.length).toBe(1);
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);

it("bare", async () => {
  const resp = await fm.generateImage("MASK(houses) OUTPAINT", {
    image: getTestImage(),
    size: {
      width: 1024,
      height: 1024,
    },
  });
  expect(resp.length).toBe(1);
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);

it("image gen with negative text", async () => {
  const resp = await fm.generateImage(
    "a lanscape with mountains NEGATIVE(clouds)",
    {},
  );
  expect(resp[0]?.includes("base64")).toBeTruthy();
}, 30000);
