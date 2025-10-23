"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NegociosResource = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const node_fetch_1 = __importDefault(require("node-fetch"));
class NegociosResource {
    static async criarNegocio(node, authToken, titulo, valor, estagioId, contatoId, presetId) {
        try {
            const body = { titulo, valor, estagio_id: estagioId, contato_id: contatoId };
            if (presetId !== undefined) {
                body.preset_id = presetId;
            }
            const response = await (0, node_fetch_1.default)('https://backend.loomiecrm.com/negocios/', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new n8n_workflow_1.NodeOperationError(node, `Erro na API: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar negócio: ${error.message}`);
        }
    }
    static async obterNegocio(node, authToken, negocioId) {
        try {
            const response = await (0, node_fetch_1.default)(`https://backend.loomiecrm.com/negocios/${negocioId}/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new n8n_workflow_1.NodeOperationError(node, `Erro na API: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao obter negócio: ${error.message}`);
        }
    }
    static async editarNegocio(node, authToken, negocioId, titulo, valor, estagioId, contatoId) {
        try {
            const body = {};
            if (titulo !== undefined)
                body.titulo = titulo;
            if (valor !== undefined)
                body.valor = valor;
            if (estagioId !== undefined)
                body.estagio_id = estagioId;
            if (contatoId !== undefined)
                body.contato_id = contatoId;
            const response = await (0, node_fetch_1.default)(`https://backend.loomiecrm.com/negocios/${negocioId}/`, {
                method: 'PATCH',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(body),
            });
            if (!response.ok) {
                throw new n8n_workflow_1.NodeOperationError(node, `Erro na API: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao editar negócio: ${error.message}`);
        }
    }
    static async trocarEstagio(node, authToken, negocioId, novoEstagioId) {
        return this.editarNegocio(node, authToken, negocioId, undefined, undefined, novoEstagioId, undefined);
    }
    static async obterNegociosPorEstagio(node, authToken, kanbanId, estagioId) {
        try {
            const response = await (0, node_fetch_1.default)(`https://backend.loomiecrm.com/kanban/${kanbanId}/estagio/${estagioId}/negocios/`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                throw new n8n_workflow_1.NodeOperationError(node, `Erro na API: ${response.status} ${response.statusText}`);
            }
            return await response.json();
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao obter negócios por estágio: ${error.message}`);
        }
    }
    static async buscarNegocioPorTelefone(node, authToken, telefone, kanbanId, estagioId) {
        try {
            let url = `https://backend.loomiecrm.com/buscar-por-telefone/?telefone=${telefone}`;
            if (kanbanId) {
                url += `&kanban_id=${kanbanId}`;
            }
            if (estagioId) {
                url += `&estagio_id=${estagioId}`;
            }
            const response = await (0, node_fetch_1.default)(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const responseData = (await response.json());
                const errorMessage = responseData.error || `${response.status} ${response.statusText}`;
                if (response.status === 404) {
                    throw new n8n_workflow_1.NodeOperationError(node, `Busca de Negócio: ${errorMessage}`);
                }
                throw new n8n_workflow_1.NodeOperationError(node, `Erro na API: ${errorMessage}`);
            }
            return await response.json();
        }
        catch (error) {
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao buscar negócio por telefone: ${error.message}`);
        }
    }
}
exports.NegociosResource = NegociosResource;
//# sourceMappingURL=NegociosResource.js.map