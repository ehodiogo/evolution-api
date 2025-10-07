import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

// Define a estrutura para os objetos de campo esperados pela API
interface KnowledgeBaseField {
	name: string;
	field_type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'URL' | 'JSON' | string; // Tipos ajustados
	required?: boolean;
}

// Define a estrutura para as entradas (entries) esperadas pela API
interface KnowledgeBaseEntryData {
	values: {
		[fieldName: string]: any; // O valor pode ser string, number, boolean, etc.
	};
}

export class KnowledgeResource {
	/**
	 * Cria ou atualiza uma base de conhecimento completa (KnowledgeBaseSet, Fields e Entries)
	 * fazendo uma requisição POST para o endpoint 'create_full' do backend.
	 *
	 * @param node O nó n8n atual para o NodeOperationError.
	 * @param authToken O token de autenticação Bearer.
	 * @param client_id O ID do cliente (obrigatório).
	 * @param name O nome da base de conhecimento (obrigatório).
	 * @param fields Um array de objetos de campo (opcional, default é array vazio).
	 * @param entries Um array de objetos de entradas com seus valores (opcional, default é array vazio).
	 */
	static async criarBaseDeConhecimentoCompleta(
		node: INode,
		authToken: string,
		client_id: number,
		name: string,
		fields: KnowledgeBaseField[] = [],
		entries: KnowledgeBaseEntryData[] = [], // NOVO PARÂMETRO
	): Promise<any> {
		// URL assumida para o endpoint 'create_full' da KnowledgeBaseSetViewSet
		const url = 'https://backend.loomiecrm.com/sets/create_full/';

		try {
			// Validação básica
			if (!client_id || !name) {
				throw new NodeOperationError(
					node,
					"O 'client_id' e o 'name' da Knowledge Base são obrigatórios.",
				);
			}

			// O payload agora inclui 'entries'
			const bodyPayload = {
				client: client_id,
				name: name,
				fields: fields,
				entries: entries, // INCLUSÃO DE ENTRIES
			};

			const body = JSON.stringify(bodyPayload);

			const response = await fetch(url, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
				body: body,
			});

			if (!response.ok) {
				let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;
				try {
					const errorJson = await response.json();
					if (typeof errorJson === 'object' && errorJson !== null) {
						// Tenta extrair a mensagem de erro detalhada da API (incluindo validação do Django)
						errorMessage = (errorJson as { error?: string }).error || JSON.stringify(errorJson);
					}
				} catch (e) {
					/* Ignora se a resposta não for JSON */
				}

				throw new NodeOperationError(
					node,
					`Falha ao criar Base de Conhecimento Completa: ${errorMessage}`,
				);
			}

			const data = await response.json();
			return data; // Retorna o objeto KnowledgeBaseSet criado
		} catch (error: any) {
			if (error instanceof NodeOperationError) {
				throw error; // Re-lança erros n8n já criados
			}
			throw new NodeOperationError(node, `Falha de conexão ou processamento: ${error.message}`);
		}
	}
}
