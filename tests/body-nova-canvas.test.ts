import { NovaCanvas } from "../src/amazon_image";
import { ImageModels } from "../src/main";
const m = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0);

it("mask", () => {
  const res = m.getBodyFromPrompt("a vase MASK(a dog)", ["vQQQ"]);
  expect(res.taskType).toBe("INPAINTING");
});

it("remove_background", () => {
  const res = m.getBodyFromPrompt("REMOVE_BACKGROUND", ["vQQQ"]);
  expect(res.taskType).toBe("BACKGROUND_REMOVAL");
});

it("negative", () => {
  const res = m.getBodyFromPrompt("NEGATIVE(no clouds)");
  expect(res.taskType).toBe("TEXT_IMAGE");
});

it("colors", () => {
  const res = m.getBodyFromPrompt("COLORS(#000000 #FFAAOO)");
  expect(res.taskType).toBe("COLOR_GUIDED_GENERATION");
});

it("condition", () => {
  const res = m.getBodyFromPrompt("CONDITION(CANNY_EDGE:0.6)");
  expect(res.taskType).toBe("TEXT_IMAGE");
});

it("similar", () => {
  const res = m.getBodyFromPrompt("SIMILAR:0.6");
  expect(res.taskType).toBe("IMAGE_VARIATION");
});

it("n", () => {
  const res = m.getBodyFromPrompt("N:3");
  expect(res.taskType).toBe("TEXT_IMAGE");
});

it("outpaint", () => {
  const res = m.getBodyFromPrompt("OUTPAINT(DEFAULT)");
  expect(res.taskType).toBe("OUTPAINTING");
});

it("outpaint", () => {
  const res = m.getBodyFromPrompt("OUTPAINT");
  expect(res.taskType).toBe("OUTPAINTING");
});

it("support a complex prompt", () => {
  const res = m.getBodyFromPrompt(
    "OUTPAINT N:2 SIMILAR:0.5 CONDITION(CANNY_EDGE:0.2) COLORS(#000000) NEGATIVE(dogs) REMOVE_BACKGROUND MASK(bird)"
  );
  expect(res.taskType).toBe("COLOR_GUIDED_GENERATION");
});

it("retrieves the instructions a complex prompt", () => {
  const res = m.getBodyFromPrompt(
    "  a nice view of the sea OUTPAINT N:2 SIMILAR:0.5 with a dog running CONDITION(CANNY_EDGE:0.2) COLORS(#000000) NEGATIVE(dogs) really cool REMOVE_BACKGROUND MASK(bird)"
  );
  expect(res.taskType).toBe("COLOR_GUIDED_GENERATION");
});

it("virtual try on", () => {
  const res = m.getBodyFromPrompt("VIRTUAL_TRY_ON", ["vQQQ", "vQQQ"]);
  expect(res.taskType).toBe("VIRTUAL_TRY_ON");
});

it("virtual try on options", () => {
  const res = m.getBodyFromPrompt(
    `VIRTUAL_TRY_ON MASK_TYPE(GARMENT) MASK_SHAPE(CONTOUR) 
    GARMENT_CLASS(OTHER_UPPER_BODY) SLEEVE_DOWN TUCKED OUTER_CLOSED BODY_OFF HANDS_ON MERGE_STYLE(SEAMLESS)`,
    ["vQQQ", "vQQQ"]
  );
  expect(res).toMatchObject({
    taskType: "VIRTUAL_TRY_ON",
    virtualTryOnParams: {
      sourceImage: "vQQQ",
      referenceImage: "vQQQ",
      maskType: "GARMENT",
      garmentBasedMask: {
        maskShape: "CONTOUR",
        garmentClass: "OTHER_UPPER_BODY",
        garmentStyling: {
          longSleeveStyle: "SLEEVE_DOWN",
          tuckingStyle: "TUCKED",
          outerLayerStyle: "CLOSED",
        },
      },
      mergeStyle: "SEAMLESS",
      maskExclusions: {
        preserveBodyPose: "OFF",
        preserveHands: "ON",
        preserveFace: "DEFAULT",
      },
    },
  });
});

it("virtual try on options defaults", () => {
  const res = m.getBodyFromPrompt(
    `VIRTUAL_TRY_ON MASK_TYPE(PROMPT) MASK(A palm)
    MERGE_STYLE(SEAMLESS)`,
    ["vQQQ", "vQQQ"]
  );
  expect(res).toMatchObject({
    taskType: "VIRTUAL_TRY_ON",
    virtualTryOnParams: {
      sourceImage: "vQQQ",
      referenceImage: "vQQQ",
      maskType: "PROMPT",
      promptBasedMask: {
        maskShape: "DEFAULT",
        maskPrompt: "A palm",
      },
      maskExclusions: {
        preserveBodyPose: "DEFAULT",
        preserveHands: "DEFAULT",
        preserveFace: "DEFAULT",
      },
    },
  });
});
