import { NovaReel, VideoModels } from "../src/main";
import fs from "fs";

const fm = new NovaReel(VideoModels.AMAZON_NOVA_REEL_V1_0, {
  region: "us-east-1",
  s3Uri: process.env.NOVA_REEL_S3,
});

function getTestImage(): string {
  const bytes = fs.readFileSync("tests/three_pots.jpg");
  const data = bytes.toString("base64");
  return `data:image/jpeg;base64,${data}`;
}

it("start generate a video and return", async () => {
  const resp = await fm.generateVideo("dolly forward", {
    image: getTestImage(),
    rawResponse: true,
  });
  expect(resp).toContain("arn:aws:bedrock");
});

it("generate a video and wait", async () => {
  const resp = await fm.generateVideo("dolly forward", {
    image: getTestImage(),
  });
  expect(resp.uri).toContain("s3://");
}, 600000);

it("generate a video from text", async () => {
  expect(fm.params?.s3Uri).toBe(process.env.NOVA_REEL_S3);
  const resp = await fm.generateVideo(
    "a dog walking on a dirty path, camera dolly forward",
    { rawResponse: true }
  );
  expect(resp).toContain("arn:aws:bedrock");
});
