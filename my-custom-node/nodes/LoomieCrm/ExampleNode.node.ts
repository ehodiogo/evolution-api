import type {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ContatosResource } from '../../resources/ContatosResource';
import { NegociosResource } from '../../resources/NegociosResource';

export class ExampleNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LoomieCRM Node',
		name: 'exampleNode',
		group: ['transform'],
		version: 1,
		description: 'Node com funções da API LoomieCRM',
		defaults: { name: 'LoomieCRM Node' },
		inputs: ['main'],
		outputs: ['main'],
		properties: [
			{
				displayName: 'Recurso',
				name: 'recurso',
				type: 'options',
				options: [
					{ name: 'Contatos', value: 'contatos' },
					{ name: 'Negócios', value: 'negocios' },
				],
				default: 'contatos',
				description: 'Escolha o conjunto de funções',
			},

			// Funções de Contatos
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [{ name: 'Listar Contato', value: 'listarContato' }],
				default: 'listarContato',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['contatos'] } },
			},

			// Funções de Negócios
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [
					{ name: 'Criar Negócio', value: 'criarNegocio' },
					{ name: 'Obter Negócio', value: 'obterNegocio' },
					{ name: 'Atualizar Negócio', value: 'atualizarNegocio' },
					{ name: 'Trocar Estágio', value: 'trocarEstagio' },
				],
				default: 'criarNegocio',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['negocios'] } },
			},

			{
				displayName: 'Título',
				name: 'titulo',
				type: 'string',
				default: '',
				displayOptions: {
					show: { recurso: ['negocios'], funcao: ['criarNegocio', 'atualizarNegocio'] },
				},
			},
			{
				displayName: 'Valor',
				name: 'valor',
				type: 'number',
				default: 0,
				displayOptions: {
					show: { recurso: ['negocios'], funcao: ['criarNegocio', 'atualizarNegocio'] },
				},
			},
			{
				displayName: 'ID do Estágio',
				name: 'estagioId',
				type: 'string',
				default: '',
				displayOptions: {
					show: { recurso: ['negocios'], funcao: ['criarNegocio', 'atualizarNegocio', 'trocarEstagio'] },
				},
			},
			{
				displayName: 'ID do Contato',
				name: 'contatoId',
				type: 'string',
				default: '',
				displayOptions: {
					show: { recurso: ['negocios'], funcao: ['criarNegocio', 'atualizarNegocio'] },
				},
			},
			{
				displayName: 'ID do Negócio',
				name: 'negocioId',
				type: 'string',
				default: '',
				description: 'ID do negócio para obter ou atualizar',
				displayOptions: {
					show: { recurso: ['negocios'], funcao: ['obterNegocio', 'atualizarNegocio', 'trocarEstagio'] },
				},
			},
			{
				displayName: 'Auth Token',
				name: 'authToken',
				type: 'string',
				default: '',
				description: 'Token de autenticação Bearer para acessar a API',
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const recurso = this.getNodeParameter('recurso', itemIndex) as string;
				const funcao = this.getNodeParameter('funcao', itemIndex) as string;
				const authToken = this.getNodeParameter('authToken', itemIndex) as string;

				let resultado: any;

				if (recurso === 'contatos') {
					if (funcao === 'listarContato') {
						resultado = await ContatosResource.listarContatos(this.getNode(), authToken);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${funcao}" não implementada para Contatos`,
						);
					}
				} else if (recurso === 'negocios') {
						let negocioId: string;
						let titulo: string;
						let valor: number;
						let estagioId: string;
						let contatoId: string;

						if (funcao === 'criarNegocio') {
								titulo = this.getNodeParameter('titulo', itemIndex) as string;
								valor = this.getNodeParameter('valor', itemIndex) as number;
								estagioId = this.getNodeParameter('estagioId', itemIndex) as string;
								contatoId = this.getNodeParameter('contatoId', itemIndex) as string;

								resultado = await NegociosResource.criarNegocio(
										this.getNode(),
										authToken,
										titulo,
										valor,
										estagioId,
										contatoId,
								);
						} else if (funcao === 'obterNegocio') {
								// Only retrieve 'negocioId' for this function
								negocioId = this.getNodeParameter('negocioId', itemIndex) as string;
								resultado = await NegociosResource.obterNegocio(this.getNode(), authToken, negocioId);

						} else if (funcao === 'atualizarNegocio') {
								// Retrieve only the parameters displayed for this function
								negocioId = this.getNodeParameter('negocioId', itemIndex) as string;
								titulo = this.getNodeParameter('titulo', itemIndex, undefined) as string; // Use default value (undefined) for optional parameters
								valor = this.getNodeParameter('valor', itemIndex, undefined) as number;
								estagioId = this.getNodeParameter('estagioId', itemIndex, undefined) as string;
								contatoId = this.getNodeParameter('contatoId', itemIndex, undefined) as string;

								resultado = await NegociosResource.editarNegocio(
										this.getNode(),
										authToken,
										negocioId,
										titulo,
										valor,
										estagioId,
										contatoId,
								);
						}
						else if (funcao === 'trocarEstagio') {
								// Only retrieve 'negocioId' and 'estagioId' for this function
								negocioId = this.getNodeParameter('negocioId', itemIndex) as string;
								estagioId = this.getNodeParameter('estagioId', itemIndex) as string;

								resultado = await NegociosResource.trocarEstagio(
										this.getNode(),
										authToken,
										negocioId,
										estagioId,
								);
						} else {
								throw new NodeOperationError(
										this.getNode(),
										`Função "${funcao}" não implementada para Negócios`,
								);
						}
				} else {
					throw new NodeOperationError(this.getNode(), `Recurso "${recurso}" não implementado`);
				}

				returnData.push({ json: resultado });
			} catch (error: any) {
				if (this.continueOnFail()) {
					returnData.push({ json: { error: error.message } });
				} else {
					throw new NodeOperationError(this.getNode(), error);
				}
			}
		}

		return [returnData];
	}
}
