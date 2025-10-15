import { INode } from 'n8n-workflow';
export declare const TAREFA_TYPE_CHOICES: {
    WEBHOOK: string;
};
export declare const RECORRENCIA_TYPE_CHOICES: {
    UNICA: string;
    HORAS: string;
    DIARIA: string;
    DIAS: string;
};
export declare class TarefasResource {
    static criarTarefaAgendadaWebhook(node: INode, authToken: string, destinatario: string, mensagem: string, configRecorrencia: {
        tipo: string;
        valor1: string;
        valor2?: string;
    }, linkWebhookN8n: string, precisarEnviar?: boolean, codigo?: string): Promise<any>;
}
