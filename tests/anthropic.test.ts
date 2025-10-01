import { Claude3, fromModelId, Models } from "../src/main";

describe("test claude models generate with inf profile", () => {
  [
    Models.ANTHROPIC_CLAUDE_SONNET_4_5_20250929_V1_0,
    Models.ANTHROPIC_CLAUDE_SONNET_4_20250514_V1_0,
    Models.ANTHROPIC_CLAUDE_3_7_SONNET_20250219_V1_0,
  ].map((name) =>
    it(`invoking ${name} should return a response`, async () => {
      const m = fromModelId("us." + name, {
        region: "us-west-2",
      });

      expect(m).toBeTruthy();
      const resp = await m.generate("Hello");
      expect(resp.length).toBeGreaterThan(0);
    }, 10000)
  );
});

describe("test claude models chat", () => {
  [
    Models.ANTHROPIC_CLAUDE_3_HAIKU_20240307_V1_0,
    Models.ANTHROPIC_CLAUDE_3_SONNET_20240229_V1_0,
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

describe("test claude 3-7 with inference profile", () => {
  it("should return a message", async () => {
    const m = new Claude3(
      "us." + Models.ANTHROPIC_CLAUDE_3_7_SONNET_20250219_V1_0,
      {
        region: "us-west-2",
      }
    );

    expect(m).toBeTruthy();
    const resp = await m.chat([{ role: "human", message: "Hello" }], {
      modelArgs: { top_k: 40, top_p: 0.8, temperature: 0, stop_sequences: [] },
    });
    expect(resp.message.length).toBeGreaterThan(0);
  });
});

describe("test claude 4.5 body", () => {
  it("should return a message", async () => {
    const m = new Claude3(
      "us." + Models.ANTHROPIC_CLAUDE_SONNET_4_5_20250929_V1_0,
      { region: "us-west-2" }
    );

    expect(m).toBeTruthy();
    const body = m.prepareBody([{ role: "human", message: "Hello" }], {
      temperature: 0,
      stop_sequences: [],
    });
    console.log(body);
    expect(body).toBe(
      '{"messages":[{"role":"user","content":"Hello"}],"anthropic_version":"bedrock-2023-05-31","max_tokens":512,"stop_sequences":[],"temperature":0}'
    );
  });
});

describe("test claude 4.5 with inference profile", () => {
  it("should return a message", async () => {
    const m = new Claude3(
      "us." + Models.ANTHROPIC_CLAUDE_SONNET_4_5_20250929_V1_0,
      { region: "us-west-2" }
    );

    expect(m).toBeTruthy();
    const resp = await m.chat([{ role: "human", message: "Hello" }], {
      modelArgs: { temperature: 0, stop_sequences: [] },
    });
    expect(resp.message.length).toBeGreaterThan(0);
  });
});
