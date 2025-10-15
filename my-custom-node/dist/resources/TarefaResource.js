"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TarefasResource = exports.RECORRENCIA_TYPE_CHOICES = exports.TAREFA_TYPE_CHOICES = void 0;
const n8n_workflow_1 = require("n8n-workflow");
exports.TAREFA_TYPE_CHOICES = {
    WEBHOOK: 'webhook',
};
exports.RECORRENCIA_TYPE_CHOICES = {
    UNICA: 'unica',
    HORAS: 'horas',
    DIARIA: 'diaria',
    DIAS: 'dias',
};
class TarefasResource {
    static async criarTarefaAgendadaWebhook(node, authToken, destinatario, mensagem, configRecorrencia, linkWebhookN8n, precisarEnviar, codigo) {
        const TIPO_TAREFA_WEBHOOK = exports.TAREFA_TYPE_CHOICES.WEBHOOK;
        try {
            if (!destinatario || !mensagem) {
                throw new n8n_workflow_1.NodeOperationError(node, 'Destinatário e Mensagem são campos obrigatórios para a criação da tarefa.');
            }
            if (!linkWebhookN8n) {
                throw new n8n_workflow_1.NodeOperationError(node, 'O Link do Webhook N8N é obrigatório para tarefas do tipo webhook.');
            }
            if (!configRecorrencia || !configRecorrencia.tipo || !configRecorrencia.valor1) {
                throw new n8n_workflow_1.NodeOperationError(node, 'A configuração de recorrência (tipo e valor1) é obrigatória.');
            }
            const endpoint = `https://backend.loomiecrm.com/criar_tarefas/`;
            const payload = {
                tipo_tarefa: TIPO_TAREFA_WEBHOOK,
                destinatario: destinatario,
                mensagem: mensagem,
                link_webhook_n8n: linkWebhookN8n,
                assunto: undefined,
                precisar_enviar: precisarEnviar !== undefined ? precisarEnviar : undefined,
                codigo: codigo || undefined,
                config_recorrencia: {
                    tipo: configRecorrencia.tipo,
                    valor1: String(configRecorrencia.valor1),
                    ...(configRecorrencia.valor2 !== undefined && {
                        valor2: String(configRecorrencia.valor2),
                    }),
                },
            };
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${authToken}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });
            if (!response.ok) {
                const errorBody = await response.json();
                throw new n8n_workflow_1.NodeOperationError(node, `Erro na API (${response.status} ${response.statusText}): ${JSON.stringify(errorBody)}`);
            }
            return await response.json();
        }
        catch (error) {
            if (error instanceof n8n_workflow_1.NodeOperationError) {
                throw error;
            }
            throw new n8n_workflow_1.NodeOperationError(node, `Falha ao criar Tarefa Agendada Webhook: ${error.message}`);
        }
    }
}
exports.TarefasResource = TarefasResource;
//# sourceMappingURL=TarefaResource.js.map