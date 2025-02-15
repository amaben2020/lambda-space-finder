import { AuthService } from '../services/AuthService';

async function testAuth() {
  const service = new AuthService();

  const loginResult = await service.login(
    'd2a5d484-8091-7058-59d8-25a701283607',
    'Ugonna2018@'
  );

  console.log(loginResult);
}

testAuth();
