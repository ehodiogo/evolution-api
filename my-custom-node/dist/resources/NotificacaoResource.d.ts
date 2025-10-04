import { INode } from 'n8n-workflow';
export declare class NotificacaoResource {
    static criarNotificacao(node: INode, authToken: string, tipo: string, texto: string, userId: string): Promise<any>;
}
