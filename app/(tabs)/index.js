import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { auth, db } from '../../services/firebaseConfig';
import { collection, query, where, getDocs, limit } from 'firebase/firestore';

export default function HomeScreen() {
    const router = useRouter();
    const [greeting, setGreeting] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadUserData = async () => {
            try {
                // Check if user is logged in
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    setGreeting('Welcome to ShopFlex');
                    setLoading(false);
                    return;
                }

                // Extract email prefix for fallback greeting
                const email = currentUser.email || '';
                const emailPrefix = email.split('@')[0];
                
                // Query Firestore for user's stores
                const storesQuery = query(
                    collection(db, 'stores'),
                    where('ownerId', '==', currentUser.uid),
                    limit(1)
                );
                
                const storesSnapshot = await getDocs(storesQuery);
                
                if (!storesSnapshot.empty) {
                    // User has at least one store
                    const store = storesSnapshot.docs[0].data();
                    setGreeting(`Welcome back to ${store.name}!`);
                } else {
                    // No stores found, use fallback greeting
                    setGreeting(`Hi ${emailPrefix}, welcome back!`);
                }
            } catch (error) {
                console.error('Error loading greeting:', error);
                setGreeting('Welcome to ShopFlex');
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, []);

    const renderActionCard = (title, icon, color, onPress) => (
        <TouchableOpacity style={[styles.card, { borderLeftColor: color }]} onPress={onPress}>
            <View style={[styles.iconContainer, { backgroundColor: color }]}>
                <Ionicons name={icon} size={24} color="#fff" />
            </View>
            <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>{title}</Text>
                <Ionicons name="chevron-forward" size={20} color="#999" />
            </View>
        </TouchableOpacity>
    );

    return (
        <ScrollView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ShopFlex</Text>
                {loading ? (
                    <ActivityIndicator size="small" color="#007AFF" />
                ) : (
                    <Text style={styles.greeting}>{greeting}</Text>
                )}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Products</Text>
                {renderActionCard('View Products', 'grid', '#007AFF', () => router.push('/products'))}
                {renderActionCard('Add Product', 'add-circle', '#4CD964', () => router.push('/add-product'))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Store Management</Text>
                {renderActionCard('My Stores', 'business', '#FF9500', () => router.push('/profile'))}
                {renderActionCard('Create Store', 'add', '#FF2D55', () => router.push('/create-store'))}
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Account</Text>
                {renderActionCard('Profile', 'person', '#5856D6', () => router.push('/profile'))}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        padding: 20,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        marginBottom: 16,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#007AFF',
    },
    greeting: {
        fontSize: 18,
        color: '#333',
        fontWeight: '500',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    section: {
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 12,
        marginLeft: 4,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        marginBottom: 12,
        borderLeftWidth: 4,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    iconContainer: {
        width: 50,
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    cardContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 16,
        paddingHorizontal: 16,
        flex: 1,
    },
    cardTitle: {
        fontSize: 16,
        fontWeight: '500',
    },
});

