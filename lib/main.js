"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fromModelId = exports.Command = exports.Titan = exports.Jurassic = exports.Claude = void 0;
const anthropic_1 = require("./anthropic");
Object.defineProperty(exports, "Claude", { enumerable: true, get: function () { return anthropic_1.Claude; } });
const ai21_1 = require("./ai21");
Object.defineProperty(exports, "Jurassic", { enumerable: true, get: function () { return ai21_1.Jurassic; } });
const amazon_1 = require("./amazon");
Object.defineProperty(exports, "Titan", { enumerable: true, get: function () { return amazon_1.Titan; } });
const cohere_1 = require("./cohere");
Object.defineProperty(exports, "Command", { enumerable: true, get: function () { return cohere_1.Command; } });
function fromModelId(params) {
    switch (params.modelId.split("-")[0]) {
        case "anthropic.claude":
            return new anthropic_1.Claude(params);
        case "ai21.j2":
            return new ai21_1.Jurassic(params);
        case "amazon.titan":
            return new amazon_1.Titan(params);
        case "cohere.command":
            return new cohere_1.Command(params);
        default:
            throw new Error(`Unknown model ID: ${params.modelId}`);
    }
}
exports.fromModelId = fromModelId;
//# sourceMappingURL=main.js.map