import { INode } from 'n8n-workflow';
export declare const ATRIBUTO_TYPE_CHOICES: {
    BOOLEAN: string;
    INTEGER: string;
    FLOAT: string;
    STRING: string;
    DATE: string;
    DATETIME: string;
    TIME: string;
    TEXT: string;
};
export declare class AtributosResource {
    static criarAtributoPersonalizavel(node: INode, authToken: string, negocioId: string, label: string, valor: string, type: string): Promise<any>;
}
