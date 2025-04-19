import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebaseConfig';
import Toast from 'react-native-toast-message';

export default function SignUp() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignUp = async () => {
        if (!name || !email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields'
            });
            return;
        }

        setLoading(true);
        try {
            // Create user with email and password
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;

            // Update profile with display name
            await updateProfile(user, { displayName: name });

            // Create user document in Firestore
            await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                displayName: name,
                email: email,
                createdAt: new Date().toISOString()
            });

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Account created successfully'
            });

            // Navigate to main app
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error signing up:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to create account'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoToSignIn = () => {
        router.push('/signin');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Create Account</Text>
            
            <View style={styles.form}>
                <TextInput
                    style={styles.input}
                    placeholder="Full Name"
                    value={name}
                    onChangeText={setName}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    value={email}
                    onChangeText={setEmail}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />

                <Pressable
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleSignUp}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </Text>
                </Pressable>
                
                <Pressable 
                    style={styles.textButton}
                    onPress={handleGoToSignIn}
                >
                    <Text style={styles.textButtonText}>
                        Already have an account? <Text style={styles.textButtonHighlight}>Sign In</Text>
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        backgroundColor: '#fff'
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
        marginTop: 40
    },
    form: {
        width: '100%'
    },
    input: {
        height: 50,
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        marginBottom: 15,
        paddingHorizontal: 10,
        backgroundColor: '#f9f9f9'
    },
    button: {
        backgroundColor: '#4a80f5',
        height: 50,
        borderRadius: 8,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10
    },
    buttonDisabled: {
        opacity: 0.7
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600'
    },
    textButton: {
        marginTop: 20,
        alignItems: 'center'
    },
    textButtonText: {
        color: '#333',
        fontSize: 14
    },
    textButtonHighlight: {
        color: '#4a80f5',
        fontWeight: '600'
    }
}); 