import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function TabLayout() {
    return (
        <Tabs screenOptions={{ tabBarActiveTintColor: '#007AFF' }}>
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Home',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="home" size={size} color={color} />
                    ),
                }} 
            />
            <Tabs.Screen 
                name="products/index" 
                options={{ 
                    title: 'Products',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid" size={size} color={color} />
                    ),
                }} 
            />
            <Tabs.Screen 
                name="profile/index" 
                options={{ 
                    title: 'Account',
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="person" size={size} color={color} />
                    ),
                }} 
            />
        </Tabs>
    );
}
