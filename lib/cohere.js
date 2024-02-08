"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Command = void 0;
const bedrock_1 = require("./bedrock");
/**
 * Instantiates a new instance to interact with Command foundation model via Amazon Bedrock
 *
 */
class Command extends bedrock_1.BedrockFoundationModel {
    prepareBody(prompt, input) {
        const modelArgs = (({ k, num_generations }) => ({
            num_generations,
            k,
        }))(input.modelArgs ?? {});
        return JSON.stringify({
            prompt: prompt,
            max_tokens: input.modelArgs?.get("max_tokens") ??
                input.maxTokenCount ??
                this.maxTokenCount,
            stop_sequences: input.modelArgs?.get("stop_sequences") ??
                input.stopSequences ??
                this.stopSequences,
            p: input.modelArgs?.get("p") ?? input.topP ?? this.topP,
            temperature: input.modelArgs?.get("temperature") ??
                input.temperature ??
                this.temperature,
            stream: false,
            ...modelArgs,
        });
    }
    getResults(body) {
        return JSON.parse(body).generations.map((g) => {
            if (g.is_finished) {
                const t = g.text;
                return t === "<EOS_TOKEN>" ? "\n" : t;
            }
            else if (g.finish_reason === "COMPLETE") {
                return g.text;
            }
            return "";
        });
    }
}
exports.Command = Command;
//# sourceMappingURL=cohere.js.map