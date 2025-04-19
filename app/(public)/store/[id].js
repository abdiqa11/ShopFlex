import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, ScrollView, Pressable, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../../services/firebaseConfig';
import { Ionicons } from '@expo/vector-icons';
import Toast from 'react-native-toast-message';
import { useCart } from '../../../context/CartContext';

export default function StoreDetail() {
  const { id } = useLocalSearchParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const { addToCart, getItemsCount } = useCart();

  useEffect(() => {
    if (id) {
      fetchStoreAndProducts(id);
    }
  }, [id]);

  const fetchStoreAndProducts = async (storeId) => {
    try {
      setLoading(true);
      
      // Fetch store details
      const storeDoc = doc(db, 'stores', storeId);
      const storeSnapshot = await getDoc(storeDoc);
      
      if (!storeSnapshot.exists()) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Store not found'
        });
        setLoading(false);
        return;
      }
      
      const storeData = {
        id: storeSnapshot.id,
        ...storeSnapshot.data()
      };
      setStore(storeData);
      
      // Fetch products for this store
      const productsQuery = query(
        collection(db, 'products'),
        where('storeId', '==', storeId)
      );
      
      const productsSnapshot = await getDocs(productsQuery);
      const productsList = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Fetched ${productsList.length} products for store ${storeId}`);
      setProducts(productsList);
    } catch (error) {
      console.error('Error fetching store and products:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load store information'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = (product) => {
    const cartItem = {
      productId: product.id,
      storeId: store.id,
      storeName: store.name || 'Unknown Store',
      name: product.name || 'Unnamed Product',
      price: parseFloat(product.price || 0),
      imageUrl: product.imageUrl,
      quantity: 1
    };
    
    addToCart(cartItem);
    
    Toast.show({
      type: 'success',
      text1: 'Added to Cart',
      text2: `${product.name || 'Product'} added to your cart`
    });
  };

  const handleGoToCart = () => {
    router.push('/(public)/cart');
  };

  const renderProduct = ({ item }) => (
    <View style={styles.productCard}>
      <View style={styles.productImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#999" />
          </View>
        )}
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name || 'Unnamed Product'}</Text>
        <Text style={styles.productPrice}>
          ${parseFloat(item.price || 0).toFixed(2)}
        </Text>
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description || 'No description available'}
        </Text>
        
        <TouchableOpacity 
          style={styles.addToCartButton}
          onPress={() => handleAddToCart(item)}
        >
          <Ionicons name="cart-outline" size={16} color="white" />
          <Text style={styles.addToCartButtonText}>Add to Cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading store information...</Text>
      </View>
    );
  }

  if (!store) {
    return (
      <View style={styles.centered}>
        <Ionicons name="alert-circle-outline" size={60} color="#999" />
        <Text style={styles.errorText}>Store not found</Text>
      </View>
    );
  }

  const cartItemsCount = getItemsCount();

  return (
    <View style={styles.container}>
      {/* Cart Button */}
      {cartItemsCount > 0 && (
        <TouchableOpacity 
          style={styles.cartButton}
          onPress={handleGoToCart}
        >
          <Ionicons name="cart" size={24} color="white" />
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{cartItemsCount}</Text>
          </View>
        </TouchableOpacity>
      )}
      
      <ScrollView 
        style={styles.storeContainer}
        contentContainerStyle={styles.storeContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Store Header */}
        <View style={styles.storeHeader}>
          {store.imageUrl ? (
            <Image source={{ uri: store.imageUrl }} style={styles.storeImage} />
          ) : (
            <View style={styles.storePlaceholder}>
              <Ionicons name="storefront" size={80} color="#999" />
            </View>
          )}
          
          <View style={styles.storeDetails}>
            <Text style={styles.storeName}>{store.name || 'Unnamed Store'}</Text>
            <Text style={styles.storeDescription}>{store.description || 'No description available'}</Text>
            
            {store.contactEmail && (
              <View style={styles.contactItem}>
                <Ionicons name="mail-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{store.contactEmail}</Text>
              </View>
            )}
            
            {store.contactPhone && (
              <View style={styles.contactItem}>
                <Ionicons name="call-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{store.contactPhone}</Text>
              </View>
            )}
            
            {store.location && (
              <View style={styles.contactItem}>
                <Ionicons name="location-outline" size={18} color="#666" />
                <Text style={styles.contactText}>{store.location}</Text>
              </View>
            )}
          </View>
        </View>
        
        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Products</Text>
          
          {products.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              scrollEnabled={false} // Disable scrolling since we're inside ScrollView
            />
          ) : (
            <View style={styles.emptyProducts}>
              <Ionicons name="basket-outline" size={50} color="#ccc" />
              <Text style={styles.emptyText}>No products available</Text>
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  errorText: {
    fontSize: 18,
    color: '#666',
    marginTop: 12,
  },
  storeContainer: {
    flex: 1,
  },
  storeContent: {
    padding: 16,
  },
  storeHeader: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  storeImage: {
    width: '100%',
    height: 200,
    resizeMode: 'cover',
  },
  storePlaceholder: {
    width: '100%',
    height: 200,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeDetails: {
    padding: 16,
  },
  storeName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  storeDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  contactText: {
    fontSize: 14,
    color: '#666',
    marginLeft: 8,
  },
  productsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  productCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'row',
    height: 150, // Increased height to accommodate button
  },
  productImageContainer: {
    width: 120,
    height: '100%',
    backgroundColor: '#f0f0f0',
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  productInfo: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginVertical: 4,
  },
  productDescription: {
    fontSize: 14,
    color: '#666',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginTop: 8,
  },
  addToCartButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
  },
  emptyProducts: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 12,
  },
  cartButton: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: '#007AFF',
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
}); 