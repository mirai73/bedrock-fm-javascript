import { Titan } from "../src/amazon";
import { Models } from "../src/bedrock";

describe("test titan generate", () => {
  it("should return true", async () => {
    const m = new Titan("amazon.titan-text-express-v1", {
      region: "us-west-2",
      stopSequences: [],
    });

    expect(m).toBeTruthy();
    expect((await m.generate("Hello", {})).length).toBeGreaterThan(0);
  });
});

describe("test titan chat", () => {
  it("should return true", async () => {
    const m = new Titan("amazon.titan-text-express-v1", {
      region: "us-west-2",
      stopSequences: [],
    });

    expect(m).toBeTruthy();
    expect(
      (await m.chat([{ role: "human", message: "Hello" }])).message.length,
    ).toBeGreaterThan(0);
  });
});

describe("test titan premier chat", () => {
  it("should return true", async () => {
    const m = new Titan(Models.AMAZON_TITAN_TEXT_PREMIER_V1_0, {
      region: "us-east-1",
      stopSequences: [],
    });

    expect(m).toBeTruthy();
    expect(
      (await m.chat([{ role: "human", message: "Hello" }])).message.length,
    ).toBeGreaterThan(0);
  });
});

describe("test titan lite chat", () => {
  it("should return true", async () => {
    const m = new Titan(Models.AMAZON_TITAN_TEXT_LITE_V1, {
      region: "us-east-1",
      stopSequences: [],
    });

    expect(m).toBeTruthy();
    expect(
      (await m.chat([{ role: "human", message: "Hello" }])).message.length,
    ).toBeGreaterThan(0);
  });
});

describe("test titan tg1 chat", () => {
  it("should return true", async () => {
    const m = new Titan(Models.AMAZON_TITAN_TG1_LARGE, {
      region: "us-east-1",
      stopSequences: [],
    });

    expect(m).toBeTruthy();
    expect(
      (await m.chat([{ role: "human", message: "Hello" }])).message.length,
    ).toBeGreaterThan(0);
  });
});
