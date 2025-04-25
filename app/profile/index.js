import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image, Pressable, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import { signOut } from 'firebase/auth';
import Toast from 'react-native-toast-message';

export default function ProfileScreen() {
    const [user, setUser] = useState(null);
    const [stores, setStores] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [displayName, setDisplayName] = useState('');

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                // Check if user is logged in
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    console.error('User not logged in');
                    setLoading(false);
                    router.replace('/signin');
                    return;
                }

                // Determine the best display name to use
                let bestName = '';
                
                // Option 1: Use Firebase displayName if available
                if (currentUser.displayName) {
                    bestName = currentUser.displayName;
                } else {
                    // Option 2: Use email prefix as fallback
                    const email = currentUser.email || '';
                    bestName = email.split('@')[0];
                }
                
                const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
                if (userDoc.exists()) {
                    setUser(userDoc.data());
                    // Update bestName if we have a displayName in Firestore
                    if (userDoc.data().displayName) {
                        bestName = userDoc.data().displayName;
                    }
                }

                // Fetch user's stores
                const storesQuery = query(
                    collection(db, 'stores'),
                    where('ownerId', '==', currentUser.uid)
                );
                const storesSnapshot = await getDocs(storesQuery);
                const storesData = storesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                setStores(storesData);
                
                // Fetch user's products count
                const productsQuery = query(
                    collection(db, 'products'),
                    where('userId', '==', currentUser.uid)
                );
                const productsSnapshot = await getDocs(productsQuery);
                setProducts(productsSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })));
                
                // Option 3: If no displayName but user has a store, use store name
                if (!currentUser.displayName && storesData.length > 0) {
                    // Only override the email prefix if we're using it (no displayName found yet)
                    if (bestName === currentUser.email.split('@')[0]) {
                        bestName = storesData[0].name;
                    }
                }
                
                setDisplayName(bestName);
            } catch (error) {
                console.error('Error fetching user data:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load user data'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchUserData();
    }, []);

    const handleSignOut = async () => {
        try {
            await signOut(auth);
            router.replace('/(public)/');
        } catch (error) {
            console.error('Error signing out:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to sign out'
            });
        }
    };

    const navigateBack = () => {
        router.back();
    };

    if (loading) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading profile...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity 
                    style={styles.backButton} 
                    onPress={navigateBack}
                >
                    <Ionicons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>Your Profile</Text>
                <View style={{ width: 24 }} />
            </View>
            
            <ScrollView 
                style={styles.scrollContainer} 
                contentContainerStyle={styles.contentContainer}
            >
                <View style={styles.profileCard}>
                    <View style={styles.profileImageContainer}>
                        {user?.photoURL ? (
                            <Image source={{ uri: user.photoURL }} style={styles.profileImage} />
                        ) : (
                            <View style={styles.profileImagePlaceholder}>
                                <Ionicons name="person" size={50} color="#fff" />
                            </View>
                        )}
                    </View>
                    <Text style={styles.name}>{displayName || 'User'}</Text>
                    <Text style={styles.email}>{auth.currentUser?.email}</Text>
                </View>

                <View style={styles.statsContainer}>
                    <View style={styles.statCard}>
                        <Ionicons name="storefront" size={24} color="#007AFF" />
                        <Text style={styles.statNumber}>{stores.length}</Text>
                        <Text style={styles.statLabel}>Stores</Text>
                    </View>
                    <View style={styles.statCard}>
                        <Ionicons name="cube" size={24} color="#007AFF" />
                        <Text style={styles.statNumber}>{products.length}</Text>
                        <Text style={styles.statLabel}>Products</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Account Settings</Text>
                    
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => router.push('/update-profile')}
                    >
                        <Ionicons name="person-circle-outline" size={24} color="#333" />
                        <Text style={styles.menuItemText}>Update Profile</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => router.push('/(tabs)')}
                    >
                        <Ionicons name="grid-outline" size={24} color="#333" />
                        <Text style={styles.menuItemText}>Dashboard</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                    
                    <TouchableOpacity 
                        style={styles.menuItem}
                        onPress={() => router.push('/create-store')}
                    >
                        <Ionicons name="add-circle-outline" size={24} color="#333" />
                        <Text style={styles.menuItemText}>Create New Store</Text>
                        <Ionicons name="chevron-forward" size={20} color="#ccc" />
                    </TouchableOpacity>
                </View>
                
                <TouchableOpacity 
                    style={styles.signOutButton}
                    onPress={handleSignOut}
                >
                    <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
                    <Text style={styles.signOutText}>Sign Out</Text>
                </TouchableOpacity>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f9fa',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 16,
        fontSize: 16,
        color: '#666',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eaeaea',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '600',
    },
    scrollContainer: {
        flex: 1,
    },
    contentContainer: {
        padding: 16,
    },
    profileCard: {
        alignItems: 'center',
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    profileImageContainer: {
        width: 100,
        height: 100,
        borderRadius: 50,
        overflow: 'hidden',
        marginBottom: 16,
        borderWidth: 3,
        borderColor: '#eaeaea',
    },
    profileImage: {
        width: '100%',
        height: '100%',
    },
    profileImagePlaceholder: {
        width: '100%',
        height: '100%',
        backgroundColor: '#007AFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    email: {
        fontSize: 16,
        color: '#666',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 16,
    },
    statCard: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginHorizontal: 5,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statNumber: {
        fontSize: 24,
        fontWeight: 'bold',
        marginVertical: 8,
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
    },
    section: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 16,
        marginBottom: 16,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    menuItemText: {
        flex: 1,
        marginLeft: 16,
        fontSize: 16,
    },
    signOutButton: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        padding: 16,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 40,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    signOutText: {
        color: '#FF3B30',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
}); 