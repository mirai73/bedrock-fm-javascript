"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Jurassic = void 0;
const bedrock_1 = require("./bedrock");
class Jurassic extends bedrock_1.BedrockFoundationModel {
    prepareBody(prompt, input) {
        const modelArgs = (({ minTokens, numResults }) => ({
            minTokens,
            numResults,
        }))(input.modelArgs ?? {});
        return JSON.stringify({
            prompt: prompt, //@ts-ignore
            maxTokens: input.modelArgs?.get("maxTokens") ??
                input.maxTokenCount ??
                this.maxTokenCount, //@ts-ignore
            stopSequences: input.modelArgs?.get("stopSequences") ??
                input.stopSequences ??
                this.stopSequences,
            temperature: input.modelArgs?.get("temperature") ??
                input.temperature ??
                this.temperature, //@ts-ignore
            topP: input.modelArgs?.get("topP") ?? input.topP ?? this.topP,
            ...modelArgs,
        });
    }
    getResults(body) {
        return JSON.parse(body).completions.map((c) => c.data.text);
    }
}
exports.Jurassic = Jurassic;
//# sourceMappingURL=ai21.js.map