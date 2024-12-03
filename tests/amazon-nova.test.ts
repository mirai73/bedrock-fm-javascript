import { Nova, Models, fromModelId } from "../src/main";

describe("test Nova generate", () => {
  [
    Models.AMAZON_NOVA_LITE_V1_0,
    Models.AMAZON_NOVA_MICRO_V1_0,
    //Models.AMAZON_NOVA_PRO_V1_0,
  ].forEach((m) => {
    it(`model ${m} works in generate mode`, async () => {
      const llm = new Nova(m, {
        region: "us-east-1",
        stopSequences: [],
      });

      expect(llm).toBeTruthy();
      const resp = await llm.generate("Hello");
      expect(resp.length).toBeGreaterThan(0);
      expect(resp[0]?.length).toBeGreaterThan(0);
    });
  });
});

describe("test Nova chat", () => {
  [
    Models.AMAZON_NOVA_LITE_V1_0,
    Models.AMAZON_NOVA_MICRO_V1_0,
    //Models.AMAZON_NOVA_PRO_V1_0,
  ].forEach((m) => {
    it(`model ${m} works in chat mode`, async () => {
      const llm = new Nova(m, {
        region: "us-east-1",
        stopSequences: [],
      });

      expect(llm).toBeTruthy();
      expect(
        (await llm.chat([{ role: "human", message: "Hello" }])).message.length
      ).toBeGreaterThan(0);
    });
  });
});

describe("test Nova chat with system", () => {
  [
    Models.AMAZON_NOVA_LITE_V1_0,
    Models.AMAZON_NOVA_MICRO_V1_0,
    //Models.AMAZON_NOVA_PRO_V1_0,
  ].forEach((m) => {
    it(`model ${m} works in chat mode`, async () => {
      const llm = new Nova(m, {
        region: "us-east-1",
        stopSequences: [],
      });

      expect(llm).toBeTruthy();
      expect(
        (
          await llm.chat([
            { role: "system", message: "You are a pirate" },
            { role: "human", message: "Hello" },
          ])
        ).message.length
      ).toBeGreaterThan(0);
    });
  });
});

describe("test Nova generate streaming", () => {
  [
    Models.AMAZON_NOVA_LITE_V1_0,
    Models.AMAZON_NOVA_MICRO_V1_0,
    //Models.AMAZON_NOVA_PRO_V1_0,
  ].forEach((m) => {
    it(`model ${m} works in generate mode`, async () => {
      const llm = new Nova(m, {
        region: "us-east-1",
        stopSequences: [],
      });

      expect(llm).toBeTruthy();
      const resp = await llm.generate("Hello");
      expect(resp.length).toBeGreaterThan(0);
      expect(resp[0]?.length).toBeGreaterThan(0);
    });
  });
});

describe("test Nova chat streaming", () => {
  [
    Models.AMAZON_NOVA_LITE_V1_0,
    Models.AMAZON_NOVA_MICRO_V1_0,
    //Models.AMAZON_NOVA_PRO_V1_0,
  ].forEach((m) => {
    it(`model ${m} works in chat mode`, async () => {
      const llm = new Nova(m, {
        region: "us-east-1",
        stopSequences: [],
      });

      expect(llm).toBeTruthy();
      expect(
        (await llm.chat([{ role: "human", message: "Hello" }])).message.length
      ).toBeGreaterThan(0);
    });
  });
});

describe("test Nova chat stream", () => {
  [
    Models.AMAZON_NOVA_LITE_V1_0,
    Models.AMAZON_NOVA_MICRO_V1_0,
    //Models.AMAZON_NOVA_PRO_V1_0,
  ].map((name) =>
    it(`invoking ${name} chat in streaming mode should return a stream`, async () => {
      const m = fromModelId(name, {
        region: "us-east-1",
      });

      expect(m).toBeTruthy();
      const stream = await m.chatStream([{ role: "human", message: "Hello" }]);
      let s = "";
      for await (const chunk of stream) {
        s += chunk;
      }
      expect(s.length).toBeGreaterThan(0);
    }, 10000)
  );
});

describe("test Nova generate stream", () => {
  [
    Models.AMAZON_NOVA_LITE_V1_0,
    Models.AMAZON_NOVA_MICRO_V1_0,
    Models.AMAZON_NOVA_PRO_V1_0,
  ].map((name) =>
    it(`invoking ${name} generation in streaming mode should return a stream`, async () => {
      const m = fromModelId(name, {
        region: "us-east-1",
      });

      expect(m).toBeTruthy();
      const stream = await m.generateStream("Hello");
      let s = "";
      for await (const chunk of stream) {
        s += chunk;
      }
      expect(s.length).toBeGreaterThan(0);
    }, 10000)
  );
});
