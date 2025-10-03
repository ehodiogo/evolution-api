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
		defaults: {
			name: 'LoomieCRM Node',
		},
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
			// funções de Contatos
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [{ name: 'Listar Contato', value: 'listarContato' }],
				default: 'listarContato',
				description: 'Escolha a função a ser executada',
				displayOptions: {
					show: {
						recurso: ['contatos'],
					},
				},
			},
			// Funções de Negócios
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [
					{ name: 'Criar Negócio', value: 'criarNegocio', description: 'Cria um novo negócio' },
				],
				default: 'criarNegocio',
				description: 'Escolha a função a ser executada',
				displayOptions: {
					show: {
						recurso: ['negocios'],
					},
				},
			},
			// Campos específicos para criar negócio
			{
				displayName: 'Título',
				name: 'titulo',
				type: 'string',
				default: '',
				description: 'Título do negócio',
				displayOptions: {
					show: {
						recurso: ['negocios'],
						funcao: ['criarNegocio'],
					},
				},
			},
			{
				displayName: 'Valor',
				name: 'valor',
				type: 'number',
				default: 0,
				description: 'Valor do negócio',
				displayOptions: {
					show: {
						recurso: ['negocios'],
						funcao: ['criarNegocio'],
					},
				},
			},
			{
				displayName: 'ID do Estágio',
				name: 'estagioId',
				type: 'string',
				default: '',
				description: 'ID do estágio do negócio',
				displayOptions: {
					show: {
						recurso: ['negocios'],
						funcao: ['criarNegocio'],
					},
				},
			},
			{
				displayName: 'ID do Contato',
				name: 'contatoId',
				type: 'string',
				default: '',
				description: 'ID do contato relacionado ao negócio',
				displayOptions: {
					show: {
						recurso: ['negocios'],
						funcao: ['criarNegocio'],
					},
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
					if (funcao === 'criarNegocio') {
						const titulo = this.getNodeParameter('titulo', itemIndex) as string;
						const valor = this.getNodeParameter('valor', itemIndex) as number;
						const estagioId = this.getNodeParameter('estagioId', itemIndex) as string;
						const contatoId = this.getNodeParameter('contatoId', itemIndex) as string;

						resultado = await NegociosResource.criarNegocio(
							this.getNode(),
							authToken,
							titulo,
							valor,
							estagioId,
							contatoId,
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
