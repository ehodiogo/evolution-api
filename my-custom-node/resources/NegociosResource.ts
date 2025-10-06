import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import fetch from 'node-fetch';

export class NegociosResource {
	/**
	 * Cria um negócio na API LoomieCRM
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

			return await response.json();
		} catch (error: any) {
			throw new NodeOperationError(node, `Falha ao criar negócio: ${error.message}`);
		}
	}

	/**
	 * Obtém um negócio pelo ID
	 */
	static async obterNegocio(node: INode, authToken: string, negocioId: string): Promise<any> {
		try {
			const response = await fetch(`https://backend.loomiecrm.com/negocios/${negocioId}/`, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				throw new NodeOperationError(
					node,
					`Erro na API: ${response.status} ${response.statusText}`,
				);
			}

			return await response.json();
		} catch (error: any) {
			throw new NodeOperationError(node, `Falha ao obter negócio: ${error.message}`);
		}
	}

	/**
	 * Edita um negócio pelo ID
	 */
	static async editarNegocio(
		node: INode,
		authToken: string,
		negocioId: string,
		titulo?: string,
		valor?: number,
		estagioId?: string,
		contatoId?: string,
	): Promise<any> {
		try {
			const body: any = {};
			if (titulo !== undefined) body.titulo = titulo;
			if (valor !== undefined) body.valor = valor;
			if (estagioId !== undefined) body.estagio_id = estagioId;
			if (contatoId !== undefined) body.contato_id = contatoId;

			const response = await fetch(`https://backend.loomiecrm.com/negocios/${negocioId}/`, {
				method: 'PATCH',
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

			return await response.json();
		} catch (error: any) {
			throw new NodeOperationError(node, `Falha ao editar negócio: ${error.message}`);
		}
	}

	/**
	 * Troca o estágio de um negócio, utilizando apenas o ID do negócio e o ID do novo estágio.
	 */
	static async trocarEstagio(
		node: INode,
		authToken: string,
		negocioId: string,
		novoEstagioId: string,
	): Promise<any> {
		// Reutiliza a função , passando apenas o estagioId e mantendo os outros campos como undefined
		return this.editarNegocio(
			node,
			authToken,
			negocioId,
			undefined,
			undefined,
			novoEstagioId,
			undefined,
		);
	}

	static async obterNegociosPorEstagio(
		node: INode,
		authToken: string,
		kanbanId: string,
		estagioId: string,
	): Promise<any> {
		try {
			const response = await fetch(
				`https://backend.loomiecrm.com/kanban/${kanbanId}/estagio/${estagioId}/negocios/`,
				{
					method: 'GET',
					headers: {
						Authorization: `Bearer ${authToken}`,
						'Content-Type': 'application/json',
					},
				},
			);

			if (!response.ok) {
				throw new NodeOperationError(
					node,
					`Erro na API: ${response.status} ${response.statusText}`,
				);
			}

			return await response.json();
		} catch (error: any) {
			throw new NodeOperationError(node, `Falha ao obter negócios por estágio: ${error.message}`);
		}
	}
}
