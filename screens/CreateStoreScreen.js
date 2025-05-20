import { collection, addDoc } from 'firebase/firestore';
import { db } from '../services/firebaseConfig';
import { useAuth } from '../context/AuthContext';
import { ImageUpload } from '../components/ImageUpload';

import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, Alert, ScrollView, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

export default function CreateStoreScreen() {
  const { user } = useAuth();
  const navigation = useNavigation();
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');
  const [logoUrl, setLogoUrl] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      navigation.replace('Sign In');
    }
  }, [user, navigation]);

  const handleCreateStore = async () => {
    if (!storeName || !description || !contact) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const docRef = await addDoc(collection(db, 'stores'), {
        storeName,
        description,
        contact,
        logoUrl,
        createdAt: new Date(),
        userId: user.uid,
      });
      console.log('✅ Store saved with ID:', docRef.id);
      Alert.alert('Success', `🎉 Store "${storeName}" created!`);
      navigation.goBack();
    } catch (error) {
      console.error('🔥 Error saving store:', error.message);
      Alert.alert('Error', 'Failed to create store. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null; // Will be redirected by useEffect
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>Create Your Store</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.logoContainer}>
          <ImageUpload
            onImageSelected={setLogoUrl}
            size={120}
            shape="circle"
            label="Store Logo"
            uploadType="storeLogo"
          />
        </View>

        <TextInput
          placeholder="Store Name"
          style={styles.input}
          value={storeName}
          onChangeText={setStoreName}
        />

        <TextInput
          placeholder="Description"
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <TextInput
          placeholder="Contact Info (email or phone)"
          style={styles.input}
          value={contact}
          onChangeText={setContact}
          keyboardType="email-address"
        />

        <TouchableOpacity 
          style={[styles.createButton, loading && styles.createButtonDisabled]}
          onPress={handleCreateStore}
          disabled={loading}
        >
          <Text style={styles.createButtonText}>
            {loading ? 'Creating...' : 'Create Store'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 60,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  content: {
    padding: 20,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    fontSize: 16,
    backgroundColor: '#f8f9fa',
  },
  textArea: {
    height: 120,
    textAlignVertical: 'top',
  },
  createButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 8,
  },
  createButtonDisabled: {
    opacity: 0.7,
  },
  createButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});
