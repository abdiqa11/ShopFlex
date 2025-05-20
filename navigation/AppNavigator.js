import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';

// Import screens
import LandingScreen from '../screens/LandingScreen';
import ProductListScreen from '../screens/ProductListScreen';
import CartScreen from '../screens/CartScreen';
import SellerDashboardScreen from '../screens/SellerDashboardScreen';
import AddProductScreen from '../screens/AddProductScreen';
import EditProductScreen from '../screens/EditProductScreen';
import SignInScreen from '../screens/SignInScreen';
import SignUpScreen from '../screens/SignUpScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Customer Stack
const CustomerStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerShadowVisible: false,
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen
      name="Landing"
      component={LandingScreen}
      options={{
        headerShown: false,
      }}
    />
    <Stack.Screen
      name="Product List"
      component={ProductListScreen}
      options={({ route }) => ({
        title: route.params.store.name,
      })}
    />
    <Stack.Screen
      name="Cart"
      component={CartScreen}
      options={{
        title: 'Shopping Cart',
      }}
    />
  </Stack.Navigator>
);

// Seller Stack
const SellerStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerShadowVisible: false,
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen
      name="Seller Dashboard"
      component={SellerDashboardScreen}
      options={{
        title: 'My Stores',
      }}
    />
    <Stack.Screen
      name="Add Product"
      component={AddProductScreen}
      options={{
        title: 'Add New Product',
      }}
    />
    <Stack.Screen
      name="Edit Product"
      component={EditProductScreen}
      options={{
        title: 'Edit Product',
      }}
    />
  </Stack.Navigator>
);

// Auth Stack
const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerStyle: {
        backgroundColor: '#fff',
      },
      headerShadowVisible: false,
      headerBackTitleVisible: false,
    }}
  >
    <Stack.Screen
      name="Sign In"
      component={SignInScreen}
      options={{
        title: 'Sign In',
      }}
    />
    <Stack.Screen
      name="Sign Up"
      component={SignUpScreen}
      options={{
        title: 'Create Account',
      }}
    />
  </Stack.Navigator>
);

// Main Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        {/* Default to Landing Screen */}
        <Stack.Screen name="Main" component={CustomerStack} />
        
        {/* Auth Stack */}
        <Stack.Screen name="Auth" component={AuthStack} />
        
        {/* Seller Stack */}
        <Stack.Screen name="Seller" component={SellerStack} />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 