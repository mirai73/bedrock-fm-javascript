import { NovaReel, VideoModels } from "../src/main";
import fs from "fs";

const fm = new NovaReel(VideoModels.AMAZON_NOVA_REEL_V1_0, {
  region: "us-east-1",
  s3Uri: "s3://bedrock-video-generation-us-east-1-hta1ce",
});

function getTestImage(): string {
  const bytes = fs.readFileSync("tests/three_pots.jpg");
  const data = bytes.toString("base64");
  return `data:image/jpeg;base64,${data}`;
}

it("generate a video", async () => {
  const resp = await fm.generateVideo("dolly forward", {
    image: getTestImage(),
    rawResponse: true,
  });
  expect(resp).toContain("arn:aws:bedrock");
}, 600000);

it("returns success", async () => {
  const resp = await fm.getResults(
    "arn:aws:bedrock:us-east-1:699391019698:async-invoke/awgkzrazqjs2"
  );
  expect(resp).toContain("s3");
});
