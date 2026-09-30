import Head from 'expo-router/head';

import LoginScreen from '@/features/auth/LoginScreen';

export default function LoginRoute() {
  return (
    <>
      <Head>
        <title>Inloggen · KBC Mobile</title>
      </Head>
      <LoginScreen />
    </>
  );
}
