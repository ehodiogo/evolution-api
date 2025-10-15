"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KnowledgeResource = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class KnowledgeResource {
    static async criarBaseDeConhecimentoCompleta(node, authToken, client_id, name, fields = [], entries = []) {
        const url = 'https://backend.loomiecrm.com/sets/create_full/';
        try {
            if (!client_id || !name) {
                throw new n8n_workflow_1.NodeOperationError(node, "O 'client_id' e o 'name' da Knowledge Base são obrigatórios.");
            }
            const bodyPayload = {
                client: client_id,
                name: name,
                fields: fields,
                entries: entries,
            };
            const body = JSON.stringify(bodyPayload);
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: body,
            });
            if (!response.ok) {
                let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;
                try {
                    const errorJson = await response.json();
                    if (typeof errorJson === 'object' && errorJson !== null) {
                        errorMessage = errorJson.error || JSON.stringify(errorJson);
                    }
                }
                catch (e) {
                }
                throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar Base de Conhecimento Completa: ${errorMessage}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw error;
            }
            throw new n8n_workflow_1.NodeOperationError(node, `Falha de conexão ou processamento: ${error.message}`);
        }
    }
}
exports.KnowledgeResource = KnowledgeResource;
//# sourceMappingURL=KnowledgeResource.js.map