import { Stack } from 'expo-router';
import { View, StyleSheet } from 'react-native';

export default function PublicLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          title: "ShopFlex",
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTintColor: '#007AFF',
        }}
      />
      <Stack.Screen
        name="store/[id]"
        options={{
          title: "Store Details",
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTintColor: '#007AFF',
          presentation: 'card',
        }}
      />
      <Stack.Screen
        name="cart"
        options={{
          title: "Shopping Cart",
          headerTitleStyle: {
            fontWeight: 'bold',
          },
          headerTintColor: '#007AFF',
          presentation: 'card',
          headerShown: false,
        }}
      />
    </Stack>
  );
} 