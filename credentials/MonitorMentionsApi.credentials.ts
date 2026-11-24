import type {
	IAuthenticateGeneric,
	Icon,
	ICredentialTestRequest,
	ICredentialType,
	INodeProperties,
} from 'n8n-workflow';

export class MonitorMentionsApi implements ICredentialType {
	name = 'monitorMentionsApi';

	displayName = 'Monitor Mentions API';

	icon: Icon = {
		light: 'file:../nodes/MonitorMentions/monitormentions.svg',
		dark: 'file:../nodes/MonitorMentions/monitormentions.dark.svg',
	};

	documentationUrl = 'https://www.monitormentions.com/docs/api';

	properties: INodeProperties[] = [
		{
			displayName: 'API Key',
			name: 'apiKey',
			type: 'string',
			typeOptions: { password: true },
			default: '',
			required: true,
			description: 'Create a key at https://www.monitormentions.com/dashboard/api (starts with mm_live_)',
		},
	];

	authenticate: IAuthenticateGeneric = {
		type: 'generic',
		properties: {
			headers: {
				Authorization: '=Bearer {{$credentials.apiKey}}',
			},
		},
	};

	test: ICredentialTestRequest = {
		request: {
			baseURL: 'https://www.monitormentions.com/api/v1',
			url: '/me',
			method: 'GET',
		},
	};
}
