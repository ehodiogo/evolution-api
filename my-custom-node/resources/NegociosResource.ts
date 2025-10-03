import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class NegociosResource {
	/**
	 * Cria um negócio na API LoomieCRM
	 * @param node - objeto INode para erros
	 * @param authToken - token Bearer
	 * @param titulo - título do negócio
	 * @param valor - valor do negócio
	 * @param estagioId - ID do estágio
	 * @param contatoId - ID do contato
	 */
	static async criarNegocio(
		node: INode,
		authToken: string,
		titulo: string,
		valor: number,
		estagioId: string,
		contatoId: string,
	): Promise<any> {
		try {
			const body = { titulo, valor, estagio_id: estagioId, contato_id: contatoId };

			const response = await fetch('https://backend.loomiecrm.com/negocios/', {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(body),
			});

			if (!response.ok) {
				throw new NodeOperationError(
					node,
					`Erro na API: ${response.status} ${response.statusText}`,
				);
			}

			const data = await response.json();
			return data;
		} catch (error: any) {
			throw new NodeOperationError(node, `Falha ao criar negócio: ${error.message}`);
		}
	}
}
