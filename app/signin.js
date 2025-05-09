import React, { useState } from 'react';
import { View, Text, TextInput, Pressable, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../services/firebaseConfig';
import Toast from 'react-native-toast-message';

export default function SignIn() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSignIn = async () => {
        if (!email || !password) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please fill in all fields'
            });
            return;
        }

        setLoading(true);
        try {
            await signInWithEmailAndPassword(auth, email, password);
            router.replace('/(tabs)');
        } catch (error) {
            console.error('Error signing in:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.message || 'Failed to sign in'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleGoToSignUp = () => {
        router.push('/signup');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Sign In</Text>
            
            <View style={styles.form}>
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
                    onPress={handleSignIn}
                    disabled={loading}
                >
                    <Text style={styles.buttonText}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </Text>
                </Pressable>
                
                <Pressable 
                    style={styles.textButton}
                    onPress={handleGoToSignUp}
                >
                    <Text style={styles.textButtonText}>
                        Don't have an account? <Text style={styles.textButtonHighlight}>Sign Up</Text>
                    </Text>
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
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
    textButton: {
        padding: 10,
        alignItems: 'center',
    },
    textButtonText: {
        fontSize: 14,
        color: '#333',
    },
    textButtonHighlight: {
        color: '#007AFF',
        fontWeight: '600',
    }
});
