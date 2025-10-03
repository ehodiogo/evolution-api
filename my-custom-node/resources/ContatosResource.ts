import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

export class ContatosResource {
	// Passa o node como parâmetro para usar no NodeOperationError
	static async listarContatos(node: INode, authToken: string): Promise<any> {
		try {
			const response = await fetch('https://backend.loomiecrm.com/contatos/', {
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

			const data = await response.json();
			return data;
		} catch (error: any) {
			throw new NodeOperationError(node, `Falha ao listar contatos: ${error.message}`);
		}
	}
}
