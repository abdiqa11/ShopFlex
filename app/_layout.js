// app/(tabs)/_layout.js
import React from 'react';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { CartProvider } from '../context/CartContext';

export default function RootLayout() {
  return (
    <CartProvider>
      <>
        <Stack 
          screenOptions={{
            headerShown: false,
          }}
          // This hides folder names from URLs
          initialRouteName="index"
        >
          <Stack.Screen 
            name="(public)" 
            options={{ 
              headerShown: false,
              // This prevents the segment name from appearing in the URL
              href: null
            }} 
          />
          <Stack.Screen 
            name="(tabs)" 
            options={{ 
              headerShown: false,
              // This prevents the segment name from appearing in the URL
              href: null
            }} 
          />
        </Stack>
        <Toast />
      </>
    </CartProvider>
  );
}
