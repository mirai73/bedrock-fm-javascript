import { Jurassic, fromModelId, Models } from "../src/main";

describe("test ai21 models generate", () => {
  [Models.AI21_J2_MID_V1, Models.AI21_J2_ULTRA_V1].map((name) =>
    it("should return true", async () => {
      const m = fromModelId(name, {
        region: "us-east-1",
      });

      expect(m).toBeTruthy();
      const resp = await m.generate("Hello");
      expect(resp.length).toBeGreaterThan(0);
    }),
  );
});

describe("test ai21 models chat", () => {
  [Models.AI21_J2_MID_V1, Models.AI21_J2_ULTRA_V1].map((name) =>
    it("should return true", async () => {
      const m = fromModelId(name, {
        region: "us-east-1",
      });

      expect(m).toBeTruthy();
      const resp = await m.chat([{ role: "human", message: "Hello" }]);
      expect(resp.message.length).toBeGreaterThan(0);
    }),
  );
});

describe("test ai21 models raw response", () => {
  [Models.AI21_J2_MID_V1].map((name) =>
    it("should return true", async () => {
      const m = fromModelId(name, {
        region: "us-east-1",
        rawResponse: true,
      });

      expect(m).toBeTruthy();
      const resp = await m.chat([{ role: "human", message: "Hello" }]);
      expect(resp.metadata).toBeTruthy();
    }),
  );
});

describe("test ai21 models params", () => {
  it("should return true", async () => {
    const m = new Jurassic(Models.AI21_J2_ULTRA_V1, {
      region: "us-east-1",
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

describe("test ai21 jamba models generate", () => {
  [Models.AI21_JAMBA_1_5_MINI_V1_0].map((name) =>
    it("should return true", async () => {
      const m = fromModelId(name, {
        region: "us-east-1",
      });

      expect(m).toBeTruthy();
      const resp = await m.generate("Hello");
      expect(resp.length).toBeGreaterThan(0);
    }),
  );
});

describe("test  jamba models chat", () => {
  [Models.AI21_JAMBA_1_5_MINI_V1_0].map((name) =>
    it("should return true", async () => {
      const m = fromModelId(name, {
        region: "us-east-1",
      });

      expect(m).toBeTruthy();
      const resp = await m.chat([{ role: "human", message: "Hello" }]);
      expect(resp.message.length).toBeGreaterThan(0);
    }),
  );
});
