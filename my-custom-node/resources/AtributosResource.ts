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

	/**
	 * Edita um Atributo Personalizável existente usando o método PATCH.
	 * O endpoint requer o ID (pk) do Atributo Personalizável na URL.
	 */
	static async editarAtributoPersonalizavel(
		node: INode,
		authToken: string,
		atributoId: string, // pk do atributo a ser editado
		label?: string,
		valor?: string,
		type?: string,
	): Promise<any> {
		try {
			if (!atributoId) {
				throw new NodeOperationError(
					node,
					'O ID do Atributo Personalizável (`atributoId`) deve ser fornecido para a edição.',
				);
			}

			// O endpoint usa o ID (pk) do atributo para a atualização.
			// Assumindo a URL base como 'https://backend.loomiecrm.com'
			const endpoint = `https://backend.loomiecrm.com/atributos-personalizaveis/${atributoId}/update/`;

			// Cria o corpo da requisição apenas com os campos que possuem valor (opcionalmente)
			const body: { [key: string]: string } = {};
			if (label !== undefined) body.label = label;
			if (valor !== undefined) body.valor = valor;
			if (type !== undefined) body.type = type;

			if (Object.keys(body).length === 0) {
				throw new NodeOperationError(
					node,
					'Nenhum dado de atualização (label, valor, ou type) foi fornecido.',
				);
			}

			const response = await fetch(endpoint, {
				method: 'PATCH', // Método PATCH para atualização parcial
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

			// Retorna os dados atualizados do atributo
			return await response.json();
		} catch (error: any) {
			throw new NodeOperationError(
				node,
				`Falha ao editar Atributo Personalizável (ID: ${atributoId}): ${error.message}`,
			);
		}
	}
}
