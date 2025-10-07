import { useAuth } from '@/hooks/useAuth';
import { Redirect } from 'expo-router';

export default function Index() {
  const { user, loading } = useAuth();
  if (loading) return null;
 
  return <Redirect href={user ? '/(tabs)/home' : '/welcome'} />;

}
