import { Amplify } from 'aws-amplify';
import { signIn } from '@aws-amplify/auth';

Amplify.configure({
  Auth: {
    Cognito: {
      userPoolId: 'eu-west-1_3FByIPhLH',
      userPoolClientId: '8se03el64eb3fmrq8l034ong4',
      loginWith: {
        username: true,
      },
    },
  },
});

export class AuthService {
  public async login(username: string, password: string) {
    try {
      const result = await signIn({ username, password });

      return result;
    } catch (error) {
      console.log(error);
    }
  }
}
