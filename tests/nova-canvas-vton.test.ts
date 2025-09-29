import { BedrockRuntimeClient } from "@aws-sdk/client-bedrock-runtime";
import { ImageModels, NovaCanvas } from "../src/main";
import fs from "fs";

const fm = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0, {
  region: "us-east-1",
});

function getTestImages(): string[] {
  let bytes = fs.readFileSync("tests/vto1_source.jpg");
  const source = bytes.toString("base64");
  bytes = fs.readFileSync("tests/vto1_ref.jpg");
  const ref = bytes.toString("base64");
  return [`data:image/jpeg;base64,${source}`, `data:image/jpeg;base64,${ref}`];
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

it("vton replace", async () => {
  const resp = await fm.generateImage(
    "VIRTUAL_TRY_ON MASK_TYPE(GARMENT) GARMENT_CLASS(UPPER_BODY)",
    { images: getTestImages() }
  );
  expect(resp[0]?.includes("base64")).toBeTruthy();
  const data = resp[0]?.split(",")[1];
  if (data) {
    const bytes = Buffer.from(data, "base64");
    fs.writeFileSync("test1.jpg", bytes as any);
  }
}, 30000);
