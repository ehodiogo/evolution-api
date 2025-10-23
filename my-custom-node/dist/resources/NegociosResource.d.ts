import { INode } from 'n8n-workflow';
export declare class NegociosResource {
    static criarNegocio(node: INode, authToken: string, titulo: string, valor: number, estagioId: string, contatoId: string, presetId?: string): Promise<any>;
    static obterNegocio(node: INode, authToken: string, negocioId: string): Promise<any>;
    static editarNegocio(node: INode, authToken: string, negocioId: string, titulo?: string, valor?: number, estagioId?: string, contatoId?: string): Promise<any>;
    static trocarEstagio(node: INode, authToken: string, negocioId: string, novoEstagioId: string): Promise<any>;
    static obterNegociosPorEstagio(node: INode, authToken: string, kanbanId: string, estagioId: string): Promise<any>;
    static buscarNegocioPorTelefone(node: INode, authToken: string, telefone: string, kanbanId?: string, estagioId?: string): Promise<any>;
}
