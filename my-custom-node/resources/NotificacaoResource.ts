import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import fetch from 'node-fetch';

export class NotificacaoResource {
	/**
	 * Cria uma notificação na API LoomieCRM
	 */
	static async criarNotificacao(
		node: INode,
		authToken: string,
		tipo: string, // <-- MUDANÇA: Trocado 'titulo' por 'tipo'
		texto: string, // <-- MUDANÇA: Trocado 'mensagem' por 'texto'
		userId: string, // ID do usuário a ser notificado
	): Promise<any> {
		try {
			// Os nomes das chaves no 'body' devem corresponder ao que a API espera.
			// Assumindo que a API usa 'tipo', 'texto' e 'user_id'
			const body = { tipo, texto, usuario: userId };

			const response = await fetch('https://backend.loomiecrm.com/notificacoes/criar/', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
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
			throw new NodeOperationError(node, `Falha ao criar notificação: ${error.message}`);
		}
	}
}
