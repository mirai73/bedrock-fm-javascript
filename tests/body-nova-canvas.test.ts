import { NovaCanvas } from "../src/amazon_image";
import { ImageModels } from "../src/main";
const m = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0);

it("mask", () => {
  const res = m.getBodyFromPrompt("a vase MASK(a dog)", "vQQQ");
  expect(res.body.taskType).toBe("INPAINTING");
});

it("remove_background", () => {
  const res = m.getBodyFromPrompt("REMOVE_BACKGROUND", "vQQQ");
  expect(res.body.taskType).toBe("BACKGROUND_REMOVAL");
});

it("negative", () => {
  const res = m.getBodyFromPrompt("NEGATIVE(no clouds)", "");
  expect(res.body.taskType).toBe("TEXT_IMAGE");
});

it("colors", () => {
  const res = m.getBodyFromPrompt("COLORS(#000000 #FFAAOO)", "");
  expect(res.body.taskType).toBe("COLOR_GUIDED_GENERATION");
});

it("condition", () => {
  const res = m.getBodyFromPrompt("CONDITION(CANNY_EDGE:0.6)", "");
  expect(res.body.taskType).toBe("TEXT_IMAGE");
});

it("similar", () => {
  const res = m.getBodyFromPrompt("SIMILAR:0.6", "");
  expect(res.body.taskType).toBe("IMAGE_VARIATION");
});

it("n", () => {
  const res = m.getBodyFromPrompt("N:3", "");
  expect(res.body.taskType).toBe("TEXT_IMAGE");
});

it("outpaint", () => {
  const res = m.getBodyFromPrompt("OUTPAINT(DEFAULT)", "");
  expect(res.body.taskType).toBe("OUTPAINTING");
});

it("outpaint", () => {
  const res = m.getBodyFromPrompt("OUTPAINT", "");
  expect(res.body.taskType).toBe("OUTPAINTING");
});

it("support a complex prompt", () => {
  const res = m.getBodyFromPrompt(
    "OUTPAINT N:2 SIMILAR:0.5 CONDITION(CANNY_EDGE:0.2) COLORS(#000000) NEGATIVE(dogs) REMOVE_BACKGROUND MASK(bird)",
    "",
  );
  expect(res.body.taskType).toBe("COLOR_GUIDED_GENERATION");
});

it("retrieves the instructions a complex prompt", () => {
  const res = m.getBodyFromPrompt(
    "  a nice view of the sea OUTPAINT N:2 SIMILAR:0.5 with a dog running CONDITION(CANNY_EDGE:0.2) COLORS(#000000) NEGATIVE(dogs) really cool REMOVE_BACKGROUND MASK(bird)",
    "",
  );
  expect(res.body.taskType).toBe("COLOR_GUIDED_GENERATION");
});
