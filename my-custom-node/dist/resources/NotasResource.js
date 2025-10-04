"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotasResource = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const node_fetch_1 = __importDefault(require("node-fetch"));
class NotasResource {
    static async criarNotaAtendimento(node, authToken, titulo, conteudo, tipo, conversaId) {
        try {
            const endpoint = conversaId
                ? `https://backend.loomiecrm.com/conversas/${conversaId}/notas/`
                : 'https://backend.loomiecrm.com/notas/';
            const body = {
                titulo,
                conteudo,
                tipo,
            };
            const response = await (0, node_fetch_1.default)(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                const errorBody = await response.json();
                throw new n8n_workflow_1.NodeOperationError(node, `Erro na API (${response.status} ${response.statusText}): ${JSON.stringify(errorBody)}`);
            }
            return await response.json();
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar nota de atendimento: ${error.message}`);
        }
    }
}
exports.NotasResource = NotasResource;
//# sourceMappingURL=NotasResource.js.map