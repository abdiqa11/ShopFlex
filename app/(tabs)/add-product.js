import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet, ScrollView, Alert, TouchableOpacity, Image, Modal } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';
import { db, auth } from '../../services/firebaseConfig';
import { ImageUpload } from '../../components/ImageUpload';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';

export default function AddProduct() {
    const { storeId } = useLocalSearchParams();
    const [name, setName] = useState('');
    const [price, setPrice] = useState('');
    const [description, setDescription] = useState('');
    const [imageUrl, setImageUrl] = useState('');
    const [loading, setLoading] = useState(false);
    const [stores, setStores] = useState([]);
    const [selectedStoreId, setSelectedStoreId] = useState(storeId || '');
    const [selectedStoreName, setSelectedStoreName] = useState('');
    const [showImageUpload, setShowImageUpload] = useState(false);
    const [showStoreModal, setShowStoreModal] = useState(false);

    // Fetch user's stores on component mount
    useEffect(() => {
        const fetchUserStores = async () => {
            try {
                const currentUser = auth.currentUser;
                if (!currentUser) {
                    Toast.show({
                        type: 'error',
                        text1: 'Error',
                        text2: 'You must be logged in to add products'
                    });
                    router.push('/signin');
                    return;
                }

                // Fetch stores owned by the current user
                const storesQuery = query(
                    collection(db, 'stores'),
                    where('ownerId', '==', currentUser.uid)
                );
                const storesSnapshot = await getDocs(storesQuery);
                const storesList = storesSnapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                
                setStores(storesList);
                
                // If storeId wasn't passed and user has stores, select the first one
                if (!storeId && storesList.length > 0) {
                    setSelectedStoreId(storesList[0].id);
                    setSelectedStoreName(storesList[0].name);
                } else if (storeId && storesList.length > 0) {
                    const selectedStore = storesList.find(store => store.id === storeId);
                    if (selectedStore) {
                        setSelectedStoreName(selectedStore.name);
                    }
                }
                
                // If user has no stores, prompt to create one
                if (storesList.length === 0) {
                    Alert.alert(
                        "No Stores Found",
                        "You need to create a store before adding products. Would you like to create a store now?",
                        [
                            {
                                text: "Cancel",
                                style: "cancel",
                                onPress: () => router.back()
                            },
                            {
                                text: "Create Store",
                                onPress: () => router.push('/create-store')
                            }
                        ]
                    );
                }
            } catch (error) {
                console.error('Error fetching stores:', error);
            }
        };

        fetchUserStores();
    }, [storeId]);

    const handleAddProduct = async () => {
        if (!name || !price || !description) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields'
            });
            return;
        }

        if (!selectedStoreId) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select or create a store first'
            });
            return;
        }

        // Check if user is logged in
        const currentUser = auth.currentUser;
        if (!currentUser) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'You must be logged in to add products'
            });
            router.push('/signin');
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
                storeId: selectedStoreId,
                ownerId: currentUser.uid // Always include the owner ID
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

    const handleImageSelected = (url) => {
        setImageUrl(url);
        setShowImageUpload(false);
    };

    const toggleImageUpload = () => {
        setShowImageUpload(!showImageUpload);
    };

    const selectStore = (store) => {
        setSelectedStoreId(store.id);
        setSelectedStoreName(store.name);
        setShowStoreModal(false);
    };

    return (
        <ScrollView style={styles.container}>
            <Text style={styles.title}>Add New Product</Text>
            
            <View style={styles.imageSection}>
                <View style={styles.imageContainer}>
                    {imageUrl ? (
                        <Image source={{ uri: imageUrl }} style={styles.image} />
                    ) : (
                        <View style={styles.imagePlaceholder}>
                            <Ionicons name="image-outline" size={50} color="#666" />
                            <Text style={styles.placeholderText}>No image</Text>
                        </View>
                    )}
                </View>
                
                {showImageUpload ? (
                    <View style={styles.uploadContainer}>
                        <ImageUpload onImageSelected={handleImageSelected} size={100} />
                        <Text style={styles.uploadText}>Tap to select an image</Text>
                    </View>
                ) : (
                    <TouchableOpacity 
                        style={styles.changeImageButton} 
                        onPress={toggleImageUpload}
                    >
                        <Ionicons name="camera" size={16} color="#fff" />
                        <Text style={styles.changeImageText}>
                            {imageUrl ? 'Change Image' : 'Add Image'}
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            <View style={styles.form}>
                {stores.length > 0 && (
                    <View style={styles.storeSelector}>
                        <Text style={styles.label}>Store:</Text>
                        <Pressable 
                            style={styles.selectorButton}
                            onPress={() => setShowStoreModal(true)}
                        >
                            <Text style={styles.selectorText}>
                                {selectedStoreName || 'Select a Store'}
                            </Text>
                            <Ionicons name="chevron-down" size={20} color="#666" />
                        </Pressable>
                    </View>
                )}
                
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

            {/* Store Selection Modal */}
            <Modal
                visible={showStoreModal}
                transparent
                animationType="slide"
                onRequestClose={() => setShowStoreModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <Text style={styles.modalTitle}>Select a Store</Text>
                        {stores.map(store => (
                            <Pressable
                                key={store.id}
                                style={[
                                    styles.storeOption,
                                    store.id === selectedStoreId && styles.storeOptionSelected
                                ]}
                                onPress={() => selectStore(store)}
                            >
                                <Text 
                                    style={[
                                        styles.storeOptionText,
                                        store.id === selectedStoreId && styles.storeOptionTextSelected
                                    ]}
                                >
                                    {store.name}
                                </Text>
                            </Pressable>
                        ))}
                        <Pressable
                            style={styles.closeButton}
                            onPress={() => setShowStoreModal(false)}
                        >
                            <Text style={styles.closeButtonText}>Cancel</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        marginBottom: 10,
        textAlign: 'center',
    },
    imageSection: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    imageContainer: {
        width: '80%',
        height: 200,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
        overflow: 'hidden',
        marginBottom: 10,
    },
    image: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    imagePlaceholder: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
    },
    placeholderText: {
        marginTop: 10,
        color: '#666',
    },
    uploadContainer: {
        alignItems: 'center',
        marginTop: 10,
    },
    uploadText: {
        marginTop: 8,
        color: '#666',
        fontSize: 14,
    },
    changeImageButton: {
        flexDirection: 'row',
        backgroundColor: '#007AFF',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 20,
        alignItems: 'center',
    },
    changeImageText: {
        color: '#fff',
        marginLeft: 5,
        fontWeight: '500',
    },
    form: {
        padding: 20,
        gap: 16,
    },
    storeSelector: {
        marginBottom: 10,
    },
    label: {
        fontSize: 16,
        marginBottom: 5,
        color: '#555',
    },
    selectorButton: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 12,
        backgroundColor: '#f9f9f9',
    },
    selectorText: {
        fontSize: 16,
        color: '#333',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        maxHeight: '70%',
    },
    modalTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    storeOption: {
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    storeOptionSelected: {
        backgroundColor: '#e6f2ff',
    },
    storeOptionText: {
        fontSize: 16,
    },
    storeOptionTextSelected: {
        color: '#007AFF',
        fontWeight: '600',
    },
    closeButton: {
        marginTop: 15,
        padding: 12,
        backgroundColor: '#f0f0f0',
        borderRadius: 8,
        alignItems: 'center',
    },
    closeButtonText: {
        fontSize: 16,
        color: '#666',
        fontWeight: '600',
    },
}); 