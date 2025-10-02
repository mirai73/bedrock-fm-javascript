// create a test for the function
import { Models, fromModelId } from "../src/main";

describe("test generate stream", () => {
  [
    Models.ANTHROPIC_CLAUDE_3_HAIKU_20240307_V1_0,
    "us." + Models.ANTHROPIC_CLAUDE_SONNET_4_20250514_V1_0,
    Models.AMAZON_NOVA_MICRO_V1_0,
    Models.COHERE_COMMAND_R_V1_0,
    Models.AI21_JAMBA_1_5_MINI_V1_0,
    Models.META_LLAMA3_8B_INSTRUCT_V1_0,
    "us." + Models.META_LLAMA4_MAVERICK_17B_INSTRUCT_V1_0,
    Models.MISTRAL_MISTRAL_7B_INSTRUCT_V0_2,
    Models.OPENAI_GPT_OSS_20B_1_0,
    Models.QWEN_QWEN3_32B_V1_0,
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

describe("test chat stream", () => {
  [
    Models.ANTHROPIC_CLAUDE_3_HAIKU_20240307_V1_0,

    Models.AMAZON_TITAN_TEXT_LITE_V1,

    Models.COHERE_COMMAND_R_V1_0,
    Models.AI21_JAMBA_1_5_MINI_V1_0,
    Models.META_LLAMA3_8B_INSTRUCT_V1_0,
    Models.MISTRAL_MISTRAL_7B_INSTRUCT_V0_2,
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
