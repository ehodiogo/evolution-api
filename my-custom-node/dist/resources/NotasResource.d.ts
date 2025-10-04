import { INode } from 'n8n-workflow';
export declare class NotasResource {
    static criarNotaAtendimento(node: INode, authToken: string, titulo: string, conteudo: string, tipo: string, conversaId?: string): Promise<any>;
}
