"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// create a test for the function
const ai21_1 = require("../src/ai21");
const amazon_1 = require("../src/amazon");
const anthropic_1 = require("../src/anthropic");
const cohere_1 = require("../src/cohere");
describe("test claude", () => {
    it("should return true", async () => {
        const m = new anthropic_1.Claude({
            modelId: "anthropic.claude-instant-v1",
            region: "us-west-2",
        });
        expect(m).toBeTruthy();
        expect((await m.generate("Hello", {})).length).toBeGreaterThan(0);
    });
});
describe("test titan", () => {
    it("should return true", async () => {
        const m = new amazon_1.Titan({
            modelId: "amazon.titan-text-express-v1",
            region: "us-west-2",
        });
        expect(m).toBeTruthy();
        expect((await m.generate("Hello", {})).length).toBeGreaterThan(0);
    });
});
describe("test jurassic", () => {
    it("should return true", async () => {
        const m = new ai21_1.Jurassic({
            modelId: "ai21.j2-ultra",
            region: "us-west-2",
        });
        expect(m).toBeTruthy();
        expect((await m.generate("Hello", {})).length).toBeGreaterThan(0);
    });
});
describe("test cohere command", () => {
    it("should return true", async () => {
        const m = new cohere_1.Command({
            modelId: "cohere.command-text-v14",
            region: "us-west-2",
        });
        expect(m).toBeTruthy();
        expect((await m.generate("Hello", {})).length).toBeGreaterThan(0);
    });
});
//# sourceMappingURL=invoke.test.js.map