import Head from 'expo-router/head';

import MijnWereldScreen from '@/features/mijn-wereld/MijnWereldScreen';

export default function MijnWereldRoute() {
  return (
    <>
      <Head>
        <title>Mijn wereld · KBC Mobile</title>
      </Head>
      <MijnWereldScreen />
    </>
  );
}
