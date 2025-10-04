import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import fetch from 'node-fetch';

/**
 * Define os tipos válidos para o campo 'type' do AtributoPersonalizavel,
 * conforme o modelo Django TypeChoices.
 */
export const ATRIBUTO_TYPE_CHOICES = {
	BOOLEAN: 'boolean',
	INTEGER: 'integer',
	FLOAT: 'float',
	STRING: 'string',
	DATE: 'date',
	DATETIME: 'datetime',
	TIME: 'time',
	TEXT: 'text',
};

/**
 * Recurso para interagir com a API de Atributos Personalizáveis do LoomieCRM
 */
export class AtributosResource {
	/**
	 * Cria um novo Atributo Personalizável e o anexa a um Negócio específico.
	 * O endpoint requer o ID do Negócio na URL.
	 */
	static async criarAtributoPersonalizavel(
		node: INode,
		authToken: string,
		negocioId: string,
		label: string,
		valor: string,
		type: string,
	): Promise<any> {
		try {
			if (!negocioId) {
				throw new NodeOperationError(
					node,
					'O ID do Negócio deve ser fornecido para criar o atributo personalizado.',
				);
			}

			// A URL base é construída com o ID do negócio (negocio_id)
			const endpoint = `https://backend.loomiecrm.com/atributos-personalizaveis/${negocioId}/`;

			// O body contém os dados que o Serializer espera
			const body = {
				label,
				valor,
				type,
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
			throw new NodeOperationError(
				node,
				`Falha ao criar Atributo Personalizável: ${error.message}`,
			);
		}
	}
}
