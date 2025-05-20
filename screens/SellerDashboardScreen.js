import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Alert,
  ScrollView
} from 'react-native';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage, auth } from '../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { getCategoryLabel } from '../constants/categories';

export default function SellerDashboardScreen({ navigation }) {
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStore) {
      fetchProducts();
    } else {
      setProducts([]);
    }
  }, [selectedStore]);

  const fetchStores = async () => {
    try {
      const storesQuery = query(
        collection(db, 'stores'),
        where('userId', '==', auth.currentUser.uid)
      );
      
      const storesSnapshot = await getDocs(storesQuery);
      const storesList = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStores(storesList);
      if (storesList.length > 0) {
        setSelectedStore(storesList[0]);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load stores'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!selectedStore) return;

    try {
      const productsQuery = query(
        collection(db, 'products'),
        where('storeId', '==', selectedStore.id)
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching products:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load products'
      });
    }
  };

  const handleDeleteProduct = async (product) => {
    Alert.alert(
      'Delete Product',
      'Are you sure you want to delete this product?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              // Delete product image from storage
              if (product.imageUrl) {
                const imageRef = ref(storage, product.imageUrl);
                await deleteObject(imageRef);
              }

              // Delete product document
              await deleteDoc(doc(db, 'products', product.id));

              // Update local state
              setProducts(prevProducts => 
                prevProducts.filter(p => p.id !== product.id)
              );

              Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Product deleted successfully'
              });
            } catch (error) {
              console.error('Error deleting product:', error);
              Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Failed to delete product'
              });
            }
          }
        }
      ]
    );
  };

  const renderStoreItem = ({ item }) => (
    <TouchableOpacity
      style={[
        styles.storeItem,
        selectedStore?.id === item.id && styles.selectedStoreItem
      ]}
      onPress={() => setSelectedStore(item)}
    >
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/50' }}
        style={styles.storeImage}
      />
      <View style={styles.storeInfo}>
        <Text style={styles.storeName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.storeCategory}>
          {getCategoryLabel(item.category || 'Uncategorized')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderProductItem = ({ item }) => (
    <View style={styles.productCard}>
      <Image
        source={{ uri: item.imageUrl || 'https://via.placeholder.com/100' }}
        style={styles.productImage}
      />
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>
          {item.name}
        </Text>
        <Text style={styles.productPrice}>
          ${item.price.toFixed(2)}
        </Text>
        <Text style={styles.productCategory}>
          {getCategoryLabel(item.category)}
        </Text>
      </View>
      <View style={styles.productActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Edit Product', { product: item })}
        >
          <Ionicons name="pencil" size={20} color="#007AFF" />
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => handleDeleteProduct(item)}
        >
          <Ionicons name="trash" size={20} color="#FF3B30" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading stores...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.storesList}
        contentContainerStyle={styles.storesListContent}
      >
        {stores.map(store => (
          <TouchableOpacity
            key={store.id}
            style={[
              styles.storeItem,
              selectedStore?.id === store.id && styles.selectedStoreItem
            ]}
            onPress={() => setSelectedStore(store)}
          >
            <Image
              source={{ uri: store.imageUrl || 'https://via.placeholder.com/50' }}
              style={styles.storeImage}
            />
            <View style={styles.storeInfo}>
              <Text style={styles.storeName} numberOfLines={1}>
                {store.name}
              </Text>
              <Text style={styles.storeCategory}>
                {getCategoryLabel(store.category || 'Uncategorized')}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {selectedStore ? (
        <>
          <View style={styles.productsHeader}>
            <Text style={styles.productsTitle}>
              Products in {selectedStore.name}
            </Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => navigation.navigate('Add Product', {
                storeId: selectedStore.id,
                storeName: selectedStore.name
              })}
            >
              <Ionicons name="add" size={24} color="#fff" />
              <Text style={styles.addButtonText}>Add Product</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={products}
            renderItem={renderProductItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.productsList}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons name="cube-outline" size={60} color="#ccc" />
                <Text style={styles.emptyText}>
                  No products in this store
                </Text>
                <TouchableOpacity
                  style={styles.addFirstButton}
                  onPress={() => navigation.navigate('Add Product', {
                    storeId: selectedStore.id,
                    storeName: selectedStore.name
                  })}
                >
                  <Text style={styles.addFirstButtonText}>Add Your First Product</Text>
                </TouchableOpacity>
              </View>
            }
          />
        </>
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="storefront-outline" size={60} color="#ccc" />
          <Text style={styles.emptyText}>
            No stores found
          </Text>
          <TouchableOpacity
            style={styles.addFirstButton}
            onPress={() => navigation.navigate('Create Store')}
          >
            <Text style={styles.addFirstButtonText}>Create Your First Store</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  storesList: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  storesListContent: {
    padding: 12,
  },
  storeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    width: 200,
  },
  selectedStoreItem: {
    backgroundColor: '#e3f2fd',
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  storeImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  storeInfo: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  storeCategory: {
    fontSize: 14,
    color: '#666',
  },
  productsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  productsTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  productsList: {
    padding: 16,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 14,
    color: '#666',
  },
  productActions: {
    justifyContent: 'space-between',
    paddingLeft: 12,
  },
  actionButton: {
    padding: 8,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
    marginBottom: 24,
  },
  addFirstButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  addFirstButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 