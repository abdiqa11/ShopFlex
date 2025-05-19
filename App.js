// App.js
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { AuthProvider } from './context/AuthContext';

import WelcomeScreen from './screens/WelcomeScreen';
import SignInScreen from './screens/SignInScreen';
import StoreListScreen from './screens/StoreListScreen';
import CreateStoreScreen from './screens/CreateStoreScreen';

const Stack = createStackNavigator();

export default function App() {
  return (
    <AuthProvider>
      <NavigationContainer>
        <Stack.Navigator initialRouteName="Welcome">
          <Stack.Screen name="Welcome" component={WelcomeScreen} />
          <Stack.Screen name="Sign In" component={SignInScreen} />
          <Stack.Screen name="Store List" component={StoreListScreen} />
          <Stack.Screen name="Create Store" component={CreateStoreScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    </AuthProvider>
  );
}
