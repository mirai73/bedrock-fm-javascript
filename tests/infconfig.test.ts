import { NovaCanvas } from "../src/amazon_image";
import { ImageModels } from "../src/main";
const m = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0);

it("n", () => {
  const res = m.getConfigFromString("n:4");
  expect(res.numberOfImages).toBe(4);
});

it("size", () => {
  const res = m.getConfigFromString("size:512x128");
  expect(res.width).toBe(512);
  expect(res.height).toBe(128);
});

it("scale", () => {
  const res = m.getConfigFromString("scale:4");
  expect(res.cfgScale).toBe(4);
});

it("seed", () => {
  const res = m.getConfigFromString("seed:4");
  expect(res.seed).toBe(4);
});

it("wrong key", () => {
  expect(() => m.getConfigFromString("test:4")).toThrow();
});

describe("wrong value", () => {
  ["n:a", "size:512", "size:654,76", "size:5xA"].forEach(() => {
    expect(() => m.getConfigFromString("n:a")).toThrow();
  });
});

it("complete", () => {
  const res = m.getConfigFromString(" size:512x512, n:4, seed:12, scale:5");
  expect(res).toStrictEqual({
    width: 512,
    height: 512,
    seed: 12,
    cfgScale: 5,
    numberOfImages: 4,
  });
});
