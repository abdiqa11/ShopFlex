import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, Image, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function ProductDetail() {
    const { id, name, price, description, imageUrl } = useLocalSearchParams();
    const [loading, setLoading] = useState(false);

    const handleDelete = async () => {
        setLoading(true);
        try {
            await deleteDoc(doc(db, 'products', id));
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Product deleted successfully'
            });
            router.back();
        } catch (error) {
            console.error('Error deleting product:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete product'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleUpdate = () => {
        router.push({
            pathname: '/update-product',
            params: { id, name, price, description, imageUrl }
        });
    };

    return (
        <ScrollView style={styles.container}>
            <View style={styles.imageContainer}>
                {imageUrl ? (
                    <Image source={{ uri: imageUrl }} style={styles.image} />
                ) : (
                    <View style={styles.placeholder}>
                        <Ionicons name="image" size={50} color="#666" />
                    </View>
                )}
            </View>
            
            <View style={styles.details}>
                <Text style={styles.name}>{name}</Text>
                <Text style={styles.price}>${price}</Text>
                <Text style={styles.description}>{description}</Text>
            </View>

            <View style={styles.actions}>
                <Pressable
                    style={[styles.button, styles.updateButton]}
                    onPress={handleUpdate}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Update Product</Text>
                </Pressable>

                <Pressable
                    style={[styles.button, styles.deleteButton]}
                    onPress={handleDelete}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>Delete Product</Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    imageContainer: {
        width: '100%',
        height: 300,
        backgroundColor: '#f5f5f5',
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    placeholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    details: {
        padding: 20,
    },
    name: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    price: {
        fontSize: 20,
        color: '#007AFF',
        marginBottom: 16,
    },
    description: {
        fontSize: 16,
        color: '#666',
        lineHeight: 24,
    },
    actions: {
        padding: 20,
        gap: 12,
    },
    button: {
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
    },
    updateButton: {
        backgroundColor: '#007AFF',
    },
    deleteButton: {
        backgroundColor: '#FF3B30',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 