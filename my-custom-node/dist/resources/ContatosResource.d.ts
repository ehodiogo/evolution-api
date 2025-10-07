import { INode } from 'n8n-workflow';
export declare class ContatosResource {
    static listarContatos(node: INode, authToken: string): Promise<any>;
    static criarContato(node: INode, authToken: string, nome: string, email: string, telefone: string, empresa: string, cargo: string, endereco: string, cidade: string, estado: string, cep: string, data_nascimento: string, observacoes: string): Promise<any>;
}
