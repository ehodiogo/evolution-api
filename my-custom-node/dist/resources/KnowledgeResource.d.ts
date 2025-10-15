import { INode } from 'n8n-workflow';
interface KnowledgeBaseField {
    name: string;
    field_type: 'TEXT' | 'NUMBER' | 'BOOLEAN' | 'DATE' | 'URL' | 'JSON' | string;
    required?: boolean;
}
interface KnowledgeBaseEntryData {
    values: {
        [fieldName: string]: any;
    };
}
export declare class KnowledgeResource {
    static criarBaseDeConhecimentoCompleta(node: INode, authToken: string, client_id: number, name: string, fields?: KnowledgeBaseField[], entries?: KnowledgeBaseEntryData[]): Promise<any>;
}
export {};
