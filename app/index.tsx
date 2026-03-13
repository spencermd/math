import { Redirect } from 'expo-router';
import { useAuthStore } from '@/store/authStore';

export default function Index() {
  const apiKey = useAuthStore(s => s.apiKey);
  return <Redirect href={apiKey ? '/realms' : '/auth'} />;
}
