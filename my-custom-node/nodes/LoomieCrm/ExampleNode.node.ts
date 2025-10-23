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
import { KnowledgeResource } from '../../resources/KnowledgeResource';
import { TarefasResource, RECORRENCIA_TYPE_CHOICES } from '../../resources/TarefaResource';

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
		usableAsTool: true,
		// @ts-expect-error: n8n AI Tool property
		tool: {
			description:
				'Use esta ferramenta para gerenciar dados no LoomieCRM. Ela permite listar contatos; criar, obter, atualizar ou mover negócios; criar notificações; criar notas de atendimento; criar atributos personalizados; criar Bases de Conhecimento completas; e **criar tarefas agendadas (webhooks)**.',
		},
		credentials: [
			{
				name: 'loomieCRMApi',
				required: true,
			},
		],
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
					{ name: 'Base de Conhecimento', value: 'knowledge' },
					{ name: 'Tarefas Agendadas', value: 'tarefas' }, // NOVO RECURSO
				],
				default: 'contatos',
				description: 'Escolha o conjunto de funções',
			},

			// Funções de Contatos (existente)
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
			// Funções de Negócios (existente)
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
			// Funções de Notificações (existente)
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [{ name: 'Criar Notificação', value: 'criarNotificacao' }],
				default: 'criarNotificacao',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['notificacoes'] } },
			},
			// Funções de Notas de Atendimento (existente)
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [{ name: 'Criar Nota', value: 'criarNota' }],
				default: 'criarNota',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['notas'] } },
			},
			// Funções de Atributos Personalizados (existente)
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [
					{ name: 'Criar Atributo', value: 'criarAtributo' },
					{ name: 'Editar Atributo', value: 'editarAtributo' },
				],
				default: 'criarAtributo',
				description: 'Escolha a função a ser executada',
				displayOptions: { show: { recurso: ['atributos'] } },
			},
			// Funções de Base de Conhecimento (existente)
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
			// Funções de Tarefas Agendadas (NOVO)
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [{ name: 'Criar Tarefa Agendada (Webhook)', value: 'criarTarefaAgendadaWebhook' }],
				default: 'criarTarefaAgendadaWebhook',
				description: 'Escolha a função a ser executada para agendamento.',
				displayOptions: { show: { recurso: ['tarefas'] } },
			},

			// Parâmetros de Tarefas Agendadas (NOVO)
			{
				displayName: 'Link Webhook N8N',
				name: 'linkWebhookN8n',
				type: 'string',
				default: '',
				description: 'A URL completa do Webhook do n8n que será chamado no agendamento.',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Destinatário (ID Contato/ID Negócio/Número do WhatsApp)',
				name: 'destinatario',
				type: 'string',
				default: '',
				description: 'ID do Contato ou Negócio (obrigatório).',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Mensagem/Assunto',
				name: 'mensagem',
				type: 'string',
				typeOptions: {
					multiline: true,
				},
				default: 'Mudou de estágio!',
				description:
					'A nota ou mensagem que será enviada quando a tarefa for executada (obrigatório).',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Recorrência - Tipo',
				name: 'recorrenciaTipo',
				type: 'options',
				options: [
					{ name: 'Única (Data/Hora)', value: RECORRENCIA_TYPE_CHOICES.UNICA },
					{ name: 'A Cada X Horas', value: RECORRENCIA_TYPE_CHOICES.HORAS },
					{ name: 'Diária (Hora)', value: RECORRENCIA_TYPE_CHOICES.DIARIA },
					{ name: 'Semanal (Dia e Hora)', value: RECORRENCIA_TYPE_CHOICES.DIAS },
				],
				default: RECORRENCIA_TYPE_CHOICES.UNICA,
				description: 'Define como a tarefa será repetida.',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Recorrência - Valor 1',
				name: 'recorrenciaValor1',
				type: 'string',
				default: '',
				description:
					'Data/Hora (unica: YYYY-MM-DD HH:MM), Horas (horas: 1, 2, 3...), Hora do Dia (diaria: HH:MM), Dia da Semana (dias: 0-6).',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Recorrência - Valor 2 (Opcional)',
				name: 'recorrenciaValor2',
				type: 'string',
				default: '',
				description:
					'Usado apenas para Recorrência "Diária" (HH:MM de início/fim) ou "Semanal" (Hora do Dia).',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Precisa Enviar (Opcional)',
				name: 'precisarEnviar',
				type: 'boolean',
				default: false,
				description: 'Se verdadeiro, o destinatário receberá uma mensagem de envio (opcional).',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Código (Opcional)',
				name: 'codigo',
				type: 'string',
				default: '',
				description: 'Um código de referência para a tarefa (opcional).',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			// FIM dos Parâmetros Tarefas Agendadas

			// ... (Restante dos parâmetros existentes) ...
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
				displayName: 'ID do Preset (Opcional)',
				name: 'presetId',
				type: 'string',
				default: '',
				description: 'O ID do Preset a ser usado para preencher o novo negócio (opcional).',
				displayOptions: { show: { recurso: ['negocios'], funcao: ['criarNegocio'] } },
			},
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
				displayName: 'ID do Atributo',
				name: 'atributoId',
				type: 'string',
				default: '',
				description:
					'O ID numérico do Atributo Personalizado a ser editado (obrigatório para Edição).',
				displayOptions: {
					show: { recurso: ['atributos'], funcao: ['editarAtributo'] },
				},
			},
			{
				displayName: 'Label (Rótulo)',
				name: 'label',
				type: 'string',
				default: '',
				description: 'O nome do atributo (ex: "Cor Favorita").',
				displayOptions: {
					show: { recurso: ['atributos'], funcao: ['criarAtributo', 'editarAtributo'] },
				},
			},

			{
				displayName: 'Valor',
				name: 'atributoValor',
				type: 'string',
				default: '',
				description: 'O valor do atributo (ex: "Azul" ou "100"). Deve ser string.',
				displayOptions: {
					show: { recurso: ['atributos'], funcao: ['criarAtributo', 'editarAtributo'] },
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
					show: { recurso: ['atributos'], funcao: ['criarAtributo', 'editarAtributo'] },
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
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const credentials = (await this.getCredentials('loomieCRMApi')) as {
			accessToken: string;
		};
		const authToken = credentials.accessToken;

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const recurso = this.getNodeParameter('recurso', itemIndex) as string;
				const funcao = this.getNodeParameter('funcao', itemIndex) as string;

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
						const presetId = this.getNodeParameter('presetId', itemIndex, undefined) as
							| string
							| undefined;

						resultado = await NegociosResource.criarNegocio(
							this.getNode(),
							authToken,
							titulo,
							valor,
							estagioId,
							contatoId,
							presetId,
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
					} else if (funcao === 'editarAtributo') {
						// <-- NOVO BLOCO
						const atributoId = this.getNodeParameter('atributoId', itemIndex) as string;
						// Usamos 'undefined' como valor padrão para não enviar o campo se não for alterado
						const label = this.getNodeParameter('label', itemIndex, undefined) as
							| string
							| undefined;
						const atributoValor = this.getNodeParameter('atributoValor', itemIndex, undefined) as
							| string
							| undefined;
						const atributoType = this.getNodeParameter('atributoType', itemIndex, undefined) as
							| string
							| undefined;

						resultado = await AtributosResource.editarAtributoPersonalizavel(
							this.getNode(),
							authToken,
							atributoId,
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
					// BLOCO DE EXECUÇÃO: Knowledge Base
					if (funcao === 'criarBaseDeConhecimentoCompleta') {
						const clientId = this.getNodeParameter('clientId', itemIndex) as number;
						const name = this.getNodeParameter('knowledgeBaseName', itemIndex) as string;
						const fieldsJson = this.getNodeParameter('knowledgeFieldsJson', itemIndex) as string;
						const entriesJson = this.getNodeParameter('knowledgeEntriesJson', itemIndex) as string;
						let fields: any[] = [];
						let entries: any[] = [];

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
							entries,
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${funcao}" não implementada para Base de Conhecimento`,
						);
					}
				} else if (recurso === 'tarefas') {
					// BLOCO DE EXECUÇÃO: Tarefas Agendadas (NOVO)
					if (funcao === 'criarTarefaAgendadaWebhook') {
						const linkWebhookN8n = this.getNodeParameter('linkWebhookN8n', itemIndex) as string;
						const destinatario = this.getNodeParameter('destinatario', itemIndex) as string;
						const mensagem = this.getNodeParameter('mensagem', itemIndex) as string;
						const recorrenciaTipo = this.getNodeParameter('recorrenciaTipo', itemIndex) as string;
						const recorrenciaValor1 = this.getNodeParameter(
							'recorrenciaValor1',
							itemIndex,
						) as string;
						const recorrenciaValor2 = this.getNodeParameter(
							'recorrenciaValor2',
							itemIndex,
							undefined,
						) as string | undefined;
						const precisarEnviar = this.getNodeParameter('precisarEnviar', itemIndex, undefined) as
							| boolean
							| undefined;
						const codigo = this.getNodeParameter('codigo', itemIndex, undefined) as
							| string
							| undefined;

						const configRecorrencia = {
							tipo: recorrenciaTipo,
							valor1: recorrenciaValor1,
							valor2: recorrenciaValor2,
						};

						resultado = await TarefasResource.criarTarefaAgendadaWebhook(
							this.getNode(),
							authToken,
							destinatario,
							mensagem,
							configRecorrencia,
							linkWebhookN8n,
							precisarEnviar,
							codigo,
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${funcao}" não implementada para Tarefas Agendadas`,
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
