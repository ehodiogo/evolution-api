"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificacaoResource = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const node_fetch_1 = __importDefault(require("node-fetch"));
class NotificacaoResource {
    static async criarNotificacao(node, authToken, tipo, texto, userId) {
        try {
            const body = { tipo, texto, user_id: userId };
            const response = await (0, node_fetch_1.default)('https://backend.loomiecrm.com/notificacoes/', {
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
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar notificação: ${error.message}`);
        }
    }
}
exports.NotificacaoResource = NotificacaoResource;
//# sourceMappingURL=NotificacaoResource.js.map