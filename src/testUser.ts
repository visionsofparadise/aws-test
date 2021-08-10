import { AWSError, CognitoIdentityServiceProvider, Response } from 'aws-sdk';
import axios, { AxiosInstance } from 'axios';
import { customAlphabet } from 'nanoid';

const alphaNanoid = customAlphabet('1234567890abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ', 10);

export interface ITestUser {
	userId: string;
	tokens: CognitoIdentityServiceProvider.AuthenticationResultType;
	cognitoClient: AxiosInstance;
	deleteUser: () => Promise<{ $response: Response<{}, AWSError> }>;
}

export interface ITestUserProps {
	cognito: CognitoIdentityServiceProvider;
	clientId: string;
	clientBaseUrl: string;
	userAttributes?: CognitoIdentityServiceProvider.AttributeListType;
}

export const testUser = async (props: ITestUserProps) => {
	const username = `${alphaNanoid()}@${alphaNanoid()}.com`;
	const password = 'abcABC123!"£';

	const signUpResponse = await props.cognito
		.signUp({
			ClientId: props.clientId,
			Username: username,
			Password: password,
			UserAttributes: props.userAttributes || [
				{
					Name: 'email',
					Value: username
				}
			]
		})
		.promise();

	await new Promise(resolve => setTimeout(resolve, 2000));

	const signInResponse = await props.cognito
		.initiateAuth({
			ClientId: props.clientId,
			AuthFlow: 'USER_PASSWORD_AUTH',
			AuthParameters: {
				USERNAME: username,
				PASSWORD: password
			}
		})
		.promise();

	if (!signInResponse.AuthenticationResult) throw new Error('Sign In Failed');
	if (!signInResponse.AuthenticationResult.IdToken) throw new Error('Id Token Not Found');
	if (!signInResponse.AuthenticationResult.AccessToken) throw new Error('Access Token Not Found');

	const cognitoClient = axios.create({
		baseURL: props.clientBaseUrl,
		headers: {
			Authorization: signInResponse.AuthenticationResult.IdToken
		}
	});

	const deleteUser = () =>
		props.cognito.deleteUser({ AccessToken: signInResponse.AuthenticationResult!.AccessToken! }).promise();

	const user: ITestUser = {
		userId: signUpResponse.UserSub,
		tokens: signInResponse.AuthenticationResult,
		cognitoClient,
		deleteUser
	};

	return user;
};
