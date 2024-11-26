import { Claude3, fromModelId, Models } from "../src/main";

describe("test claude models generate", () => {
  [
    Models.ANTHROPIC_CLAUDE_3_HAIKU_20240307_V1_0,
    Models.ANTHROPIC_CLAUDE_3_SONNET_20240229_V1_0,
    Models.ANTHROPIC_CLAUDE_INSTANT_V1,
    Models.ANTHROPIC_CLAUDE_V2_1,
    Models.ANTHROPIC_CLAUDE_V2_1,
  ].map((name) =>
    it(`invoking ${name} should return a response`, async () => {
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
  [
    Models.ANTHROPIC_CLAUDE_3_HAIKU_20240307_V1_0,
    Models.ANTHROPIC_CLAUDE_3_SONNET_20240229_V1_0,
    Models.ANTHROPIC_CLAUDE_INSTANT_V1,
    Models.ANTHROPIC_CLAUDE_V2_1,
    Models.ANTHROPIC_CLAUDE_V2_1,
  ].map((name) =>
    it(`invoking ${name} should return a message`, async () => {
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
  [Models.ANTHROPIC_CLAUDE_3_HAIKU_20240307_V1_0].map((name) =>
    it(`invoking ${name} should return metadata`, async () => {
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
  it("should return a message", async () => {
    const m = new Claude3(Models.ANTHROPIC_CLAUDE_3_HAIKU_20240307_V1_0, {
      region: "us-west-2",
    });

    expect(m).toBeTruthy();
    const resp = await m.chat([{ role: "human", message: "Hello" }], {
      modelArgs: { top_k: 40, top_p: 0.8, temperature: 0, stop_sequences: [] },
    });
    expect(resp.message.length).toBeGreaterThan(0);
  });
});
