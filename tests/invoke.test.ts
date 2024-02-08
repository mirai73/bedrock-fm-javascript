// create a test for the function
import { Jurassic } from "../src/ai21";
import { Titan } from "../src/amazon";
import { Claude } from "../src/anthropic";
import { Command } from "../src/cohere";

describe("test claude", () => {
  it("should return true", async () => {
    const m = new Claude({
      modelId: "anthropic.claude-instant-v1",
      region: "us-west-2",
    });

    expect(m).toBeTruthy();
    expect((await m.generate("Hello", {})).length).toBeGreaterThan(0);
  });
});

describe("test titan", () => {
  it("should return true", async () => {
    const m = new Titan({
      modelId: "amazon.titan-text-express-v1",
      region: "us-west-2",
    });

    expect(m).toBeTruthy();
    expect((await m.generate("Hello", {})).length).toBeGreaterThan(0);
  });
});

describe("test jurassic", () => {
  it("should return true", async () => {
    const m = new Jurassic({
      modelId: "ai21.j2-ultra",
      region: "us-west-2",
    });

    expect(m).toBeTruthy();
    expect((await m.generate("Hello", {})).length).toBeGreaterThan(0);
  });
});

describe("test cohere command", () => {
  it("should return true", async () => {
    const m = new Command({
      modelId: "cohere.command-text-v14",
      region: "us-west-2",
    });

    expect(m).toBeTruthy();
    expect((await m.generate("Hello", {})).length).toBeGreaterThan(0);
  });
});

describe("test async claude", () => {
  it("should return true", async () => {
    const m = new Claude({
      modelId: "anthropic.claude-instant-v1",
      region: "us-west-2",
    });

    expect(m).toBeTruthy();
    const stream = await m.generateStream("Hello", {});
    let s = "";
    for await (const chunk of stream) {
      s += chunk;
    }
    expect(s.length).toBeGreaterThan(0);
  });
});

describe("test async titan", () => {
  it("should return true", async () => {
    const m = new Titan({
      modelId: "amazon.titan-text-express-v1",
      region: "us-west-2",
    });

    expect(m).toBeTruthy();
    const stream = await m.generateStream("Hello", {});
    let s = "";
    for await (const chunk of stream) {
      s += chunk;
    }
    expect(s.length).toBeGreaterThan(0);
  });
});

describe("test async command", () => {
  it("should return true", async () => {
    const m = new Command({
      modelId: "cohere.command-light-text-v14",
      region: "us-west-2",
    });

    expect(m).toBeTruthy();
    const stream = await m.generateStream("Hello", {});
    let s = "";
    for await (const chunk of stream) {
      s += chunk;
    }
    expect(s.length).toBeGreaterThan(0);
  });
});
