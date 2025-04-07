import { View, Text, StyleSheet, Button } from 'react-native';
import { useRouter } from 'expo-router';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Welcome to ShopFlex</Text>
        <Text style={styles.subtitle}>Your mobile storefront starts here.</Text>

        <View style={styles.buttonWrapper}>
          <Button title="Create Your Store" onPress={() => router.push('/create-store')} />
        </View>

        <View style={styles.buttonWrapper}>
          <Button title="View All Shops" onPress={() => router.push('/stores')} />
        </View>

          <View style={styles.buttonWrapper}>
              <Button title="Sign In" onPress={() => router.push('/signin')} />
          </View>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 20,
    textAlign: 'center',
  },
  buttonWrapper: {
    width: '100%',
    marginBottom: 12,
  },
});
