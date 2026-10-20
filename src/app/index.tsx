import Head from 'expo-router/head';

import MijnWereldScreen from '@/features/mijn-wereld/MijnWereldScreen';
import { MijnWereldProvider } from '@/features/mijn-wereld/state/store';
import { WorldProvider } from '@/features/mijn-wereld/world/state/store';

export default function MijnWereldRoute() {
  return (
    <>
      <Head>
        <title>Mijn wereld · KBC Mobile</title>
      </Head>
      {/* Scoped to this route: logging out unmounts it and clears the state. The world reads the
          family moment, so it sits inside the moment provider. */}
      <MijnWereldProvider>
        <WorldProvider>
          <MijnWereldScreen />
        </WorldProvider>
      </MijnWereldProvider>
    </>
  );
}
