"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Titan = void 0;
const bedrock_1 = require("./bedrock");
class Titan extends bedrock_1.BedrockFoundationModel {
    prepareBody(prompt, input) {
        return JSON.stringify({
            inputText: prompt,
            textGenerationConfig: {
                maxTokenCount: input.modelArgs?.get("maxTokenCount") ??
                    input.maxTokenCount ??
                    this.maxTokenCount,
                stopSequences: input.modelArgs?.get("stopSequences") ??
                    input.stopSequences ??
                    this.stopSequences,
                topP: input.modelArgs?.get("topP") ?? input.topP ?? this.topP,
                temperature: input.modelArgs?.get("temperature") ??
                    input.temperature ??
                    this.temperature,
            },
        });
    }
    getResults(body) {
        const b = JSON.parse(body);
        if (b.results) {
            return b.results.map((r) => r.outputText);
        }
        else {
            return [b.outputText];
        }
    }
}
exports.Titan = Titan;
//# sourceMappingURL=amazon.js.map