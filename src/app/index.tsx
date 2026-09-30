import Head from 'expo-router/head';

import MijnWereldScreen from '@/features/mijn-wereld/MijnWereldScreen';
import { MijnWereldProvider } from '@/features/mijn-wereld/state/store';

export default function MijnWereldRoute() {
  return (
    <>
      <Head>
        <title>Mijn wereld · KBC Mobile</title>
      </Head>
      {/* Scoped to this route: logging out unmounts it and clears the state. */}
      <MijnWereldProvider>
        <MijnWereldScreen />
      </MijnWereldProvider>
    </>
  );
}
