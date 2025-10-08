"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExampleCredentialsApi = void 0;
class ExampleCredentialsApi {
    constructor() {
        this.name = 'loomieCRMApi';
        this.displayName = 'LoomieCRM API';
        this.documentationUrl = 'https://your-docs-url';
        this.properties = [
            {
                displayName: 'Access Token (Bearer)',
                name: 'accessToken',
                type: 'string',
                typeOptions: {
                    password: true,
                },
                default: '',
                description: 'O Access Token Bearer para autenticação na API LoomieCRM.',
            },
        ];
        this.authenticate = {
            type: 'generic',
            properties: {
                headers: {
                    Authorization: '={{ "Bearer " + $credentials.accessToken }}',
                },
            },
        };
        this.test = {
            request: {
                baseURL: 'https://backend.loomiecrm.com/',
                url: 'contatos/',
                headers: {
                    Authorization: '={{ "Bearer " + $credentials.accessToken }}',
                },
            },
        };
    }
}
exports.ExampleCredentialsApi = ExampleCredentialsApi;
//# sourceMappingURL=ExampleCredentialsApi.credentials.js.map