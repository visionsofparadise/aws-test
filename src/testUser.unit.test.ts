import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { testUser } from './testUser';

const UserSub = 'userSub-test';
const IdToken = 'id-test';
const AccessToken = 'access-test';
const RefreshToken = 'refresh-test';
const deleteResponse = 'delete-success';

const cognito = {
	signUp: jest.fn().mockReturnValue({
		promise: jest.fn().mockResolvedValue({ UserSub })
	}),
	initiateAuth: jest.fn().mockReturnValue({
		promise: jest.fn().mockResolvedValue({
			AuthenticationResult: { IdToken, AccessToken, RefreshToken }
		})
	}),
	deleteUser: jest.fn().mockReturnValue({
		promise: jest.fn().mockResolvedValue(deleteResponse)
	})
} as unknown as CognitoIdentityServiceProvider;

jest.useRealTimers();

it('creates a test user', async () => {
	expect.assertions(4);

	const user = await testUser({
		cognito,
		clientId: 'test',
		clientBaseUrl: 'test'
	});

	expect(user.cognitoClient).toBeDefined();
	expect(user.deleteUser).toBeDefined();
	expect(user.userId).toBe(UserSub);
	expect(user.tokens).toStrictEqual({ IdToken, AccessToken, RefreshToken });
});

it('deletes the test user', async () => {
	const user = await testUser({
		cognito,
		clientId: 'test',
		clientBaseUrl: 'test'
	});

	const response = await user.deleteUser();

	expect(response).toBe(deleteResponse);
});
