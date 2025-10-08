import {
	IAuthenticateGeneric,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

// Garante a exportação padrão para evitar o erro 'not a constructor'
export class ExampleCredentialsApi implements ICredentialType {
	// Ajusta o nome para corresponder ao Node
	name = 'loomieCRMApi';
	displayName = 'LoomieCRM API';

	documentationUrl = 'https://your-docs-url';

	// MUDANÇA ESSENCIAL: Armazenar apenas o Access Token
	properties: INodeProperties[] = [
		{
			displayName: 'Access Token (Bearer)',
			name: 'accessToken',
			type: 'string',
			typeOptions: {
				password: true, // Importante para armazenar de forma segura
			},
			default: '',
			description: 'O Access Token Bearer para autenticação na API LoomieCRM.',
		},
	];

	// Como é apenas um token, o bloco 'authenticate' não é estritamente necessário
	// a menos que você queira que ele configure automaticamente o header HTTP para o Node de HTTP Request.
	// Para custom nodes, é melhor obter a propriedade diretamente como você já faz.
	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				// Isso configura o cabeçalho Authorization automaticamente para outros Nodes
				Authorization: '={{ "Bearer " + $credentials.accessToken }}',
			},
		},
	};

	// Se você tiver um endpoint simples que valide o token, configure o teste
	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://backend.loomiecrm.com/', // Sua URL base
			url: 'contatos/', // Um endpoint simples, como listar contatos
			headers: {
				Authorization: '={{ "Bearer " + $credentials.accessToken }}',
			},
		},
	};
}
