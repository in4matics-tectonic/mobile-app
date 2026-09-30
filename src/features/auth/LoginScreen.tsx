// Login for KBC Mobile in the "Mijn wereld" look: daylight sky, Kate, rounded white card.

import { StatusBar as SystemStatusBar } from 'expo-status-bar';
import { useRef, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { StatusBar } from '@/features/mijn-wereld/components/Header';
import { KateLogoIcon } from '@/features/mijn-wereld/components/KateLogoIcon';
import { PhoneFrame, usePhoneFramed } from '@/features/mijn-wereld/components/PhoneFrame';
import { SkyBackground } from '@/features/mijn-wereld/components/SkyBackground';
import { PillButton } from '@/features/mijn-wereld/components/ui';
import { KbcApiError, login } from '@/features/mijn-wereld/services/kbcApi';
import { font, page, shadow, world } from '@/features/mijn-wereld/theme';

/** Demo customers from the backend; Tom and Lien share one customer file. */
const DEMO_USERS = ['tom', 'lien'];
// Shared PoC demo password; may be hardcoded in frontends (backend AGENTS.md, rule 1).
const DEMO_PASSWORD = 'in4matics-must-win';

function errorMessage(e: unknown) {
  if (!(e instanceof KbcApiError)) return 'Er liep iets mis. Probeer het opnieuw.';
  switch (e.code) {
    case 'invalid_credentials':
      return 'Gebruikersnaam of wachtwoord klopt niet.';
    case 'gate_refused':
      return 'Het wachtwoord van de demo-omgeving klopt niet.';
    case 'not_a_customer':
      return 'Dit account is geen klantaccount. Log in als tom of lien.';
    case 'network_error':
      return 'De KBC-server is niet bereikbaar. Controleer je verbinding.';
  }
  if (e.status === 429) return 'Te veel pogingen. Probeer het over een minuut opnieuw.';
  return 'Inloggen lukt nu niet. Probeer het straks opnieuw.';
}

export default function LoginScreen() {
  const scheme = useColorScheme();
  const framed = usePhoneFramed();
  return (
    <PhoneFrame background={page[scheme === 'dark' ? 'dark' : 'light'].bg}>
      <LoginForm framed={framed} />
    </PhoneFrame>
  );
}

function LoginForm({ framed }: { framed: boolean }) {
  const insets = useSafeAreaInsets();
  const native = Platform.OS !== 'web';
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const passwordRef = useRef<TextInput>(null);

  const fillDemo = (user: string) => {
    setUsername(user);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  const submit = async () => {
    if (busy) return;
    if (!username.trim() || !password) {
      setError('Vul je gebruikersnaam en wachtwoord in.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      // On success the session is stored and the router guard opens "Mijn wereld".
      await login(username.trim().toLowerCase(), password);
    } catch (e) {
      setError(errorMessage(e));
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.screen} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {native && <SystemStatusBar style="dark" />}
      <ScrollView
        contentContainerStyle={[styles.content, { paddingTop: native ? insets.top : 0 }]}
        keyboardShouldPersistTaps="handled">
        <SkyBackground height={framed ? 420 : 420 + (native ? insets.top : 0)} />
        {framed && <StatusBar />}

        <View style={styles.hero}>
          <View style={styles.orb}>
            <KateLogoIcon size={76} />
          </View>
          <Text style={styles.eyebrow}>KBC Mobile</Text>
          <Text role="heading" aria-level={1} style={styles.title}>
            Mijn wereld
          </Text>
          <Text style={styles.lead}>Log in en ontdek wat Kate voor jullie klaarzet.</Text>
        </View>

        <View style={styles.card}>
          <Text nativeID="username-label" style={styles.label}>
            Gebruikersnaam
          </Text>
          <TextInput
            value={username}
            onChangeText={setUsername}
            aria-labelledby="username-label"
            placeholder="bv. tom"
            placeholderTextColor="#9aabc0"
            autoCapitalize="none"
            autoCorrect={false}
            autoComplete="username"
            textContentType="username"
            returnKeyType="next"
            onSubmitEditing={() => passwordRef.current?.focus()}
            style={styles.input}
          />

          <Text nativeID="password-label" style={styles.label}>
            Wachtwoord
          </Text>
          <TextInput
            ref={passwordRef}
            value={password}
            onChangeText={setPassword}
            aria-labelledby="password-label"
            placeholder="••••••••"
            placeholderTextColor="#9aabc0"
            secureTextEntry
            autoCapitalize="none"
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={submit}
            style={styles.input}
          />

          {error && (
            <Text role="alert" style={styles.error}>
              {error}
            </Text>
          )}

          <PillButton
            label={busy ? 'Bezig met inloggen…' : 'Inloggen'}
            onPress={submit}
            disabled={busy}
            style={styles.submit}
          />
          <PillButton
            label="Demo-login invullen"
            variant="secondary"
            onPress={() => fillDemo(DEMO_USERS[0])}
            disabled={busy}
            accessibilityHint="Vult gebruikersnaam tom en het demowachtwoord in"
            style={styles.fill}
          />

          <View style={styles.demo}>
            <Text style={styles.demoLabel}>Demo-klanten</Text>
            {DEMO_USERS.map((user) => (
              <Pressable
                key={user}
                role="button"
                aria-label={`Vul de demo-login van ${user} in`}
                onPress={() => fillDemo(user)}>
                <Text style={styles.demoChip}>{user}</Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Text style={styles.note}>
          Kate gebruikt alleen signalen waarvoor je toestemming gaf via &apos;Op jouw maat&apos;.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: world.ground },
  content: { flexGrow: 1, paddingBottom: 24 },
  hero: { alignItems: 'center', paddingTop: 36, paddingHorizontal: 24, gap: 4 },
  orb: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 6px 0 rgba(12,60,120,.10), 0 16px 30px -12px rgba(12,60,120,.35)',
    marginBottom: 14,
  },
  eyebrow: {
    fontFamily: font.body700,
    fontSize: 12,
    color: world.greeting,
    letterSpacing: 0.72,
    textTransform: 'uppercase',
  },
  title: {
    fontFamily: font.display700,
    fontSize: 34,
    lineHeight: 40,
    letterSpacing: -0.34,
    color: world.title,
  },
  lead: {
    fontFamily: font.body600,
    fontSize: 15,
    lineHeight: 21,
    color: world.greeting,
    textAlign: 'center',
    maxWidth: 280,
  },
  card: {
    marginTop: 28,
    marginHorizontal: 16,
    backgroundColor: world.card,
    borderRadius: 22,
    padding: 18,
    boxShadow: shadow.card,
  },
  label: { fontFamily: font.body800, fontSize: 12, color: world.soft, marginBottom: 6, marginTop: 4 },
  input: {
    fontFamily: font.body700,
    fontSize: 16,
    color: world.ink,
    backgroundColor: '#f5f9fd',
    borderWidth: 1.5,
    borderColor: world.line,
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    marginBottom: 12,
  },
  error: { fontFamily: font.body700, fontSize: 13, lineHeight: 18, color: '#b42318', marginBottom: 10 },
  submit: { paddingVertical: 12, marginTop: 4 },
  fill: { paddingVertical: 11, marginTop: 10 },
  demo: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 14 },
  demoLabel: { fontFamily: font.body700, fontSize: 11.5, color: world.soft },
  demoChip: {
    fontFamily: font.body800,
    fontSize: 11.5,
    color: world.blue,
    backgroundColor: '#e6f0fb',
    borderRadius: 999,
    paddingVertical: 2,
    paddingHorizontal: 10,
    overflow: 'hidden',
  },
  note: {
    fontFamily: font.body600,
    fontSize: 12,
    lineHeight: 17,
    color: world.soft,
    textAlign: 'center',
    marginTop: 18,
    paddingHorizontal: 32,
  },
});
