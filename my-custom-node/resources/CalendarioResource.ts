import { INode } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

/**
 * Interface para a estrutura de dados de um Item de Calendário
 * Define os campos que podem ser enviados na criação ou recebidos na listagem.
 */
interface IItemCalendario {
	titulo: string;
	inicio: string; // Espera-se um formato ISO 8601 (ex: "YYYY-MM-DDTHH:mm:ssZ")
	fim: string; // Espera-se um formato ISO 8601
	tipo?: 'evento' | 'tarefa' | 'ausente';
	descricao?: string;
	link_reuniao?: string;

	// Parâmetros de criação (o serializer espera 'contato' como o ID)
	contato?: number | null;
	cor?: string;
	notificar?: boolean;
	minutos_antes_notificar?: number;

	// Campos de retorno (read_only no serializer)
	id?: number;
	contato_nome?: string;
	cor_default?: string;
	// Outros campos de retorno como 'criado_em', 'atualizado_em'
}

export class CalendarioResource {
	private static readonly BASE_URL = 'https://backend.loomiecrm.com/calendario/';

	// ... (Método getApiErrorDetail permanece o mesmo) ...

	/**
	 * 📅 Lista todos os itens de calendário visíveis para o usuário, com filtros.
	 * @param node O nó n8n para tratamento de erro.
	 * @param authToken Token de autenticação Bearer.
	 * @param dataInicio Data e hora mínima (ISO 8601).
	 * @param dataFim Data e hora máxima (ISO 8601).
	 * @param limite O número máximo de resultados.
	 * @returns Uma promessa que resolve para os dados listados.
	 */
	static async listarItens(
		node: INode,
		authToken: string,
		// CORREÇÃO: Adicionar os parâmetros de filtro
		dataInicio?: string,
		dataFim?: string,
		limite?: number,
	): Promise<IItemCalendario[]> {
		try {
			// CORREÇÃO: Construir a query string com os filtros
			const queryParams = new URLSearchParams();
			if (dataInicio) queryParams.append('inicio__gte', dataInicio);
			if (dataFim) queryParams.append('fim__lte', dataFim);
			if (limite) queryParams.append('limit', String(limite));

			const url = `${CalendarioResource.BASE_URL}?${queryParams.toString()}`;

			const response = await fetch(url, {
				// Usar a URL com query params
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				const errorDetail = await CalendarioResource.getApiErrorDetail(response);
				throw new NodeOperationError(
					node,
					`Erro na API ao listar itens de calendário: ${response.status} ${response.statusText}. Detalhe: ${errorDetail}`,
				);
			}

			const data = (await response.json()) as IItemCalendario[];
			return data;
		} catch (error: any) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(node, `Falha ao listar itens de calendário: ${error.message}`);
		}
	}

	/**
	 * ➕ Cria um novo item de calendário.
	 * @param node O nó n8n para tratamento de erro.
	 * @param authToken Token de autenticação Bearer.
	 * @param itemData Dados do item de calendário a ser criado.
	 * @returns Uma promessa que resolve para o objeto do item criado.
	 */
	static async criarItem(
		node: INode,
		authToken: string,
		itemData: IItemCalendario,
	): Promise<IItemCalendario> {
		// ... (o corpo da função criarItem está correto, desde que itemData seja IItemCalendario)
		try {
			// Garante que só os campos relevantes para a criação sejam enviados, se for o caso
			const payload: Partial<IItemCalendario> = {
				titulo: itemData.titulo,
				inicio: itemData.inicio,
				fim: itemData.fim,
				tipo: itemData.tipo,
				descricao: itemData.descricao,
				link_reuniao: itemData.link_reuniao,
				// O serializer espera 'contato' como ID
				contato: itemData.contato,
				cor: itemData.cor,
				notificar: itemData.notificar,
				minutos_antes_notificar: itemData.minutos_antes_notificar,
			};

			const body = JSON.stringify(payload);
			// ... (restante do código de POST está OK)

			const response = await fetch(CalendarioResource.BASE_URL, {
				method: 'POST',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
				body: body,
			});

			if (!response.ok) {
				const errorDetail = await CalendarioResource.getApiErrorDetail(response);
				throw new NodeOperationError(
					node,
					`Falha ao criar item de calendário: ${response.status} ${response.statusText}. Detalhe: ${errorDetail}`,
				);
			}

			const data = (await response.json()) as IItemCalendario;
			return data; // Retorna o objeto do item criado
		} catch (error: any) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(node, `Falha ao criar item de calendário: ${error.message}`);
		}
	}

	/**
	 * 🗑️ Deleta um item de calendário pelo seu ID.
	 * @param node O nó n8n para tratamento de erro.
	 * @param authToken Token de autenticação Bearer.
	 * @param itemId ID do item de calendário a ser deletado. (CORREÇÃO: Espera-se que seja number se a URL for itemId/)
	 * @returns Uma promessa que resolve quando a exclusão for bem-sucedida (status 204 No Content).
	 */
	static async deletarItem(node: INode, authToken: string, itemId: number): Promise<void> {
		// ... (O corpo da função deletarItem está correto) ...
		const url = `${CalendarioResource.BASE_URL}${itemId}/`;
		try {
			const response = await fetch(url, {
				method: 'DELETE', // Método DELETE para exclusão
				// ... (headers)
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (response.status === 404) {
				throw new NodeOperationError(
					node,
					`Falha ao deletar item: Item de calendário com ID ${itemId} não encontrado (404).`,
				);
			}

			if (!response.ok) {
				const errorDetail = await CalendarioResource.getApiErrorDetail(response);
				throw new NodeOperationError(
					node,
					`Falha ao deletar item de calendário: ${response.status} ${response.statusText}. Detalhe: ${errorDetail}`,
				);
			}

			return;
		} catch (error: any) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(node, `Falha ao deletar item de calendário: ${error.message}`);
		}
	}

	// ... (Método getApiErrorDetail permanece o mesmo) ...
	private static async getApiErrorDetail(response: Response): Promise<string> {
		// Implementação do getApiErrorDetail...
		try {
			const errorJson = await response.json();
			if (typeof errorJson === 'object' && errorJson !== null) {
				// Trata erros de validação do DRF (que podem ser objetos aninhados)
				if ('detail' in errorJson) {
					return (errorJson as { detail: string }).detail;
				}
				return JSON.stringify(errorJson);
			}
			return response.statusText; // Retorna o texto de status se o corpo não for JSON
		} catch {
			return response.statusText; // Retorna o texto de status se a leitura do JSON falhar
		}
	}
}
