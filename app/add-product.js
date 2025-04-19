import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView } from 'react-native';
import { router } from 'expo-router';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../services/firebaseConfig';
import { ImageUpload } from '../components/ImageUpload';
import Toast from 'react-native-toast-message';

export default function AddProduct() {
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);

    const handleAddProduct = async () => {
        if (!name || !price || !description) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields'
            });
            return;
        }

        setLoading(true);
        try {
            await addDoc(collection(db, 'products'), {
                name,
                price: parseFloat(price),
                description,
                imageUrl,
                createdAt: new Date(),
                userId: auth.currentUser?.uid
            });
            
            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Product added successfully'
            });
            
            // Reset form
            setName('');
            setPrice('');
            setDescription('');
            setImageUrl('');
            
            // Navigate to products list
            router.push('/products');
        } catch (error) {
            console.error('Error adding product:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to add product'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Add New Product</Text>
            
            <View style={styles.imageUploadContainer}>
                <ImageUpload onImageSelected={setImageUrl} />
                <Text style={styles.imageUploadText}>Tap to upload image</Text>
            </View>

            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Product Name"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Price"
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="numeric"
                />
                <TextInput
                    style={[styles.input, styles.descriptionInput]}
                    placeholder="Description"
                    value={description}
                    onChangeText={setDescription}
                    multiline
                    numberOfLines={4}
                />

                <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleAddProduct}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Adding...' : 'Add Product'}
                    </Text>
                </Pressable>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    imageUploadContainer: {
        alignItems: 'center',
        marginBottom: 20,
    },
    imageUploadText: {
        marginTop: 8,
        color: '#666',
    },
    form: {
        gap: 16,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        fontSize: 16,
    },
    descriptionInput: {
        height: 100,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#007AFF',
        padding: 16,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
}); 