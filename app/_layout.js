// app/(tabs)/_layout.js
import React from 'react';
import { Stack } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function RootLayout() {
    return (
        <>
            <Stack>
                <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
                <Stack.Screen name="signin" options={{ title: 'Sign In' }} />
                <Stack.Screen name="signup" options={{ title: 'Sign Up' }} />
                <Stack.Screen name="create-store" options={{ title: 'Create Store' }} />
                <Stack.Screen name="store-detail" options={{ title: 'Store Details' }} />
                <Stack.Screen name="product-detail" options={{ title: 'Product Details' }} />
                <Stack.Screen name="update-product" options={{ title: 'Update Product' }} />
                <Stack.Screen name="add-product" options={{ title: 'Add Product' }} />
            </Stack>
            <Toast />
        </>
    );
}
