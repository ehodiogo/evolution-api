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
import { AtendimentoResource } from '../../resources/AtendimentoResource';
import { CalendarioResource } from '../../resources/CalendarioResource';

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
export class ExampleNode implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'LoomieCRM Node',
		name: 'exampleNode',
		icon: 'file:../../assets/icon.svg',
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
				'Use esta ferramenta para gerenciar dados no LoomieCRM. Ela permite listar contatos; criar, obter, atualizar ou mover negócios; criar notificações; criar notas de atendimento; criar atributos personalizados; criar Bases de Conhecimento completas; e **criar tarefas agendadas (webhooks)**',
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
					{ name: 'Atendimento Humano', value: 'atendimento' },
					{ name: 'Atributos Personalizados', value: 'atributos' },
					{ name: 'Base De Conhecimento', value: 'knowledge' },
					{ name: 'Calendário', value: 'calendario' },
					{ name: 'Contatos', value: 'contatos' },
					{ name: 'Negócios', value: 'negocios' },
					{ name: 'Notas De Atendimento', value: 'notas' },
					{ name: 'Notificações', value: 'notificacoes' },
					{ name: 'Tarefas Agendadas', value: 'tarefas' },
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
					{ name: 'Buscar Contato Por Telefone', value: 'buscarContatoPorTelefone' },
					{ name: 'Criar Contato', value: 'criarContato' },
					{ name: 'Listar Contato', value: 'listarContato' },
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
					{ name: 'Atualizar Negócio', value: 'atualizarNegocio' },
					{ name: 'Buscar Negócio Por Telefone', value: 'buscarNegocioPorTelefone' },
					{ name: 'Criar Negócio', value: 'criarNegocio' },
					{ name: 'Listar Negócios Por Estágio', value: 'listarNegociosPorEstagio' },
					{ name: 'Obter Negócio', value: 'obterNegocio' },
					{ name: 'Trocar Estágio', value: 'trocarEstagio' },
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
					{ name: 'Criar Base De Conhecimento Completa', value: 'criarBaseDeConhecimentoCompleta' },
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
				description: 'Escolha a função a ser executada para agendamento',
				displayOptions: { show: { recurso: ['tarefas'] } },
			},
			// Funções de Calendário (NOVO)
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [
					{ name: 'Listar Itens', value: 'listarItens' },
					{ name: 'Criar Item', value: 'criarItem' },
					{ name: 'Deletar Item', value: 'deletarItem' },
				],
				default: 'listarItens',
				description: 'Escolha a função a ser executada para o Calendário',
				displayOptions: { show: { recurso: ['calendario'] } },
			},
			// --- Parâmetros de Calendário ---
			{
				displayName: 'Data Inicial',
				name: 'dataInicio',
				type: 'dateTime',
				default: '',
				description: 'A data e hora mínima para listar eventos (ex: 2025-01-01T00:00:00)',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['listarItens'] },
				},
			},
			{
				displayName: 'Data Final',
				name: 'dataFim',
				type: 'dateTime',
				default: '',
				description: 'A data e hora máxima para listar eventos (ex: 2025-01-31T23:59:59)',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['listarItens'] },
				},
			},
			{
				displayName: 'Máximo De Resultados',
				name: 'limite',
				type: 'number',
				typeOptions: {
					numberPrecision: 0,
				},
				default: 10,
				description: 'O número máximo de eventos a serem retornados',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['listarItens'] },
				},
			},

			// Parâmetros para Criar Evento
			{
				displayName: 'Título Do Evento',
				name: 'tituloEvento',
				type: 'string',
				default: '',
				description: 'O título ou assunto do evento (obrigatório)',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'] },
				},
			},
			{
				displayName: 'Tipo De Item',
				name: 'tipoItem',
				type: 'options',
				options: [
					{ name: 'Evento', value: 'evento' },
					{ name: 'Tarefa', value: 'tarefa' },
					{ name: 'Ausente', value: 'ausente' },
				],
				default: 'evento',
				description: 'O tipo do item de calendário',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'] },
				},
			},
			{
				displayName: 'Descrição',
				name: 'descricaoEvento',
				type: 'string',
				typeOptions: { multiline: true },
				default: '',
				description: 'Detalhes ou agenda do evento',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'] },
				},
			},
			{
				displayName: 'Data E Hora De Início',
				name: 'startDateTime',
				type: 'dateTime',
				default: '',
				description: 'Data e hora de início do evento (obrigatório, formato ISO 8601)',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'] },
				},
			},
			{
				displayName: 'Data E Hora De Fim',
				name: 'endDateTime',
				type: 'dateTime',
				default: '',
				description: 'Data e hora de término do evento (obrigatório, formato ISO 8601)',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'] },
				},
			},
			{
				displayName: 'Link Da Reunião (Opcional)',
				name: 'linkReuniao',
				type: 'string',
				default: '',
				description: 'URL para a sala de reunião (ex: Zoom, Google Meet)',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'] },
				},
			},
			{
				displayName: 'ID Do Contato Relacionado',
				name: 'contatoIdCalendario',
				type: 'number',
				typeOptions: {
					numberPrecision: 0,
				},
				default: 0,
				description: 'ID do Contato do LoomieCRM a ser associado ao item (opcional)',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'] },
				},
			},
			{
				displayName: 'Cor (Hexadecimal)',
				name: 'corEvento',
				type: 'string',
				default: '',
				description: 'Cor em formato hexadecimal (ex: #FF0000) para o item no calendário',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'] },
				},
			},
			{
				displayName: 'Notificar',
				name: 'notificar',
				type: 'boolean',
				default: false,
				description: 'Whether to send a notification about the event',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'] },
				},
			},
			{
				displayName: 'Minutos Antes De Notificar',
				name: 'minutosAntesNotificar',
				type: 'number',
				typeOptions: {
					numberPrecision: 0,
				},
				default: 15,
				description: 'Tempo em minutos antes do início para enviar a notificação (se ativada)',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['criarItem'], notificar: [true] },
				},
			},

			// Parâmetros para Deletar Evento
			{
				displayName: 'ID Do Evento',
				name: 'eventId',
				type: 'string',
				default: '',
				description: 'O ID único do evento a ser removido (obrigatório)',
				displayOptions: {
					show: { recurso: ['calendario'], funcao: ['deletarItem'] },
				},
			},

			// Parâmetros de Tarefas Agendadas (NOVO)
			{
				displayName: 'Link Webhook N8N',
				name: 'linkWebhookN8n',
				type: 'string',
				default: '',
				description: 'A URL completa do Webhook do n8n que será chamado no agendamento',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Destinatário (ID Contato/ID Negócio/Número Do WhatsApp)',
				name: 'destinatario',
				type: 'string',
				default: '',
				description: 'ID do Contato ou Negócio (obrigatório)',
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
					'A nota ou mensagem que será enviada quando a tarefa for executada (obrigatório)',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Recorrência - Tipo',
				name: 'recorrenciaTipo',
				type: 'options',
				default: 'unica',
				options: [
					{ name: 'Única (Data/Hora)', value: RECORRENCIA_TYPE_CHOICES.UNICA },
					{ name: 'A Cada X Horas', value: RECORRENCIA_TYPE_CHOICES.HORAS },
					{ name: 'Diária (Hora)', value: RECORRENCIA_TYPE_CHOICES.DIARIA },
					{ name: 'Semanal (Dia E Hora)', value: RECORRENCIA_TYPE_CHOICES.DIAS },
				],
				description: 'Define como a tarefa será repetida',
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
					'Data/Hora (unica: YYYY-MM-DD HH:MM), Horas (horas: 1, 2, 3...), Hora do Dia (diaria: HH:MM), Dia da Semana (dias: 0-6)',
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
					'Usado apenas para Recorrência "Diária" (HH:MM de início/fim) ou "Semanal" (Hora do Dia)',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Precisa Enviar (Opcional)',
				name: 'precisarEnviar',
				type: 'boolean',
				default: false,
				description: 'Whether the recipient should receive a send message',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Código (Opcional)',
				name: 'codigo',
				type: 'string',
				default: '',
				description: 'Um código de referência para a tarefa (opcional)',
				displayOptions: {
					show: { recurso: ['tarefas'], funcao: ['criarTarefaAgendadaWebhook'] },
				},
			},
			{
				displayName: 'Função',
				name: 'funcao',
				type: 'options',
				options: [
					{ name: 'Ativar/Desativar Atendimento Humano', value: 'toggleAtendimentoHumano' },
				],
				default: 'toggleAtendimentoHumano',
				description: 'Ativa ou desativa a pausa do bot para atendimento humano',
				displayOptions: { show: { recurso: ['atendimento'] } },
			}, // Parâmetros Comuns para Atendimento Humano (NOVO)

			{
				displayName: 'ID Da Conversa',
				name: 'conversaIdAtendimento', // Nome diferente para evitar conflito com conversaId de 'notas'
				type: 'string',
				default: '',
				description: 'O ID da conversa onde o atendimento humano será ativado/desativado',
				displayOptions: {
					show: { recurso: ['atendimento'], funcao: ['toggleAtendimentoHumano'] },
				},
			},
			{
				displayName: 'Ação',
				name: 'acaoAtendimento',
				type: 'options',
				options: [
					{ name: 'Ativar (Pausar O Bot Por 15 Min)', value: 'true' },
					{ name: 'Desativar (Ligar O Bot Imediatamente)', value: 'false' },
				],
				default: 'true',
				description:
					'Escolha se deseja Ativar (pausar o bot) ou Desativar (retomar o bot) o atendimento humano',
				displayOptions: {
					show: { recurso: ['atendimento'], funcao: ['toggleAtendimentoHumano'] },
				},
			},
			// FIM dos Parâmetros Tarefas Agendadas

			// ... (Restante dos parâmetros existentes) ...
			// Parâmetros do Recurso Knowledge Base (Base de Conhecimento)
			{
				displayName: 'ID Do Cliente',
				name: 'clientId',
				type: 'number',
				typeOptions: {
					numberPrecision: 0,
				},
				default: 0,
				description: 'O ID numérico do cliente ao qual a base de conhecimento pertence',
				displayOptions: {
					show: { recurso: ['knowledge'], funcao: ['criarBaseDeConhecimentoCompleta'] },
				},
			},
			{
				displayName: 'Nome Da Base De Conhecimento',
				name: 'knowledgeBaseName',
				type: 'string',
				default: '',
				description: 'O nome da nova Base de Conhecimento (KnowledgeBaseSet)',
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
					'Array de objetos JSON para os campos (Fields) da base. Ex: [{"name": "Cor", "field_type": "TEXT", "required": false}].',
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
					'Array de objetos JSON para as entradas (Entries/Dados). Ex: [{"values": {"Cor": "Azul", "Preço": 150000}}].',
				displayOptions: {
					show: { recurso: ['knowledge'], funcao: ['criarBaseDeConhecimentoCompleta'] },
				},
			},
			// FIM dos Parâmetros Knowledge Base

			// Parâmetros Comuns/Negócios
			{
				displayName: 'ID Do Kanban',
				name: 'kanbanId',
				type: 'string',
				default: '',
				displayOptions: {
					show: {
						recurso: ['negocios'],
						funcao: ['listarNegociosPorEstagio', 'buscarNegocioPorTelefone'],
					},
				},
			},
			{
				displayName: 'ID Do Estágio',
				name: 'estagioId',
				type: 'string',
				default: '',
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
				displayName: 'ID Do Estágio',
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
				displayName: 'ID Do Contato',
				name: 'contatoId',
				type: 'string',
				default: '',
				displayOptions: {
					show: { recurso: ['negocios'], funcao: ['criarNegocio', 'atualizarNegocio'] },
				},
			},
			{
				displayName: 'ID Do Negócio',
				name: 'negocioId',
				type: 'string',
				default: '',
				description: 'ID do negócio para obter, atualizar ou anexar atributos',
				displayOptions: {
					show: {
						recurso: ['negocios', 'atributos'],
						funcao: ['obterNegocio', 'atualizarNegocio', 'trocarEstagio', 'criarAtributo'],
					},
				},
			}, // Parâmetros para Notificações
			{
				displayName: 'ID Do Preset (Opcional)',
				name: 'presetId',
				type: 'string',
				default: '',
				description: 'O ID do Preset a ser usado para preencher o novo negócio (opcional)',
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
				description: 'Tipo da notificação (boa, alerta, erro, info)',
				displayOptions: {
					show: { recurso: ['notificacoes'], funcao: ['criarNotificacao'] },
				},
			},
			{
				displayName: 'Texto Da Notificação',
				name: 'texto',
				type: 'string',
				default: '',
				description: 'Conteúdo principal da notificação (campo "texto" no Django)',
				displayOptions: {
					show: { recurso: ['notificacoes'], funcao: ['criarNotificacao'] },
				},
			},
			{
				displayName: 'ID Do Usuário',
				name: 'userId',
				type: 'string',
				default: '',
				description: 'ID do usuário que receberá a notificação (campo "usuario" no Django)',
				displayOptions: {
					show: { recurso: ['notificacoes'], funcao: ['criarNotificacao'] },
				},
			}, // Parâmetros para Notas de Atendimento
			{
				displayName: 'Título Da Nota',
				name: 'notaTitulo',
				type: 'string',
				default: '',
				description: 'Título da nota de atendimento',
				displayOptions: {
					show: { recurso: ['notas'], funcao: ['criarNota'] },
				},
			},
			{
				displayName: 'Conteúdo Da Nota',
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
				displayName: 'Tipo Da Nota',
				name: 'notaTipo',
				type: 'options',
				options: [
					{ name: 'Follow-Up', value: 'followup' },
					{ name: 'Importante', value: 'importante' },
					{ name: 'Informação', value: 'info' },
					{ name: 'Problema', value: 'problema' },
					{ name: 'Solução', value: 'solucao' },
					{ name: 'Urgente', value: 'urgente' },
				],
				default: 'info',
				description: 'O tipo da nota de atendimento',
				displayOptions: {
					show: { recurso: ['notas'], funcao: ['criarNota'] },
				},
			},
			{
				displayName: 'ID Da Conversa (Opcional)',
				name: 'conversaId',
				type: 'string',
				default: '',
				description: 'ID da conversa à qual a nota deve ser anexada (opcional)',
				displayOptions: {
					show: { recurso: ['notas'], funcao: ['criarNota'] },
				},
			}, // Parâmetros para Atributos Personalizados

			{
				displayName: 'ID Do Atributo',
				name: 'atributoId',
				type: 'string',
				default: '',
				description:
					'O ID numérico do Atributo Personalizado a ser editado (obrigatório para Edição)',
				displayOptions: {
					show: { recurso: ['atributos'], funcao: ['editarAtributo'] },
				},
			},
			{
				displayName: 'Label (Rótulo)',
				name: 'label',
				type: 'string',
				default: '',
				description: 'O nome do atributo (ex: "Cor Favorita")',
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
				displayName: 'Tipo De Dado',
				name: 'atributoType',
				type: 'options',
				options: [
					{ name: 'Boolean', value: 'boolean' },
					{ name: 'Date', value: 'date' },
					{ name: 'DateTime', value: 'datetime' },
					{ name: 'Float', value: 'float' },
					{ name: 'Integer', value: 'integer' },
					{ name: 'String', value: 'string' },
					{ name: 'Text', value: 'text' },
					{ name: 'Time', value: 'time' },
				],
				default: 'string',
				description: 'O tipo de dado armazenado (string, integer, date, etc.)',
				displayOptions: {
					show: { recurso: ['atributos'], funcao: ['criarAtributo', 'editarAtributo'] },
				},
			}, // Parâmetros para Contatos

			{
				displayName: 'Nome',
				name: 'contatoNome',
				type: 'string',
				default: '',
				description: 'Nome completo do novo contato',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Email',
				name: 'contatoEmail',
				type: 'string',
				default: '',
				description: 'Endereço de email do novo contato',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Telefone',
				name: 'contatoTelefone',
				type: 'string',
				default: '',
				description: 'Número de telefone do novo contato',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Empresa',
				name: 'contatoEmpresa',
				type: 'string',
				default: '',
				description: 'Empresa do contato',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Cargo',
				name: 'contatoCargo',
				type: 'string',
				default: '',
				description: 'Cargo do contato na empresa',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Endereço',
				name: 'contatoEndereco',
				type: 'string',
				default: '',
				description: 'Rua e número do endereço',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Cidade',
				name: 'contatoCidade',
				type: 'string',
				default: '',
				description: 'Cidade do contato',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Estado',
				name: 'contatoEstado',
				type: 'string',
				default: '',
				description: 'Estado (UF) do contato',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'CEP',
				name: 'contatoCep',
				type: 'string',
				default: '',
				description: 'CEP do contato',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Data De Nascimento',
				name: 'contatoDataNascimento',
				type: 'string',
				default: '',
				description: 'Data de nascimento (formato YYYY-MM-DD)',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},
			{
				displayName: 'Observações',
				name: 'contatoObservacoes',
				type: 'string',
				typeOptions: { multiline: true },
				default: '',
				description: 'Quaisquer observações adicionais sobre o contato',
				displayOptions: { show: { recurso: ['contatos'], funcao: ['criarContato'] } },
			},

			{
				displayName: 'Telefone/WhatsApp ID',
				name: 'contatoBuscaTelefone',
				type: 'string',
				default: '',
				description: 'Telefone ou WhatsApp ID do contato para buscar',
				displayOptions: {
					show: { recurso: ['contatos'], funcao: ['buscarContatoPorTelefone'] },
				},
			},

			{
				displayName: 'Telefone/WhatsApp ID',
				name: 'telefone',
				type: 'string',
				default: '',
				description: 'Telefone ou WhatsApp ID do contato para buscar o negócio',
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
								'O Telefone/WhatsApp ID é obrigatório para esta função',
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
				} else if (recurso === 'atendimento') {
					// ✅ NOVO BLOCO DE EXECUÇÃO: Atendimento Humano
					if (funcao === 'toggleAtendimentoHumano') {
						const conversaId = this.getNodeParameter('conversaIdAtendimento', itemIndex) as string;
						// O valor do parâmetro é uma string 'true' ou 'false', precisa converter para boolean
						const acaoAtendimento = this.getNodeParameter('acaoAtendimento', itemIndex) as string;
						const ativar = acaoAtendimento === 'true';

						if (!conversaId) {
							throw new NodeOperationError(
								this.getNode(),
								'O ID da Conversa é obrigatório para Ativar/Desativar Atendimento Humano',
							);
						}

						resultado = await AtendimentoResource.toggleAtendimentoHumano(
							this.getNode(),
							authToken,
							conversaId,
							ativar,
						);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${funcao}" não implementada para Atendimento Humano`,
						);
					}
				} else if (recurso === 'calendario') {
					// CORREÇÃO: Usar 'funcaoCalendario' (assumindo que esta é a key correta)
					const calendarioFuncao = this.getNodeParameter('funcao', itemIndex) as string;

					if (calendarioFuncao === 'listarItens') {
						const dataInicio = this.getNodeParameter('dataInicio', itemIndex) as string;
						const dataFim = this.getNodeParameter('dataFim', itemIndex) as string;
						const limite = this.getNodeParameter('limite', itemIndex) as number;

						resultado = await CalendarioResource.listarItens(
							this.getNode(),
							authToken,
							dataInicio,
							dataFim,
							limite,
						);
					} else if (calendarioFuncao === 'criarItem') {
						// 1. Obter todos os parâmetros do nó
						const tituloEvento = this.getNodeParameter('tituloEvento', itemIndex) as string;
						const descricaoEvento = this.getNodeParameter('descricaoEvento', itemIndex) as string;
						const startDateTime = this.getNodeParameter('startDateTime', itemIndex) as string;
						const endDateTime = this.getNodeParameter('endDateTime', itemIndex) as string;

						// Os parâmetros do n8n (que estavam incorretos na chamada anterior):
						const tipoItem = this.getNodeParameter('tipoItem', itemIndex) as string;
						const linkReuniao = this.getNodeParameter('linkReuniao', itemIndex) as string;
						const contatoIdCalendario = this.getNodeParameter(
							'contatoIdCalendario',
							itemIndex,
						) as number;
						const corEvento = this.getNodeParameter('corEvento', itemIndex) as string;
						const notificar = this.getNodeParameter('notificar', itemIndex) as boolean;
						const minutosAntesNotificar = this.getNodeParameter(
							'minutosAntesNotificar',
							itemIndex,
						) as number;

						// 2. CORREÇÃO: Agrupar os parâmetros no objeto IItemCalendario
						const itemData: IItemCalendario = {
							titulo: tituloEvento,
							inicio: startDateTime,
							fim: endDateTime,
							tipo: tipoItem as 'evento' | 'tarefa' | 'ausente',
							descricao: descricaoEvento,
							link_reuniao: linkReuniao,
							contato: contatoIdCalendario > 0 ? contatoIdCalendario : null,
							cor: corEvento,
							notificar: notificar,
							minutos_antes_notificar: minutosAntesNotificar,
						};

						// 3. Chamar a função passando o objeto de dados único
						resultado = await CalendarioResource.criarItem(this.getNode(), authToken, itemData);
					} else if (calendarioFuncao === 'deletarItem') {
						const eventIdString = this.getNodeParameter('eventId', itemIndex) as string;

						if (!eventIdString || isNaN(parseInt(eventIdString, 10))) {
							throw new NodeOperationError(
								this.getNode(),
								'O ID do Evento (eventId) é obrigatório e deve ser um número válido para deletar',
							);
						}

						// CORREÇÃO: Converter eventId de string (lido do nó) para number (esperado pelo Resource)
						const eventId = parseInt(eventIdString, 10);

						resultado = await CalendarioResource.deletarItem(this.getNode(), authToken, eventId);
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Função "${calendarioFuncao}" não implementada para Calendário`,
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
