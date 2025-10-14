import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import fetch from 'node-fetch';

/**
 * Define as escolhas de tipo para a tarefa (AGORA FIXO EM WEBHOOK).
 */
export const TAREFA_TYPE_CHOICES = {
  WEBHOOK: 'webhook', // Mantido para referência, mas a função usará apenas este
};

/**
 * Define as escolhas de recorrência (unica, horas, diaria, dias).
 */
export const RECORRENCIA_TYPE_CHOICES = {
  UNICA: 'unica',
  HORAS: 'horas',
  DIARIA: 'diaria',
  DIAS: 'dias',
};

/**
 * Recurso para interagir com a API de Criação de Tarefas Agendadas (backend_url/criar_tarefas/)
 */
export class TarefasResource {
  /**
   * Cria uma nova Tarefa Agendada do tipo WEBHOOK com configuração de recorrência.
   * O endpoint de exemplo é: POST /criar_tarefas/
   */
  static async criarTarefaAgendadaWebhook(
    node: INode,
    authToken: string,
    // O tipo da tarefa agora está fixo como 'webhook' e não é mais um argumento
    destinatario: string,
    mensagem: string,
    configRecorrencia: { tipo: string; valor1: string; valor2?: string },
    linkWebhookN8n: string, // AGORA OBRIGATÓRIO
    // assunto: string, // Removido, não é usado para webhook
    precisarEnviar?: boolean, // Opcional (mantido por compatibilidade com a API)
    codigo?: string, // Opcional (mantido por compatibilidade com a API)
  ): Promise<any> {

    const TIPO_TAREFA_WEBHOOK = TAREFA_TYPE_CHOICES.WEBHOOK; // Tipo fixo

    try {
      if (!destinatario || !mensagem) {
        throw new NodeOperationError(
          node,
          'Destinatário e Mensagem são campos obrigatórios para a criação da tarefa.',
        );
      }

      // O link do webhook AGORA é obrigatório para o tipo 'webhook'
      if (!linkWebhookN8n) {
        throw new NodeOperationError(
          node,
          'O Link do Webhook N8N é obrigatório para tarefas do tipo webhook.',
        );
      }

      if (!configRecorrencia || !configRecorrencia.tipo || !configRecorrencia.valor1) {
        throw new NodeOperationError(
          node,
          'A configuração de recorrência (tipo e valor1) é obrigatória.',
        );
      }

      const endpoint = `https://backend.loomiecrm.com/criar_tarefas/`; // Ajuste a URL base conforme sua infra

      // --- Montagem do Payload de Envio (JSON) ---
      const payload = {
        // Tipo de tarefa fixo em 'webhook'
        tipo_tarefa: TIPO_TAREFA_WEBHOOK,
        destinatario: destinatario,
        mensagem: mensagem,
        // linkWebhookN8n é obrigatório e enviado
        link_webhook_n8n: linkWebhookN8n,
        assunto: undefined, // Removido
        // Inclui precisar_enviar apenas se for definido
        precisar_enviar: precisarEnviar !== undefined ? precisarEnviar : undefined,
        // Inclui codigo apenas se for definido
        codigo: codigo || undefined,
        // Formato exato que o Serializer espera
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
        throw new NodeOperationError(
          node,
          `Erro na API (${response.status} ${response.statusText}): ${JSON.stringify(errorBody)}`,
        );
      }

      return await response.json();
    } catch (error: any) {
      // Re-lança como NodeOperationError para ser capturado pelo n8n
      if (error instanceof NodeOperationError) {
        throw error;
      }
      throw new NodeOperationError(node, `Falha ao criar Tarefa Agendada Webhook: ${error.message}`);
    }
  }
}
