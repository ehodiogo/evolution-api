"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtendimentoResource = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const node_fetch_1 = __importDefault(require("node-fetch"));
class AtendimentoResource {
    static async toggleAtendimentoHumano(node, authToken, conversaId, ativar) {
        try {
            const body = { ativar: ativar };
            const url = `https://backend.loomiecrm.com/conversas/${conversaId}/atendimento-humano/`;
            const response = await (0, node_fetch_1.default)(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;
                try {
                    const errorData = (await response.json());
                    if (errorData.error) {
                        errorMessage = errorData.error;
                    }
                }
                catch (e) {
                }
                throw new n8n_workflow_1.NodeOperationError(node, errorMessage);
            }
            return await response.json();
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao ${ativar ? 'ativar' : 'desativar'} atendimento humano: ${error.message}`);
        }
    }
}
exports.AtendimentoResource = AtendimentoResource;
//# sourceMappingURL=AtendimentoResource.js.map