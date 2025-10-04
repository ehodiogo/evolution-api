"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AtributosResource = exports.ATRIBUTO_TYPE_CHOICES = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const node_fetch_1 = __importDefault(require("node-fetch"));
exports.ATRIBUTO_TYPE_CHOICES = {
    BOOLEAN: 'boolean',
    INTEGER: 'integer',
    FLOAT: 'float',
    STRING: 'string',
    DATE: 'date',
    DATETIME: 'datetime',
    TIME: 'time',
    TEXT: 'text',
};
class AtributosResource {
    static async criarAtributoPersonalizavel(node, authToken, negocioId, label, valor, type) {
        try {
            if (!negocioId) {
                throw new n8n_workflow_1.NodeOperationError(node, 'O ID do Negócio deve ser fornecido para criar o atributo personalizado.');
            }
            const endpoint = `https://backend.loomiecrm.com/atributos-personalizaveis/${negocioId}/`;
            const body = {
                label,
                valor,
                type,
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
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar Atributo Personalizável: ${error.message}`);
        }
    }
}
exports.AtributosResource = AtributosResource;
//# sourceMappingURL=AtributosResource.js.map