import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import fetch from 'node-fetch';

/**
 * Recurso para interagir com a API de Notas de Atendimento do LoomieCRM
 */
export class NotasResource {
	/**
	 * Cria uma nova nota de atendimento.
	 * O operador (operador) é definido pelo token de autenticação.
	 * @param conversaId Opcional: ID da Conversa à qual a nota será anexada.
	 */
	static async criarNotaAtendimento(
		node: INode,
		authToken: string,
		titulo: string,
		conteudo: string,
		tipo: string,
		conversaId?: string, // Pode ser opcional, dependendo de como a rota é chamada
	): Promise<any> {
		try {
			// A URL pode ser /notas/ (global) ou /conversas/{id}/notas/ (específica)
			const endpoint = conversaId
				? `https://backend.loomiecrm.com/conversas/${conversaId}/notas/`
				: 'https://backend.loomiecrm.com/notas/';

			// O body contém os dados que o Serializer espera
			const body: any = {
				titulo,
				conteudo,
				tipo,
				// 'privada' é um campo booleano que pode ser incluído se for necessário na criação
				// privada: false
			};

			const response = await fetch(endpoint, {
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
			throw new NodeOperationError(node, `Falha ao criar nota de atendimento: ${error.message}`);
		}
	}
}
