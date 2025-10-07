import {
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
} from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';
import { ContatosResource } from '../../resources/ContatosResource';
import { NegociosResource } from '../../resources/NegociosResource';
import { NotificacaoResource } from '../../resources/NotificacaoResource';
import { NotasResource } from '../../resources/NotasResource';
import { AtributosResource } from '../../resources/AtributosResource';
import { KnowledgeResource } from '../../resources/KnowledgeResource'; // IMPORT: KnowledgeResource

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
		usableAsTool: true, // @ts-expect-error: n8n AI Tool property
		tool: {
			description:
				'Use esta ferramenta para gerenciar dados no LoomieCRM. Ela permite listar contatos; criar, obter, atualizar ou mover negócios; criar notificações; criar notas de atendimento; criar atributos personalizados; e **criar Bases de Conhecimento completas**.',
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
					{ name: 'Atributos Personalizados', value: 'atributos' },
					{ name: 'Base de Conhecimento', value: 'knowledge' }, // NOVO RECURSO
				],
				default: 'contatos',
				description: 'Escolha o conjunto de funções',
			},

			// Funções de Contatos
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [
					{ name: 'Listar Contato', value: 'listarContato' },
					{ name: 'Criar Contato', value: 'criarContato' },
					{ name: 'Buscar Contato por Telefone', value: 'buscarContatoPorTelefone' },
				],
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
					{ name: 'Listar Negócios por Estágio', value: 'listarNegociosPorEstagio' },
					{ name: 'Buscar Negócio por Telefone', value: 'buscarNegocioPorTelefone' },
				],
				default: 'criarNegocio',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['negocios'] } },
			},
			// Funções de Notificações
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
				options: [{ name: 'Criar Atributo', value: 'criarAtributo' }],
				default: 'criarAtributo',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['atributos'] } },
			},
			// Funções de Base de Conhecimento
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [
					{ name: 'Criar Base de Conhecimento Completa', value: 'criarBaseDeConhecimentoCompleta' },
				],
				default: 'criarBaseDeConhecimentoCompleta',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['knowledge'] } },
			},

			// Parâmetros do Recurso Knowledge Base (Base de Conhecimento)
			{
				displayName: 'ID do Cliente',
				name: 'clientId',
				type: 'number',
				typeOptions: {
					numberPrecision: 0,
				},
				default: 0,
				description: 'O ID numérico do cliente ao qual a base de conhecimento pertence.',
				displayOptions: {
					show: { recurso: ['knowledge'], funcao: ['criarBaseDeConhecimentoCompleta'] },
				},
			},
			{
				displayName: 'Nome da Base de Conhecimento',
				name: 'knowledgeBaseName',
				type: 'string',
				default: '',
				description: 'O nome da nova Base de Conhecimento (KnowledgeBaseSet).',
				displayOptions: {
					show: { recurso: ['knowledge'], funcao: ['criarBaseDeConhecimentoCompleta'] },
				},
			},
			{
				displayName: 'Campos (Fields) (JSON)',
				name: 'knowledgeFieldsJson',
				type: 'json',
				typeOptions: {
					multiline: true,
				},
				default: '[]',
				description:
					'Array de objetos JSON para os campos (Fields) da base. Ex: [{"name": "Cor", "field_type": "TEXT", "required": false}]',
				displayOptions: {
					show: { recurso: ['knowledge'], funcao: ['criarBaseDeConhecimentoCompleta'] },
				},
			},
			{
				displayName: 'Entradas (Entries) (JSON)',
				name: 'knowledgeEntriesJson',
				type: 'json',
				typeOptions: {
					multiline: true,
				},
				default: '[]',
				description:
					'Array de objetos JSON para as entradas (Entries/Dados). Ex: [{"values": {"Cor": "Azul", "Preço": 150000}}]',
				displayOptions: {
					show: { recurso: ['knowledge'], funcao: ['criarBaseDeConhecimentoCompleta'] },
				},
			},
			// FIM dos Parâmetros Knowledge Base

			// Parâmetros Comuns/Negócios
			{
				displayName: 'ID do Kanban',
				name: 'kanbanId',
				type: 'string',
				default: '',
				description: 'ID do Kanban',
				displayOptions: {
					show: {
						recurso: ['negocios'],
						funcao: ['listarNegociosPorEstagio', 'buscarNegocioPorTelefone'],
					},
				},
			},
			{
				displayName: 'ID do Estágio',
				name: 'estagioId',
				type: 'string',
				default: '',
				description: 'ID do estágio',
				displayOptions: {
					show: {
						recurso: ['negocios'],
						funcao: ['listarNegociosPorEstagio', 'buscarNegocioPorTelefone'],
					},
				},
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
						recurso: ['negocios', 'atributos'],
						funcao: ['obterNegocio', 'atualizarNegocio', 'trocarEstagio', 'criarAtributo'],
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
			}, // Parâmetros para Atributos Personalizados

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
				name: 'atributoValor',
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
			}, // Parâmetros para Contatos

			{
				displayName: 'Nome',
				name: 'contatoNome',
				type: 'string',
				default: '',
				description: 'Nome completo do novo contato.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Email',
				name: 'contatoEmail',
				type: 'string',
				default: '',
				description: 'Endereço de email do novo contato.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Telefone',
				name: 'contatoTelefone',
				type: 'string',
				default: '',
				description: 'Número de telefone do novo contato.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Empresa',
				name: 'contatoEmpresa',
				type: 'string',
				default: '',
				description: 'Empresa do contato.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Cargo',
				name: 'contatoCargo',
				type: 'string',
				default: '',
				description: 'Cargo do contato na empresa.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Endereço',
				name: 'contatoEndereco',
				type: 'string',
				default: '',
				description: 'Rua e número do endereço.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Cidade',
				name: 'contatoCidade',
				type: 'string',
				default: '',
				description: 'Cidade do contato.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Estado',
				name: 'contatoEstado',
				type: 'string',
				default: '',
				description: 'Estado (UF) do contato.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'CEP',
				name: 'contatoCep',
				type: 'string',
				default: '',
				description: 'CEP do contato.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Data de Nascimento',
				name: 'contatoDataNascimento',
				type: 'string',
				default: '',
				description: 'Data de nascimento (formato YYYY-MM-DD).',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Observações',
				name: 'contatoObservacoes',
				type: 'string',
				typeOptions: { multiline: true },
				default: '',
				description: 'Quaisquer observações adicionais sobre o contato.',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},

			{
				displayName: 'Telefone/WhatsApp ID',
				name: 'contatoBuscaTelefone',
				type: 'string',
				default: '',
				description: 'Telefone ou WhatsApp ID do contato para buscar.',
				displayOptions: {
					show: { recurso: ['contatos'], funcao: ['buscarContatoPorTelefone'] },
				},
			},

			{
				displayName: 'Telefone/WhatsApp ID',
				name: 'telefone',
				type: 'string',
				default: '',
				description: 'Telefone ou WhatsApp ID do contato para buscar o negócio.',
				displayOptions: {
					show: { recurso: ['negocios'], funcao: ['buscarNegocioPorTelefone'] },
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
					} else if (funcao === 'criarContato') {
						const contatoNome = this.getNodeParameter('contatoNome', itemIndex) as string;
						const contatoEmail = this.getNodeParameter('contatoEmail', itemIndex) as string;
						const contatoTelefone = this.getNodeParameter('contatoTelefone', itemIndex) as string;
						const contatoEmpresa = this.getNodeParameter('contatoEmpresa', itemIndex) as string;
						const contatoCargo = this.getNodeParameter('contatoCargo', itemIndex) as string;
						const contatoEndereco = this.getNodeParameter('contatoEndereco', itemIndex) as string;
						const contatoCidade = this.getNodeParameter('contatoCidade', itemIndex) as string;
						const contatoEstado = this.getNodeParameter('contatoEstado', itemIndex) as string;
						const contatoCep = this.getNodeParameter('contatoCep', itemIndex) as string;
						const contatoDataNascimento = this.getNodeParameter(
							'contatoDataNascimento',
							itemIndex,
						) as string;
						const contatoObservacoes = this.getNodeParameter(
							'contatoObservacoes',
							itemIndex,
						) as string;

						resultado = await ContatosResource.criarContato(
							this.getNode(),
							authToken,
							contatoNome,
							contatoEmail,
							contatoTelefone,
							contatoEmpresa,
							contatoCargo,
							contatoEndereco,
							contatoCidade,
							contatoEstado,
							contatoCep,
							contatoDataNascimento,
							contatoObservacoes,
						);
					} else if (funcao === 'buscarContatoPorTelefone') {
						const telefone = this.getNodeParameter('contatoBuscaTelefone', itemIndex) as string;

						if (!telefone) {
							throw new NodeOperationError(
								this.getNode(),
								'O Telefone/WhatsApp ID é obrigatório para esta função.',
							);
						}

						resultado = await ContatosResource.buscarContatoPorTelefone(
							this.getNode(),
							authToken,
							telefone,
						);
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
						negocioId = this.getNodeParameter('negocioId', itemIndex) as string;
						resultado = await NegociosResource.obterNegocio(this.getNode(), authToken, negocioId);
					} else if (funcao === 'atualizarNegocio') {
						negocioId = this.getNodeParameter('negocioId', itemIndex) as string;
						titulo = this.getNodeParameter('titulo', itemIndex, undefined) as string;
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
						negocioId = this.getNodeParameter('negocioId', itemIndex) as string;
						estagioId = this.getNodeParameter('estagioId', itemIndex) as string;

						resultado = await NegociosResource.trocarEstagio(
							this.getNode(),
							authToken,
							negocioId,
							estagioId,
						);
					} else if (funcao === 'listarNegociosPorEstagio') {
						const kanbanId = this.getNodeParameter('kanbanId', itemIndex) as string;
						const estagioId = this.getNodeParameter('estagioId', itemIndex) as string;

						resultado = await NegociosResource.obterNegociosPorEstagio(
							this.getNode(),
							authToken,
							kanbanId,
							estagioId,
						);
					} else if (funcao === 'buscarNegocioPorTelefone') {
						const telefone = this.getNodeParameter('telefone', itemIndex) as string;
						const kanbanId = this.getNodeParameter('kanbanId', itemIndex, undefined) as
							| string
							| undefined;
						const estagioId = this.getNodeParameter('estagioId', itemIndex, undefined) as
							| string
							| undefined;

						resultado = await NegociosResource.buscarNegocioPorTelefone(
							this.getNode(),
							authToken,
							telefone,
							kanbanId,
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
						const notaTipo = this.getNodeParameter('notaTipo', itemIndex) as string;
						const conversaId = this.getNodeParameter('conversaId', itemIndex, undefined) as
							| string
							| undefined;

						resultado = await NotasResource.criarNotaAtendimento(
							this.getNode(),
							authToken,
							notaTitulo,
							conteudo,
							notaTipo,
							conversaId,
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${funcao}" não implementada para Notas de Atendimento`,
						);
					}
				} else if (recurso === 'atributos') {
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
				} else if (recurso === 'knowledge') {
					// BLOCO DE EXECUÇÃO: Knowledge Base (ATUALIZADO)
					if (funcao === 'criarBaseDeConhecimentoCompleta') {
						const clientId = this.getNodeParameter('clientId', itemIndex) as number;
						const name = this.getNodeParameter('knowledgeBaseName', itemIndex) as string;
						const fieldsJson = this.getNodeParameter('knowledgeFieldsJson', itemIndex) as string;
						const entriesJson = this.getNodeParameter('knowledgeEntriesJson', itemIndex) as string; // NOVO
						let fields: any[] = [];
						let entries: any[] = []; // NOVO

						// Processa Fields
						if (fieldsJson && fieldsJson !== '[]') {
							try {
								fields = JSON.parse(fieldsJson);
							} catch (e) {
								throw new NodeOperationError(
									this.getNode(),
									`Erro ao analisar o JSON dos Campos (Fields): ${(e as Error).message}`,
								);
							}
						}

						// Processa Entries
						if (entriesJson && entriesJson !== '[]') {
							try {
								entries = JSON.parse(entriesJson);
							} catch (e) {
								throw new NodeOperationError(
									this.getNode(),
									`Erro ao analisar o JSON das Entradas (Entries): ${(e as Error).message}`,
								);
							}
						}

						resultado = await KnowledgeResource.criarBaseDeConhecimentoCompleta(
							this.getNode(),
							authToken,
							clientId,
							name,
							fields,
							entries, // ENVIANDO O ARRAY DE ENTRIES
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${funcao}" não implementada para Base de Conhecimento`,
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
