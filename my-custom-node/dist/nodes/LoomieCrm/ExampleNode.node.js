"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleNode = void 0;
const n8n_workflow_1 = require("n8n-workflow");
const ContatosResource_1 = require("../../resources/ContatosResource");
const NegociosResource_1 = require("../../resources/NegociosResource");
const NotificacaoResource_1 = require("../../resources/NotificacaoResource");
const NotasResource_1 = require("../../resources/NotasResource");
const AtributosResource_1 = require("../../resources/AtributosResource");
const KnowledgeResource_1 = require("../../resources/KnowledgeResource");
class ExampleNode {
    constructor() {
        this.description = {
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
            tool: {
                description: 'Use esta ferramenta para gerenciar dados no LoomieCRM. Ela permite listar contatos; criar, obter, atualizar ou mover negócios; criar notificações; criar notas de atendimento; criar atributos personalizados; e **criar Bases de Conhecimento completas**.',
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
                        { name: 'Base de Conhecimento', value: 'knowledge' },
                    ],
                    default: 'contatos',
                    description: 'Escolha o conjunto de funções',
                },
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
                {
                    displayName: 'Função',
                    name: 'funcao',
                    type: 'options',
                    options: [{ name: 'Criar Notificação', value: 'criarNotificacao' }],
                    default: 'criarNotificacao',
                    description: 'Escolha a função a ser executada',
                    displayOptions: { show: { recurso: ['notificacoes'] } },
                },
                {
                    displayName: 'Função',
                    name: 'funcao',
                    type: 'options',
                    options: [{ name: 'Criar Nota', value: 'criarNota' }],
                    default: 'criarNota',
                    description: 'Escolha a função a ser executada',
                    displayOptions: { show: { recurso: ['notas'] } },
                },
                {
                    displayName: 'Função',
                    name: 'funcao',
                    type: 'options',
                    options: [{ name: 'Criar Atributo', value: 'criarAtributo' }],
                    default: 'criarAtributo',
                    description: 'Escolha a função a ser executada',
                    displayOptions: { show: { recurso: ['atributos'] } },
                },
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
                    description: 'Array de objetos JSON para os campos (Fields) da base. Ex: [{"name": "Cor", "field_type": "TEXT", "required": false}]',
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
                    description: 'Array de objetos JSON para as entradas (Entries/Dados). Ex: [{"values": {"Cor": "Azul", "Preço": 150000}}]',
                    displayOptions: {
                        show: { recurso: ['knowledge'], funcao: ['criarBaseDeConhecimentoCompleta'] },
                    },
                },
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
                },
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
                },
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
    }
    async execute() {
        const items = this.getInputData();
        const returnData = [];
        for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
            try {
                const recurso = this.getNodeParameter('recurso', itemIndex);
                const funcao = this.getNodeParameter('funcao', itemIndex);
                const authToken = this.getNodeParameter('authToken', itemIndex);
                let resultado;
                if (recurso === 'contatos') {
                    if (funcao === 'listarContato') {
                        resultado = await ContatosResource_1.ContatosResource.listarContatos(this.getNode(), authToken);
                    }
                    else if (funcao === 'criarContato') {
                        const contatoNome = this.getNodeParameter('contatoNome', itemIndex);
                        const contatoEmail = this.getNodeParameter('contatoEmail', itemIndex);
                        const contatoTelefone = this.getNodeParameter('contatoTelefone', itemIndex);
                        const contatoEmpresa = this.getNodeParameter('contatoEmpresa', itemIndex);
                        const contatoCargo = this.getNodeParameter('contatoCargo', itemIndex);
                        const contatoEndereco = this.getNodeParameter('contatoEndereco', itemIndex);
                        const contatoCidade = this.getNodeParameter('contatoCidade', itemIndex);
                        const contatoEstado = this.getNodeParameter('contatoEstado', itemIndex);
                        const contatoCep = this.getNodeParameter('contatoCep', itemIndex);
                        const contatoDataNascimento = this.getNodeParameter('contatoDataNascimento', itemIndex);
                        const contatoObservacoes = this.getNodeParameter('contatoObservacoes', itemIndex);
                        resultado = await ContatosResource_1.ContatosResource.criarContato(this.getNode(), authToken, contatoNome, contatoEmail, contatoTelefone, contatoEmpresa, contatoCargo, contatoEndereco, contatoCidade, contatoEstado, contatoCep, contatoDataNascimento, contatoObservacoes);
                    }
                    else if (funcao === 'buscarContatoPorTelefone') {
                        const telefone = this.getNodeParameter('contatoBuscaTelefone', itemIndex);
                        if (!telefone) {
                            throw new n8n_workflow_1.NodeOperationError(this.getNode(), 'O Telefone/WhatsApp ID é obrigatório para esta função.');
                        }
                        resultado = await ContatosResource_1.ContatosResource.buscarContatoPorTelefone(this.getNode(), authToken, telefone);
                    }
                    else {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Função "${funcao}" não implementada para Contatos`);
                    }
                }
                else if (recurso === 'negocios') {
                    let negocioId;
                    let titulo;
                    let valor;
                    let estagioId;
                    let contatoId;
                    if (funcao === 'criarNegocio') {
                        titulo = this.getNodeParameter('titulo', itemIndex);
                        valor = this.getNodeParameter('valor', itemIndex);
                        estagioId = this.getNodeParameter('estagioId', itemIndex);
                        contatoId = this.getNodeParameter('contatoId', itemIndex);
                        resultado = await NegociosResource_1.NegociosResource.criarNegocio(this.getNode(), authToken, titulo, valor, estagioId, contatoId);
                    }
                    else if (funcao === 'obterNegocio') {
                        negocioId = this.getNodeParameter('negocioId', itemIndex);
                        resultado = await NegociosResource_1.NegociosResource.obterNegocio(this.getNode(), authToken, negocioId);
                    }
                    else if (funcao === 'atualizarNegocio') {
                        negocioId = this.getNodeParameter('negocioId', itemIndex);
                        titulo = this.getNodeParameter('titulo', itemIndex, undefined);
                        valor = this.getNodeParameter('valor', itemIndex, undefined);
                        estagioId = this.getNodeParameter('estagioId', itemIndex, undefined);
                        contatoId = this.getNodeParameter('contatoId', itemIndex, undefined);
                        resultado = await NegociosResource_1.NegociosResource.editarNegocio(this.getNode(), authToken, negocioId, titulo, valor, estagioId, contatoId);
                    }
                    else if (funcao === 'trocarEstagio') {
                        negocioId = this.getNodeParameter('negocioId', itemIndex);
                        estagioId = this.getNodeParameter('estagioId', itemIndex);
                        resultado = await NegociosResource_1.NegociosResource.trocarEstagio(this.getNode(), authToken, negocioId, estagioId);
                    }
                    else if (funcao === 'listarNegociosPorEstagio') {
                        const kanbanId = this.getNodeParameter('kanbanId', itemIndex);
                        const estagioId = this.getNodeParameter('estagioId', itemIndex);
                        resultado = await NegociosResource_1.NegociosResource.obterNegociosPorEstagio(this.getNode(), authToken, kanbanId, estagioId);
                    }
                    else if (funcao === 'buscarNegocioPorTelefone') {
                        const telefone = this.getNodeParameter('telefone', itemIndex);
                        const kanbanId = this.getNodeParameter('kanbanId', itemIndex, undefined);
                        const estagioId = this.getNodeParameter('estagioId', itemIndex, undefined);
                        resultado = await NegociosResource_1.NegociosResource.buscarNegocioPorTelefone(this.getNode(), authToken, telefone, kanbanId, estagioId);
                    }
                    else {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Função "${funcao}" não implementada para Negócios`);
                    }
                }
                else if (recurso === 'notificacoes') {
                    if (funcao === 'criarNotificacao') {
                        const tipo = this.getNodeParameter('tipo', itemIndex);
                        const texto = this.getNodeParameter('texto', itemIndex);
                        const userId = this.getNodeParameter('userId', itemIndex);
                        resultado = await NotificacaoResource_1.NotificacaoResource.criarNotificacao(this.getNode(), authToken, tipo, texto, userId);
                    }
                    else {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Função "${funcao}" não implementada para Notificações`);
                    }
                }
                else if (recurso === 'notas') {
                    if (funcao === 'criarNota') {
                        const notaTitulo = this.getNodeParameter('notaTitulo', itemIndex);
                        const conteudo = this.getNodeParameter('conteudo', itemIndex);
                        const notaTipo = this.getNodeParameter('notaTipo', itemIndex);
                        const conversaId = this.getNodeParameter('conversaId', itemIndex, undefined);
                        resultado = await NotasResource_1.NotasResource.criarNotaAtendimento(this.getNode(), authToken, notaTitulo, conteudo, notaTipo, conversaId);
                    }
                    else {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Função "${funcao}" não implementada para Notas de Atendimento`);
                    }
                }
                else if (recurso === 'atributos') {
                    if (funcao === 'criarAtributo') {
                        const negocioId = this.getNodeParameter('negocioId', itemIndex);
                        const label = this.getNodeParameter('label', itemIndex);
                        const atributoValor = this.getNodeParameter('atributoValor', itemIndex);
                        const atributoType = this.getNodeParameter('atributoType', itemIndex);
                        resultado = await AtributosResource_1.AtributosResource.criarAtributoPersonalizavel(this.getNode(), authToken, negocioId, label, atributoValor, atributoType);
                    }
                    else {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Função "${funcao}" não implementada para Atributos Personalizados`);
                    }
                }
                else if (recurso === 'knowledge') {
                    if (funcao === 'criarBaseDeConhecimentoCompleta') {
                        const clientId = this.getNodeParameter('clientId', itemIndex);
                        const name = this.getNodeParameter('knowledgeBaseName', itemIndex);
                        const fieldsJson = this.getNodeParameter('knowledgeFieldsJson', itemIndex);
                        const entriesJson = this.getNodeParameter('knowledgeEntriesJson', itemIndex);
                        let fields = [];
                        let entries = [];
                        if (fieldsJson && fieldsJson !== '[]') {
                            try {
                                fields = JSON.parse(fieldsJson);
                            }
                            catch (e) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Erro ao analisar o JSON dos Campos (Fields): ${e.message}`);
                            }
                        }
                        if (entriesJson && entriesJson !== '[]') {
                            try {
                                entries = JSON.parse(entriesJson);
                            }
                            catch (e) {
                                throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Erro ao analisar o JSON das Entradas (Entries): ${e.message}`);
                            }
                        }
                        resultado = await KnowledgeResource_1.KnowledgeResource.criarBaseDeConhecimentoCompleta(this.getNode(), authToken, clientId, name, fields, entries);
                    }
                    else {
                        throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Função "${funcao}" não implementada para Base de Conhecimento`);
                    }
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), `Recurso "${recurso}" não implementado`);
                }
                returnData.push({ json: resultado });
            }
            catch (error) {
                if (this.continueOnFail()) {
                    returnData.push({ json: { error: error.message } });
                }
                else {
                    throw new n8n_workflow_1.NodeOperationError(this.getNode(), error);
                }
            }
        }
        return [returnData];
    }
}
exports.ExampleNode = ExampleNode;
//# sourceMappingURL=ExampleNode.node.js.map