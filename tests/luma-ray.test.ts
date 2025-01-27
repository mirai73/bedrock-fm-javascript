import { Ray, VideoModels } from "../src/main";

const fm = new Ray(VideoModels.LUMA_RAY_V2_0, {
  region: "us-west-2",
  s3Uri: process.env.VIDEO_BUCKET_S3,
});

it("start generate a video and return", async () => {
  const resp = await fm.generateVideo("Gorilla surfing on a wave", {
    rawResponse: true,
    aspectRatio: "9:16",
    loop: true,
    resolution: "720p",
  });
  expect(resp).toContain("arn:aws:bedrock");
});
