import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import fetch from 'node-fetch';

/**
 * Classe de Resource para gerenciar o Atendimento Humano de uma Conversa.
 */
export class AtendimentoResource {
	/**
	 * Ativa ou Desativa o atendimento humano para uma conversa.
	 *
	 * @param node O nó do n8n (para gerenciamento de erros).
	 * @param authToken O token de autenticação Bearer.
	 * @param conversaId O ID da conversa a ser alterada.
	 * @param ativar Define se é para ativar (true) ou desativar (false) o atendimento.
	 * @returns A resposta da API.
	 */
	static async toggleAtendimentoHumano(
		node: INode,
		authToken: string,
		conversaId: string,
		ativar: boolean,
	): Promise<any> {
		try {
			const body: any = { ativar: ativar }; // Assumindo que a URL base é 'https://backend.seudominio.com/' ou similar,
			// e o endpoint é '/conversas/<id>/atendimento-humano/'
			const url = `https://backend.loomiecrm.com/conversas/${conversaId}/atendimento-humano/`;
			// OBS: Substitua 'https://backend.seudominio.com' pela URL base real da sua API.

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				// Tenta ler a mensagem de erro do corpo da resposta
				let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;
				try {
					const errorData = (await response.json()) as any;
					if (errorData.error) {
						errorMessage = errorData.error;
					}
				} catch (e) {
					// Ignora se não conseguir ler o JSON de erro
				}

				throw new NodeOperationError(node, errorMessage);
			}

			return await response.json();
		} catch (error: any) {
			throw new NodeOperationError(
				node,
				`Falha ao ${ativar ? 'ativar' : 'desativar'} atendimento humano: ${error.message}`,
			);
		}
	}
}
