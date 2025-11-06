import { INode } from 'n8n-workflow';
export declare class AtendimentoResource {
    static toggleAtendimentoHumano(node: INode, authToken: string, conversaId: string, ativar: boolean): Promise<any>;
}
