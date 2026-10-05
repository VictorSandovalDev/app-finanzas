import { Redirect } from 'expo-router';

import { useJourney } from '@/state/journey';

export default function Index() {
  const { state } = useJourney();
  return <Redirect href={state.onboarded ? '/viaje' : '/bienvenida'} />;
}
