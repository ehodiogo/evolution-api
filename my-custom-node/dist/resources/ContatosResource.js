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
    static async criarContato(node, authToken, nome, email, telefone, empresa, cargo, endereco, cidade, estado, cep, data_nascimento, observacoes) {
        try {
            const bodyPayload = {
                nome: nome,
                email: email,
                telefone: telefone,
                empresa: empresa,
                cargo: cargo,
                endereco: endereco,
                cidade: cidade,
                estado: estado,
                cep: cep,
                observacoes: observacoes,
            };
            if (data_nascimento) {
                bodyPayload.data_nascimento = data_nascimento;
            }
            const body = JSON.stringify(bodyPayload);
            const response = await fetch('https://backend.loomiecrm.com/contatos/', {
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
                    if (typeof errorJson === 'object' && errorJson !== null && 'detail' in errorJson) {
                        errorMessage = errorJson.detail || JSON.stringify(errorJson);
                    }
                    else {
                        errorMessage = JSON.stringify(errorJson);
                    }
                }
                catch { }
                throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar contato: ${errorMessage}`);
            }
            const data = await response.json();
            return data;
        }
        catch (error) {
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw error;
            }
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar contato: ${error.message}`);
        }
    }
}
exports.ContatosResource = ContatosResource;
//# sourceMappingURL=ContatosResource.js.map