"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BedrockFoundationModel = void 0;
const client_bedrock_runtime_1 = require("@aws-sdk/client-bedrock-runtime");
class BedrockFoundationModel {
    static fromModelId(params) {
        const model = new this(params);
        return model;
    }
    constructor(params) {
        this.extraArgs = params.modelArgs;
        this.topP = params.topP ?? 0.9;
        this.temperature = params.temperature ?? 0.7;
        this.maxTokenCount = params.maxTokenCount ?? 512;
        this.stopSequences = params.stopSequences ?? [];
        this.modelId = params.modelId;
        this.client =
            params.client ??
                new client_bedrock_runtime_1.BedrockRuntimeClient({
                    region: params?.region,
                    credentials: params?.credentials,
                });
    }
    async generateStream(prompt, input) {
        const body = this.prepareBody(prompt, input);
        const command = new client_bedrock_runtime_1.InvokeModelWithResponseStreamCommand({
            modelId: this.modelId,
            contentType: "application/json",
            body: body,
            accept: "application/json",
        });
        const decoder = new TextDecoder("utf-8");
        const self = this;
        const resp = await this.client.send(command);
        return (async function* () {
            for await (const x of resp.body) {
                yield self.getResults(decoder.decode(x.chunk?.bytes))[0] ?? "";
            }
        })();
    }
    async generate(prompt, input) {
        const body = this.prepareBody(prompt, input);
        const command = new client_bedrock_runtime_1.InvokeModelCommand({
            modelId: this.modelId,
            contentType: "application/json",
            body: body,
            accept: "application/json",
        });
        const result = await this.client.send(command);
        return this.getResults(result.body.transformToString("utf8"));
    }
}
exports.BedrockFoundationModel = BedrockFoundationModel;
//# sourceMappingURL=bedrock.js.map