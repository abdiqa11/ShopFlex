import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Pressable, StyleSheet, Image, ActivityIndicator } from 'react-native';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../../services/firebaseConfig';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function ProductList() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    console.error('User not logged in');
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'You must be logged in to view products'
                    });
                    router.push('/signin');
                    return;
                }

                // Query products where ownerId matches the current user
                const productsQuery = query(
                    collection(db, 'products'),
                    where('ownerId', '==', currentUser.uid)
                );
                
                const querySnapshot = await getDocs(productsQuery);
                const productData = querySnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data(),
                }));
                setProducts(productData);
            } catch (error) {
                console.error('Error fetching products:', error);
                Toast.show({
                    type: 'error',
                    text1: 'Error',
                    text2: 'Failed to load products'
                });
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, []);

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#007AFF" />
                <Text style={styles.loadingText}>Loading products...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {products.length === 0 ? (
                <View style={styles.emptyContainer}>
                    <Ionicons name="basket-outline" size={60} color="#ccc" />
                    <Text style={styles.emptyText}>No products found</Text>
                    <Pressable 
                        style={styles.addButton}
                        onPress={() => router.push('/add-product')}
                    >
                        <Text style={styles.addButtonText}>Add Product</Text>
                    </Pressable>
                </View>
            ) : (
                <FlatList
                    data={products}
                    keyExtractor={(item) => item.id}
                    renderItem={({ item }) => (
                        <Pressable
                            style={styles.item}
                            onPress={() => router.push({
                                pathname: '/product-detail',
                                params: {
                                    id: item.id,
                                    name: item.name,
                                    price: item.price,
                                    description: item.description,
                                    imageUrl: item.imageUrl,
                                    storeId: item.storeId,
                                    ownerId: item.ownerId
                                }
                            })}
                        >
                            <View style={styles.imageContainer}>
                                {item.imageUrl ? (
                                    <Image source={{ uri: item.imageUrl }} style={styles.image} />
                                ) : (
                                    <View style={styles.imagePlaceholder}>
                                        <Ionicons name="image" size={40} color="#666" />
                                    </View>
                                )}
                            </View>
                            <View style={styles.details}>
                                <Text style={styles.name}>{item.name}</Text>
                                <Text style={styles.price}>${parseFloat(item.price).toFixed(2)}</Text>
                            </View>
                        </Pressable>
                    )}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        color: '#666',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    emptyText: {
        fontSize: 16,
        color: '#666',
        marginTop: 10,
        marginBottom: 20,
    },
    addButton: {
        backgroundColor: '#007AFF',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    addButtonText: {
        color: 'white',
        fontWeight: '600',
    },
    item: {
        flexDirection: 'row',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    imageContainer: {
        width: 80,
        height: 80,
        borderRadius: 8,
        overflow: 'hidden',
        backgroundColor: '#f0f0f0',
    },
    image: {
        width: '100%',
        height: '100%',
    },
    imagePlaceholder: {
        width: '100%',
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    details: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    name: {
        fontSize: 16,
        fontWeight: '600',
        marginBottom: 4,
    },
    price: {
        fontSize: 14,
        color: '#007AFF',
    },
});
