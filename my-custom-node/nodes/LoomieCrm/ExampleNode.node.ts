import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ContatosResource } from '../../resources/ContatosResource';
import { NegociosResource } from '../../resources/NegociosResource';
import { NotificacaoResource } from '../../resources/NotificacaoResource';
import { NotasResource } from '../../resources/NotasResource';
import { AtributosResource } from '../../resources/AtributosResource';

export class ExampleNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LoomieCRM Node',
		name: 'exampleNode',
		icon: 'file:loomiecrm.svg',
		group: ['transform'],
		version: 1,
		description: 'Node com funções da API LoomieCRM',
		defaults: { name: 'LoomieCRM Node' },
		inputs: ['main'],
		outputs: ['main'],
		// @ts-expect-error: n8n AI Tool property
		tool: {
			description:
				'Use esta ferramenta para gerenciar dados no LoomieCRM. Ela permite listar contatos; criar, obter, atualizar ou mover negócios; criar notificações; criar notas de atendimento; e criar atributos personalizados para negócios. É a ferramenta central para qualquer ação de CRM.',
		},
		properties: [
			{
				displayName: 'Recurso',
				name: 'recurso',
				type: 'options',
				options: [
					{ name: 'Contatos', value: 'contatos' },
					{ name: 'Negócios', value: 'negocios' },
					{ name: 'Notificações', value: 'notificacoes' },
					{ name: 'Notas de Atendimento', value: 'notas' },
					{ name: 'Atributos Personalizados', value: 'atributos' }, // <-- NOVO RECURSO
				],
				default: 'contatos',
				description: 'Escolha o conjunto de funções',
			},

			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [{ name: 'Listar Contato', value: 'listarContato' }],
				default: 'listarContato',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['contatos'] } },
			}, // Funções de Negócios

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
			}, // Funções de Notificações

			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [{ name: 'Criar Notificação', value: 'criarNotificacao' }],
				default: 'criarNotificacao',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['notificacoes'] } },
			},

			// Funções de Notas de Atendimento
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [{ name: 'Criar Nota', value: 'criarNota' }],
				default: 'criarNota',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['notas'] } },
			},

			// Funções de Atributos Personalizados
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [{ name: 'Criar Atributo', value: 'criarAtributo' }], // <-- NOVA FUNÇÃO
				default: 'criarAtributo',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['atributos'] } },
			}, // Parâmetros Comuns/Negócios

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
					show: {
						recurso: ['negocios'],
						funcao: ['criarNegocio', 'atualizarNegocio', 'trocarEstagio'],
					},
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
				description: 'ID do negócio para obter, atualizar ou anexar atributos.',
				displayOptions: {
					show: {
						recurso: ['negocios', 'atributos'], // <-- Adicionado 'atributos'
						funcao: ['obterNegocio', 'atualizarNegocio', 'trocarEstagio', 'criarAtributo'], // <-- Adicionado 'criarAtributo'
					},
				},
			}, // Parâmetros para Notificações

			{
				displayName: 'Tipo',
				name: 'tipo',
				type: 'options',
				options: [
					{ name: 'Boa', value: 'boa' },
					{ name: 'Alerta', value: 'alerta' },
					{ name: 'Erro', value: 'erro' },
					{ name: 'Informação', value: 'info' },
				],
				default: 'info',
				description: 'Tipo da notificação (boa, alerta, erro, info).',
				displayOptions: {
					show: { recurso: ['notificacoes'], funcao: ['criarNotificacao'] },
				},
			},
			{
				displayName: 'Texto da Notificação',
				name: 'texto',
				type: 'string',
				default: '',
				description: 'Conteúdo principal da notificação (campo "texto" no Django).',
				displayOptions: {
					show: { recurso: ['notificacoes'], funcao: ['criarNotificacao'] },
				},
			},
			{
				displayName: 'ID do Usuário',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'ID do usuário que receberá a notificação (campo "usuario" no Django).',
				displayOptions: {
					show: { recurso: ['notificacoes'], funcao: ['criarNotificacao'] },
				},
			}, // Parâmetros para Notas de Atendimento

			// Funções de Notas de Atendimento (propriedade 'funcao' já existe, apenas adicionando campos)
			{
				displayName: 'Título da Nota',
				name: 'notaTitulo',
				type: 'string',
				default: '',
				description: 'Título da nota de atendimento',
				displayOptions: {
					show: { recurso: ['notas'], funcao: ['criarNota'] },
				},
			},
			{
				displayName: 'Conteúdo da Nota',
				name: 'conteudo',
				type: 'string',
				typeOptions: {
					multiline: true,
				},
				default: '',
				description: 'Conteúdo detalhado da nota de atendimento',
				displayOptions: {
					show: { recurso: ['notas'], funcao: ['criarNota'] },
				},
			},
			{
				displayName: 'Tipo da Nota',
				name: 'notaTipo',
				type: 'options',
				options: [
					{ name: 'Informação', value: 'info' },
					{ name: 'Importante', value: 'importante' },
					{ name: 'Urgente', value: 'urgente' },
					{ name: 'Follow-up', value: 'followup' },
					{ name: 'Problema', value: 'problema' },
					{ name: 'Solução', value: 'solucao' },
				],
				default: 'info',
				description: 'Tipo da nota de atendimento.',
				displayOptions: {
					show: { recurso: ['notas'], funcao: ['criarNota'] },
				},
			},
			{
				displayName: 'ID da Conversa (Opcional)',
				name: 'conversaId',
				type: 'string',
				default: '',
				description: 'ID da conversa à qual a nota deve ser anexada (opcional).',
				displayOptions: {
					show: { recurso: ['notas'], funcao: ['criarNota'] },
				},
			},

			// <-- 2. NOVOS PARÂMETROS PARA ATRIBUTOS PERSONALIZADOS

			{
				displayName: 'Label (Rótulo)',
				name: 'label',
				type: 'string',
				default: '',
				description: 'O nome do atributo (ex: "Cor Favorita").',
				displayOptions: {
					show: { recurso: ['atributos'], funcao: ['criarAtributo'] },
				},
			},

			{
				displayName: 'Valor',
				name: 'atributoValor', // Renomeado para evitar conflito com 'valor' de Negócio
				type: 'string',
				default: '',
				description: 'O valor do atributo (ex: "Azul" ou "100"). Deve ser string.',
				displayOptions: {
					show: { recurso: ['atributos'], funcao: ['criarAtributo'] },
				},
			},

			{
				displayName: 'Tipo de Dado',
				name: 'atributoType',
				type: 'options',
				options: [
					{ name: 'Boolean', value: 'boolean' },
					{ name: 'Integer', value: 'integer' },
					{ name: 'Float', value: 'float' },
					{ name: 'String', value: 'string' },
					{ name: 'Date', value: 'date' },
					{ name: 'DateTime', value: 'datetime' },
					{ name: 'Time', value: 'time' },
					{ name: 'Text', value: 'text' },
				],
				default: 'string',
				description: 'O tipo de dado armazenado (string, integer, date, etc.).',
				displayOptions: {
					show: { recurso: ['atributos'], funcao: ['criarAtributo'] },
				},
			}, // Parâmetro Auth Token

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
					} else if (funcao === 'trocarEstagio') {
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
				} else if (recurso === 'notificacoes') {
					if (funcao === 'criarNotificacao') {
						const tipo = this.getNodeParameter('tipo', itemIndex) as string;
						const texto = this.getNodeParameter('texto', itemIndex) as string;
						const userId = this.getNodeParameter('userId', itemIndex) as string;

						resultado = await NotificacaoResource.criarNotificacao(
							this.getNode(),
							authToken,
							tipo,
							texto,
							userId,
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${funcao}" não implementada para Notificações`,
						);
					}
				} else if (recurso === 'notas') {
					if (funcao === 'criarNota') {
						const notaTitulo = this.getNodeParameter('notaTitulo', itemIndex) as string;
						const conteudo = this.getNodeParameter('conteudo', itemIndex) as string;
						const notaTipo = this.getNodeParameter('notaTipo', itemIndex) as string; // conversaId é opcional, então passamos o default
						const conversaId = this.getNodeParameter('conversaId', itemIndex, undefined) as
							| string
							| undefined;

						resultado = await NotasResource.criarNotaAtendimento(
							this.getNode(),
							authToken,
							notaTitulo,
							conteudo,
							notaTipo,
							conversaId, // Pode ser undefined
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${funcao}" não implementada para Notas de Atendimento`,
						);
					}
				} else if (recurso === 'atributos') {
					// <-- 3. NOVO BLOCO DE LÓGICA
					if (funcao === 'criarAtributo') {
						const negocioId = this.getNodeParameter('negocioId', itemIndex) as string;
						const label = this.getNodeParameter('label', itemIndex) as string;
						const atributoValor = this.getNodeParameter('atributoValor', itemIndex) as string;
						const atributoType = this.getNodeParameter('atributoType', itemIndex) as string;

						resultado = await AtributosResource.criarAtributoPersonalizavel(
							this.getNode(),
							authToken,
							negocioId,
							label,
							atributoValor,
							atributoType,
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${funcao}" não implementada para Atributos Personalizados`,
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

