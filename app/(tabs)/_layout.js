import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import { router } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs 
            screenOptions={{ 
                tabBarActiveTintColor: '#007AFF',
                headerRight: () => (
                    <TouchableOpacity
                        onPress={() => router.push('/profile')}
                        style={{ marginRight: 15 }}
                    >
                        <Ionicons name="person-circle" size={28} color="#007AFF" />
                    </TouchableOpacity>
                ),
            }}
        >
            <Tabs.Screen 
                name="index" 
                options={{ 
                    title: 'Marketplace',
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="storefront" size={size} color={color} />
                    ),
                }} 
            />
            <Tabs.Screen 
                name="products/index" 
                options={{ 
                    title: 'My Products',
                    headerShown: true,
                    headerTitle: "My Products",
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="grid" size={size} color={color} />
                    ),
                }} 
            />
            <Tabs.Screen 
                name="add-product/index" 
                options={{ 
                    title: 'Add Product',
                    headerShown: true,
                    tabBarIcon: ({ color, size }) => (
                        <Ionicons name="add-circle" size={size} color={color} />
                    ),
                }} 
            />
            
            {/* Remove the profile tab since we're moving it to the header */}
            <Tabs.Screen 
                name="profile/index" 
                options={{ 
                    href: null, // This hides the tab
                }}
            />
        </Tabs>
    );
}
