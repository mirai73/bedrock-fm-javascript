import { NovaCanvas } from "../src/amazon_image";
import { ImageModels } from "../src/main";
const m = new NovaCanvas(ImageModels.AMAZON_NOVA_CANVAS_V1_0);

it("mask", () => {
  const res = m.getPromptElements("MASK(a dog)");
  expect(res.mask).toBe("a dog");
});

it("remove_background", () => {
  const res = m.getPromptElements("REMOVE_BACKGROUND");
  expect(res.removeBackground).toBe("REMOVE_BACKGROUND");
});

it("negative", () => {
  const res = m.getPromptElements("NEGATIVE(no clouds)");
  expect(res.negative).toBe("no clouds");
});

it("colors", () => {
  const res = m.getPromptElements("COLORS([120,120,43],[34,56,70], #FFAAOO)");
  expect(res.colors).toBe("[120,120,43],[34,56,70], #FFAAOO");
});

it("condition", () => {
  const res = m.getPromptElements("CONDITION(CANNY_EDGE:0.6)");
  expect(res.conditionImage).toBe("CANNY_EDGE:0.6");
});

it("condition integer", () => {
  const res = m.getPromptElements("CONDITION(CANNY_EDGE:1)");
  expect(res.conditionImage).toBe("CANNY_EDGE:1");
});

it("similar", () => {
  const res = m.getPromptElements("SIMILAR:0.6");
  expect(res.similarity).toBe("0.6");
});

it("similar with integer", () => {
  const res = m.getPromptElements("SIMILAR:1");
  expect(res.similarity).toBe("1");
});

it("outpaint", () => {
  const res = m.getPromptElements("OUTPAINT(DEFAULT)");
  expect(res.outpaint).toBe("DEFAULT");
});

it("outpaint", () => {
  const res = m.getPromptElements("OUTPAINT");
  expect(res.outpaint).toBe("OUTPAINT");
});

describe("should not match", () => {
  ["OUTPAINT"].forEach((p) => {
    const res = m.getPromptElements(p);
    expect(Object.values(res).filter((x) => x !== undefined)).toStrictEqual([
      "OUTPAINT",
      "DEFAULT",
      "DEFAULT",
      "DEFAULT",
    ]);
  });
});

it("support a complex prompt", () => {
  const res = m.getPromptElements(
    "OUTPAINT SIMILAR:0.5 STYLE(AA) MASK_TYPE(AA) GARMENT_TYPE(AA) CONDITION(CANNY_EDGE:0.2) COLORS(#000000) NEGATIVE(dogs) REMOVE_BACKGROUND MASK(bird)"
  );
  expect(Object.values(res).filter((x) => x === undefined).length).toEqual(6);
});

it("retrieves the instructions a complex prompt", () => {
  const res = m.getPromptElements(
    "  a nice view of the sea OUTPAINT SIMILAR:0.5 with a dog running CONDITION(CANNY_EDGE:0.2) COLORS(#000000) NEGATIVE(dogs) really cool REMOVE_BACKGROUND MASK(bird)"
  );
  expect(res.instructions).toBe(
    "a nice view of the sea with a dog running really cool"
  );
});
