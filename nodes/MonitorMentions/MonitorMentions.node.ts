import type {
	IDataObject,
	IExecuteFunctions,
	IHttpRequestMethods,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeConnectionTypes, NodeOperationError } from 'n8n-workflow';

const API_BASE = 'https://www.monitormentions.com/api/v1';
const CREDENTIAL = 'monitorMentionsApi';

export class MonitorMentions implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Monitor Mentions',
		name: 'monitorMentions',
		icon: { light: 'file:monitormentions.svg', dark: 'file:monitormentions.dark.svg' },
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: 'Instagram brand mentions, hype scores, and rankings from Monitor Mentions',
		defaults: { name: 'Monitor Mentions' },
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		usableAsTool: true,
		credentials: [{ name: CREDENTIAL, required: true }],
		properties: [
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Brand',
						value: 'getBrand',
						action: 'Get a brand',
						description: 'Get one brand by slug (includes hype summary)',
					},
					{
						name: 'Get Brand History',
						value: 'getBrandHistory',
						action: 'Get brand history',
						description: 'Follower history for a brand',
					},
					{
						name: 'Get Brand Hype',
						value: 'getBrandHype',
						action: 'Get brand hype',
						description: 'Hype score and history for a brand',
					},
					{
						name: 'Get Credits',
						value: 'getCredits',
						action: 'Get credit balance',
						description: 'Return account email and credits remaining',
					},
					{
						name: 'Get Rankings',
						value: 'getRankings',
						action: 'Get rankings',
						description: 'Brand rankings',
					},
					{
						name: 'List Brands',
						value: 'listBrands',
						action: 'List brands',
						description: 'List brands in the catalogue',
					},
				],
				default: 'getBrand',
			},
			{
				displayName: 'Brand Slug',
				name: 'slug',
				type: 'string',
				default: '',
				required: true,
				placeholder: 'nike',
				displayOptions: {
					show: { operation: ['getBrand', 'getBrandHype', 'getBrandHistory'] },
				},
			},
			{
				displayName: 'Query',
				name: 'query',
				type: 'string',
				default: '',
				placeholder: 'optional search',
				description: 'Optional search/filter query for list endpoints',
				displayOptions: { show: { operation: ['listBrands', 'getRankings'] } },
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			try {
				const operation = this.getNodeParameter('operation', itemIndex) as string;
				let response: IDataObject;

				if (operation === 'getCredits') {
					response = await apiRequest.call(this, 'GET', '/me');
				} else if (operation === 'listBrands') {
					const query = (this.getNodeParameter('query', itemIndex, '') as string).trim();
					const qs: IDataObject = {};
					if (query) qs.q = query;
					response = await apiRequest.call(this, 'GET', '/brands', qs);
				} else if (operation === 'getBrand') {
					const slug = (this.getNodeParameter('slug', itemIndex) as string).trim();
					response = await apiRequest.call(this, 'GET', `/brands/${encodeURIComponent(slug)}`);
				} else if (operation === 'getBrandHype') {
					const slug = (this.getNodeParameter('slug', itemIndex) as string).trim();
					response = await apiRequest.call(
						this,
						'GET',
						`/brands/${encodeURIComponent(slug)}/hype`,
					);
				} else if (operation === 'getBrandHistory') {
					const slug = (this.getNodeParameter('slug', itemIndex) as string).trim();
					response = await apiRequest.call(
						this,
						'GET',
						`/brands/${encodeURIComponent(slug)}/history`,
					);
				} else if (operation === 'getRankings') {
					const query = (this.getNodeParameter('query', itemIndex, '') as string).trim();
					const qs: IDataObject = {};
					if (query) qs.q = query;
					response = await apiRequest.call(this, 'GET', '/rankings', qs);
				} else {
					throw new NodeOperationError(this.getNode(), `Unknown operation: ${operation}`, {
						itemIndex,
					});
				}

				returnData.push({ json: response, pairedItem: { item: itemIndex } });
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message },
						pairedItem: { item: itemIndex },
					});
					continue;
				}
				if ((error as { context?: unknown }).context) {
					(error as { context: { itemIndex: number } }).context.itemIndex = itemIndex;
					throw error;
				}
				throw new NodeOperationError(this.getNode(), error as Error, { itemIndex });
			}
		}

		return [returnData];
	}
}

async function apiRequest(
	this: IExecuteFunctions,
	method: IHttpRequestMethods,
	path: string,
	qs: IDataObject = {},
): Promise<IDataObject> {
	try {
		return (await this.helpers.httpRequestWithAuthentication.call(this, CREDENTIAL, {
			method,
			url: `${API_BASE}${path}`,
			qs,
			json: true,
		})) as IDataObject;
	} catch (error) {
		throw new NodeApiError(this.getNode(), error as JsonObject);
	}
}
