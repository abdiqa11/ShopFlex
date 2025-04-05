import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

export default function CreateStoreScreen() {
  // Local state to hold user input
  const [storeName, setStoreName] = useState('');
  const [description, setDescription] = useState('');
  const [contact, setContact] = useState('');

  // Placeholder for what happens when user presses "Create"
  const handleCreateStore = () => {
    console.log('Store created:', {
      storeName,
      description,
      contact,
    });
    alert(`🎉 Store "${storeName}" created!`);
  };

  return (
      <View style={styles.container}>
        <Text style={styles.title}>Create Your Store</Text>

        <TextInput
            placeholder="Store Name"
            style={styles.input}
            value={storeName}
            onChangeText={setStoreName}
        />

        <TextInput
            placeholder="Description"
            style={styles.input}
            value={description}
            onChangeText={setDescription}
            multiline
        />

        <TextInput
            placeholder="Contact Info (email or phone)"
            style={styles.input}
            value={contact}
            onChangeText={setContact}
            keyboardType="email-address"
        />

        <Button title="Create Store" onPress={handleCreateStore} />
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 80,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
});
