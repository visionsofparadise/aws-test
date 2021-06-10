import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ITestUser } from './testUser';

export interface ITestApiKey {
	apiKey: string;
	apiKeyClient: AxiosInstance;
	deleteApiKey: () => Promise<AxiosResponse<any>>;
}

export interface ITestApiKeyProps {
	apiKeyUrl: string;
	clientBaseUrl: string;
	user: ITestUser;
}

export const testApiKey = async (props: ITestApiKeyProps): Promise<ITestApiKey> => {
	const response = await axios.post<{ apiKey: string }>(props.apiKeyUrl, undefined, {
		headers: {
			Authorization: props.user.tokens.IdToken
		}
	});

	const apiKey = response.data.apiKey;

	const apiKeyClient = axios.create({
		baseURL: props.clientBaseUrl,
		headers: {
			Authorization: apiKey
		}
	});

	const deleteApiKey = async () =>
		axios.delete(`${props.apiKeyUrl}/${apiKey}`, {
			headers: {
				Authorization: props.user.tokens.IdToken
			}
		});

	return {
		apiKey,
		apiKeyClient,
		deleteApiKey
	};
};
