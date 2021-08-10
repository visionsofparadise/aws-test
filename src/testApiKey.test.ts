import { testApiKey } from './testApiKey';
import { ITestUser } from './testUser';

jest.mock('axios', () => ({
	create: jest.fn().mockResolvedValue('test'),
	post: jest.fn().mockResolvedValue({ data: { apiKey: 'apikey-test' } }),
	delete: jest.fn().mockResolvedValue('success')
}));

const apiKeyValue = 'apikey-test';

const user = {
	tokens: {
		IdToken: 'test'
	}
} as ITestUser;

it('creates a test api key', async () => {
	const apiKey = await testApiKey({
		apiKeyUrl: 'test',
		clientBaseUrl: 'test',
		user
	});

	expect(apiKey.apiKey).toBe(apiKeyValue);
	expect(apiKey.apiKeyClient).toBeDefined();
	expect(apiKey.deleteApiKey).toBeDefined();
});

it('deletes a test api key', async () => {
	const apiKey = await testApiKey({
		apiKeyUrl: 'test',
		clientBaseUrl: 'test',
		user
	});

	const response = await apiKey.deleteApiKey();

	expect(response).toBe('success');
});
