import { Models } from "../src/bedrock";
import { Jurassic, fromModelId } from "../src/main";

describe("test claude models generate", () => {
  [Models.AI21_J2_MID_V1, Models.AI21_J2_ULTRA_V1].map((name) =>
    it("should return true", async () => {
      const m = fromModelId(name, {
        region: "us-west-2",
      });

      expect(m).toBeTruthy();
      const resp = await m.generate("Hello");
      expect(resp.length).toBeGreaterThan(0);
    })
  );
});

describe("test claude models chat", () => {
  [Models.AI21_J2_MID_V1, Models.AI21_J2_ULTRA_V1].map((name) =>
    it("should return true", async () => {
      const m = fromModelId(name, {
        region: "us-west-2",
      });

      expect(m).toBeTruthy();
      const resp = await m.chat([{ role: "human", message: "Hello" }]);
      expect(resp.message.length).toBeGreaterThan(0);
    })
  );
});

describe("test claude models raw response", () => {
  [Models.AI21_J2_MID_V1].map((name) =>
    it("should return true", async () => {
      const m = fromModelId(name, {
        region: "us-west-2",
        rawResponse: true,
      });

      expect(m).toBeTruthy();
      const resp = await m.chat([{ role: "human", message: "Hello" }]);
      expect(resp.metadata).toBeTruthy();
    })
  );
});

describe("test claude models params", () => {
  it("should return true", async () => {
    const m = new Jurassic(Models.AI21_J2_MID_V1, {
      region: "us-west-2",
    });

    expect(m).toBeTruthy();
    const resp = await m.chat([{ role: "human", message: "Hello" }], {
      modelArgs: {
        temperature: 0.7,
        topKReturn: 30,
        maxTokens: 200,
        minTokens: 1,
        topP: 0.99,
        countPenalty: {
          scale: 0.7,
          applyToEmojis: true,
          applyToNumbers: false,
          applyToStopwords: true,
          applyToPunctuations: true,
          applyToWhitespaces: true,
        },
        frequencyPenalty: { scale: 3, applyToEmojis: true },
        numResults: 2,
        presencePenalty: { scale: 0, applyToNumbers: true },
        stopSequences: ["hello"],
      },
    });
    expect(resp.message.length).toBeGreaterThan(0);
  });
});
