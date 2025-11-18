"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CalendarioResource = void 0;
const n8n_workflow_1 = require("n8n-workflow");
class CalendarioResource {
    static async listarItens(node, authToken, dataInicio, dataFim, limite) {
        try {
            const queryParams = new URLSearchParams();
            if (dataInicio)
                queryParams.append('inicio__gte', dataInicio);
            if (dataFim)
                queryParams.append('fim__lte', dataFim);
            if (limite)
                queryParams.append('limit', String(limite));
            const url = `${CalendarioResource.BASE_URL}?${queryParams.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.ok) {
                const errorDetail = await CalendarioResource.getApiErrorDetail(response);
                throw new n8n_workflow_1.NodeOperationError(node, `Erro na API ao listar itens de calendário: ${response.status} ${response.statusText}. Detalhe: ${errorDetail}`);
            }
            const data = (await response.json());
            return data;
        }
        catch (error) {
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw error;
            }
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao listar itens de calendário: ${error.message}`);
        }
    }
    static async criarItem(node, authToken, itemData) {
        try {
            const payload = {
                titulo: itemData.titulo,
                inicio: itemData.inicio,
                fim: itemData.fim,
                tipo: itemData.tipo,
                descricao: itemData.descricao,
                link_reuniao: itemData.link_reuniao,
                contato: itemData.contato,
                cor: itemData.cor,
                notificar: itemData.notificar,
                minutos_antes_notificar: itemData.minutos_antes_notificar,
            };
            const body = JSON.stringify(payload);
            const response = await fetch(CalendarioResource.BASE_URL, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: body,
            });
            if (!response.ok) {
                const errorDetail = await CalendarioResource.getApiErrorDetail(response);
                throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar item de calendário: ${response.status} ${response.statusText}. Detalhe: ${errorDetail}`);
            }
            const data = (await response.json());
            return data;
        }
        catch (error) {
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw error;
            }
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar item de calendário: ${error.message}`);
        }
    }
    static async deletarItem(node, authToken, itemId) {
        const url = `${CalendarioResource.BASE_URL}${itemId}/`;
        try {
            const response = await fetch(url, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.status === 404) {
                throw new n8n_workflow_1.NodeOperationError(node, `Falha ao deletar item: Item de calendário com ID ${itemId} não encontrado (404).`);
            }
            if (!response.ok) {
                const errorDetail = await CalendarioResource.getApiErrorDetail(response);
                throw new n8n_workflow_1.NodeOperationError(node, `Falha ao deletar item de calendário: ${response.status} ${response.statusText}. Detalhe: ${errorDetail}`);
            }
            return;
        }
        catch (error) {
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw error;
            }
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao deletar item de calendário: ${error.message}`);
        }
    }
    static async getApiErrorDetail(response) {
        try {
            const errorJson = await response.json();
            if (typeof errorJson === 'object' && errorJson !== null) {
                if ('detail' in errorJson) {
                    return errorJson.detail;
                }
                return JSON.stringify(errorJson);
            }
            return response.statusText;
        }
        catch {
            return response.statusText;
        }
    }
}
exports.CalendarioResource = CalendarioResource;
CalendarioResource.BASE_URL = 'https://backend.loomiecrm.com/calendario/';
//# sourceMappingURL=CalendarioResource.js.map