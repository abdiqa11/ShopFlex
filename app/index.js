import { Redirect } from 'expo-router';

export default function IndexRedirect() {
  // Use the Redirect component which is designed for initial routing
  // This won't cause "navigate before mounting" errors
  return <Redirect href="/(public)" />;
}
