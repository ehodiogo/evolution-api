"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ContatosResource = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class ContatosResource {
    static async listarContatos(node, authToken) {
        try {
            const response = await fetch('https://backend.loomiecrm.com/contatos/', {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new n8n_workflow_1.NodeOperationError(node, `Erro na API: ${response.status} ${response.statusText}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao listar contatos: ${error.message}`);
        }
    }
}
exports.ContatosResource = ContatosResource;
//# sourceMappingURL=ContatosResource.js.map