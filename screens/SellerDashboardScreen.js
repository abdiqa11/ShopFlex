import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';

export default function SellerDashboardScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showStoreModal, setShowStoreModal] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      if (!user) {
        console.log('No authenticated user found, redirecting to landing');
        navigation.reset({
          index: 0,
          routes: [{ name: 'Customer' }],
        });
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch stores only when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const storesQuery = query(
      collection(db, 'stores'),
      where('ownerId', '==', auth.currentUser.uid)
    );

    const unsubscribeStores = onSnapshot(storesQuery, (snapshot) => {
      const storesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStores(storesList);
      setLoading(false);
    });

    return () => unsubscribeStores();
  }, [isAuthenticated]);

  const handleAddStore = () => {
    navigation.navigate('Create Store');
  };

  const handleAddProduct = () => {
    if (stores.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Stores',
        text2: 'Please create a store first'
      });
      return;
    }

    if (stores.length === 1) {
      // If only one store, navigate directly
      navigation.navigate('Product Manager', {
        storeId: stores[0].id,
        storeName: stores[0].storeName
      });
    } else {
      // If multiple stores, show selection modal
      setShowStoreModal(true);
    }
  };

  const handleStoreSelect = (store) => {
    setShowStoreModal(false);
    navigation.navigate('Product Manager', {
      storeId: store.id,
      storeName: store.storeName
    });
  };

  const handleStorePress = (store) => {
    navigation.navigate('Product Manager', {
      storeId: store.id,
      storeName: store.storeName
    });
  };

  const renderStoreItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.storeCard}
      onPress={() => handleStorePress(item)}
    >
      {item.logoUrl ? (
        <Image 
          source={{ uri: item.logoUrl }} 
          style={styles.storeLogo}
        />
      ) : (
        <View style={styles.storeLogoPlaceholder}>
          <Ionicons name="storefront" size={32} color="#666" />
        </View>
      )}
      <View style={styles.storeInfo}>
        <Text style={styles.storeName}>{item.storeName}</Text>
        <Text style={styles.storeCategory}>{item.category}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>
            Welcome, {auth.currentUser?.email}
          </Text>
          <Text style={styles.subtitle}>Manage your stores and products</Text>
        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAddStore}
          >
            <Ionicons name="add-circle" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Add Store</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={handleAddProduct}
          >
            <Ionicons name="cart" size={24} color="#007AFF" />
            <Text style={styles.actionButtonText}>Add Product</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.storesSection}>
          <Text style={styles.sectionTitle}>Your Stores</Text>
          {stores.length === 0 ? (
            <View style={styles.emptyState}>
              <Ionicons name="storefront-outline" size={48} color="#666" />
              <Text style={styles.emptyStateText}>
                You haven't created any stores yet
              </Text>
              <TouchableOpacity 
                style={styles.createStoreButton}
                onPress={handleAddStore}
              >
                <Text style={styles.createStoreButtonText}>Create Your First Store</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <FlatList
              data={stores}
              renderItem={renderStoreItem}
              keyExtractor={item => item.id}
              scrollEnabled={false}
            />
          )}
        </View>
      </ScrollView>

      {/* Store Selection Modal */}
      <Modal
        visible={showStoreModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowStoreModal(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowStoreModal(false)}
        >
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Store</Text>
              <TouchableOpacity
                onPress={() => setShowStoreModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#000" />
              </TouchableOpacity>
            </View>
            
            {stores.map((store) => (
              <TouchableOpacity
                key={store.id}
                style={styles.storeOption}
                onPress={() => handleStoreSelect(store)}
              >
                {store.logoUrl && (
                  <Image 
                    source={{ uri: store.logoUrl }} 
                    style={styles.storeOptionLogo}
                  />
                )}
                <Text style={styles.storeOptionName}>{store.storeName}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  actionsContainer: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginHorizontal: 8,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
  },
  actionButtonText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  storesSection: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  storeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeLogo: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  storeLogoPlaceholder: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeInfo: {
    flex: 1,
    marginLeft: 12,
  },
  storeName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  storeCategory: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  emptyState: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginTop: 16,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
    marginTop: 16,
    marginBottom: 24,
    textAlign: 'center',
  },
  createStoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createStoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  closeButton: {
    padding: 4,
  },
  storeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  storeOptionLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storeOptionName: {
    fontSize: 16,
    color: '#333',
  },
}); 