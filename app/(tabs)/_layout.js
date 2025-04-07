import { Tabs } from 'expo-router';

export default function TabLayout() {
    return (
        <Tabs>
            <Tabs.Screen name="index" options={{ title: 'Home' }} />
            <Tabs.Screen name="create-store" options={{ title: 'Create Store' }} />
            <Tabs.Screen name="signin" options={{ title: 'Sign In' }} />
        </Tabs>
    );
}
