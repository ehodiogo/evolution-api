import { INode } from 'n8n-workflow';
interface IItemCalendario {
    titulo: string;
    inicio: string;
    fim: string;
    tipo?: 'evento' | 'tarefa' | 'ausente';
    descricao?: string;
    link_reuniao?: string;
    contato?: number | null;
    cor?: string;
    notificar?: boolean;
    minutos_antes_notificar?: number;
    id?: number;
    contato_nome?: string;
    cor_default?: string;
}
export declare class CalendarioResource {
    private static readonly BASE_URL;
    static listarItens(node: INode, authToken: string, dataInicio?: string, dataFim?: string, limite?: number): Promise<IItemCalendario[]>;
    static criarItem(node: INode, authToken: string, itemData: IItemCalendario): Promise<IItemCalendario>;
    static deletarItem(node: INode, authToken: string, itemId: number): Promise<void>;
    private static getApiErrorDetail;
}
export {};
