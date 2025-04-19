// app/(tabs)/_layout.js
import React from 'react';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Redirect } from 'expo-router';

export default function RootLayout() {
  return (
    <>
      <Stack />
      <Toast />
    </>
  );
}
