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

	static async criarContato(
		node: INode,
		authToken: string,
		nome: string,
		email: string,
		telefone: string,
		empresa: string, // Novo
		cargo: string, // Novo
		endereco: string, // Novo
		cidade: string, // Novo
		estado: string, // Novo
		cep: string, // Novo
		data_nascimento: string, // Novo
		observacoes: string, // Novo
	): Promise<any> {
		try {
			// Cria um objeto para o corpo da requisição
			const bodyPayload: any = {
				nome: nome,
				email: email,
				telefone: telefone,
				empresa: empresa,
				cargo: cargo,
				endereco: endereco,
				cidade: cidade,
				estado: estado,
				cep: cep,
				observacoes: observacoes,
				// Inclui data_nascimento somente se tiver valor, assumindo que pode ser opcional
			};

			if (data_nascimento) {
				bodyPayload.data_nascimento = data_nascimento;
			}

			const body = JSON.stringify(bodyPayload);

			const response = await fetch('https://backend.loomiecrm.com/contatos/', {
				method: 'POST', // Método POST para criar
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
					// Tenta extrair mensagem de erro mais detalhada, especialmente erros de validação
					if (typeof errorJson === 'object' && errorJson !== null && 'detail' in errorJson) {
						errorMessage = (errorJson as { detail?: string }).detail || JSON.stringify(errorJson);
					} else {
						errorMessage = JSON.stringify(errorJson);
					}
				} catch {}

				throw new NodeOperationError(node, `Falha ao criar contato: ${errorMessage}`);
			}

			const data = await response.json();
			return data; // Retorna o objeto do contato criado
		} catch (error: any) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(node, `Falha ao criar contato: ${error.message}`);
		}
	}

	static async buscarContatoPorTelefone(
		node: INode,
		authToken: string,
		telefone: string,
	): Promise<any> {
		// Construct the URL with the 'telefone' query parameter
		const url = `https://backend.loomiecrm.com/contato-buscar_por_telefone/?telefone=${encodeURIComponent(telefone)}`;

		try {
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					Authorization: `Bearer ${authToken}`,
					'Content-Type': 'application/json',
				},
			});

			if (!response.ok) {
				let errorMessage = `Erro na API: ${response.status} ${response.statusText}`;
				try {
					const errorJson = await response.json();
					if (errorJson && typeof errorJson === 'object' && 'error' in errorJson) {
						errorMessage = (errorJson as { error: string }).error;
					} else if (errorJson) {
						errorMessage = JSON.stringify(errorJson);
					}
				} catch {}

				// Handles 404 (Contact not found) and 400 (Missing parameter) errors from Django view
				throw new NodeOperationError(node, `Falha ao buscar contato: ${errorMessage}`);
			}

			const data = await response.json();
			return data;
		} catch (error: any) {
			if (error instanceof NodeOperationError) {
				throw error;
			}
			throw new NodeOperationError(node, `Falha ao buscar contato: ${error.message}`);
		}
	}
}
