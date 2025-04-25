import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, ActivityIndicator, Image, ScrollView, Pressable, TouchableOpacity, useWindowDimensions } from 'react-native';
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
  const [allProducts, setAllProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const { addToCart, getItemsCount } = useCart();
  const { width } = useWindowDimensions();

  useEffect(() => {
    if (id) {
      fetchStoreAndProducts(id);
    }
  }, [id]);

  // Filter products when category changes
  useEffect(() => {
    if (selectedCategory === 'all') {
      setProducts(allProducts);
    } else {
      const filteredProducts = allProducts.filter(
        product => product.category && 
                  product.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      setProducts(filteredProducts);
    }
  }, [selectedCategory, allProducts]);

  const fetchStoreAndProducts = async () => {
    setLoading(true);
    try {
        // Fetch store details
        const storeDoc = await getDoc(doc(db, 'stores', id));
        if (!storeDoc.exists()) {
            Toast.show({
                type: 'error',
                text1: 'Store Not Found',
                text2: 'This store does not exist or has been removed.'
            });
            router.replace('/');
            return;
        }
        
        const storeData = { id: storeDoc.id, ...storeDoc.data() };
        setStore(storeData);
        
        // Fetch products from this store
        const productsQuery = query(
            collection(db, 'products'),
            where('storeId', '==', id)
        );
        
        const productsSnapshot = await getDocs(productsQuery);
        
        const productsData = productsSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        
        // Extract unique categories
        const uniqueCategories = [...new Set(productsData
            .map(product => product.category)
            .filter(category => category))]; // Filter out undefined/null categories
        
        setCategories(uniqueCategories);
        setAllProducts(productsData);
        setProducts(productsData);
        
        console.log(`Fetched ${productsData.length} products for store ${id}`);
    } catch (error) {
        console.error('Error fetching store and products:', error);
        Toast.show({
            type: 'error',
            text1: 'Error',
            text2: 'Failed to load store and products'
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
    <TouchableOpacity
      style={styles.productCard}
      activeOpacity={0.9}
      onPress={() => {}}
    >
      <View style={styles.productImageContainer}>
        {item.imageUrl ? (
          <Image 
            source={{ uri: item.imageUrl }} 
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={40} color="#ccc" />
          </View>
        )}
        
        {item.category && (
          <View style={styles.categoryTag}>
            <Text style={styles.categoryTagText}>{item.category}</Text>
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={1}>{item.name || 'Unnamed Product'}</Text>
        <Text style={styles.productPrice}>
          ${parseFloat(item.price || 0).toFixed(2)}
        </Text>
        
        <View style={styles.productActions}>
          <TouchableOpacity 
            style={styles.addToCartButton}
            onPress={() => handleAddToCart(item)}
            activeOpacity={0.7}
          >
            <Ionicons name="cart-outline" size={16} color="white" />
            <Text style={styles.addToCartButtonText}>Add</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.viewButton}
            onPress={() => {}}
            activeOpacity={0.7}
          >
            <Ionicons name="eye-outline" size={16} color="#007AFF" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderCategoryFilter = () => {
    if (categories.length === 0) return null;
    
    return (
      <View style={styles.categoryFilterContainer}>
        <Text style={styles.filterTitle}>Categories</Text>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoriesScrollView}
        >
          <TouchableOpacity
            style={[
              styles.categoryButton,
              selectedCategory === 'all' && styles.selectedCategoryButton
            ]}
            onPress={() => setSelectedCategory('all')}
          >
            <Text 
              style={[
                styles.categoryButtonText,
                selectedCategory === 'all' && styles.selectedCategoryText
              ]}
            >
              All Products
            </Text>
          </TouchableOpacity>
          
          {categories.map(category => (
            <TouchableOpacity
              key={category}
              style={[
                styles.categoryButton,
                selectedCategory === category && styles.selectedCategoryButton
              ]}
              onPress={() => setSelectedCategory(category)}
            >
              <Text 
                style={[
                  styles.categoryButtonText,
                  selectedCategory === category && styles.selectedCategoryText
                ]}
              >
                {category}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  const EmptyProductsList = () => (
    <View style={styles.emptyProducts}>
      <Ionicons name="basket-outline" size={60} color="#ccc" />
      <Text style={styles.emptyTitle}>This store has no products yet</Text>
      <Text style={styles.emptyText}>Check back soon for new products</Text>
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
          activeOpacity={0.8}
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
          <View style={styles.storeImageWrapper}>
            {store.imageUrl ? (
              <Image 
                source={{ uri: store.imageUrl }} 
                style={styles.storeImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.storePlaceholder}>
                <Ionicons name="storefront" size={80} color="#999" />
              </View>
            )}
            
            {/* Store logo with improved presentation */}
            {store.logoUrl && (
              <View style={styles.logoContainer}>
                <Image 
                  source={{ uri: store.logoUrl }} 
                  style={styles.storeLogo}
                  resizeMode="cover"
                />
              </View>
            )}
            
            {/* Header gradient overlay */}
            <View style={styles.imageGradient} />
          </View>
          
          <View style={styles.storeDetails}>
            <View style={styles.storeNameRow}>
              <Text style={styles.storeName}>{store.name || 'Unnamed Store'}</Text>
              <View style={styles.verifiedBadge}>
                <Ionicons name="checkmark-circle" size={18} color="#4CAF50" />
                <Text style={styles.verifiedText}>Verified</Text>
              </View>
            </View>
            
            <Text style={styles.storeDescription}>{store.description || 'No description available'}</Text>
            
            <View style={styles.contactContainer}>
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
        </View>
        
        {/* Products Section */}
        <View style={styles.productsSection}>
          <Text style={styles.sectionTitle}>Products</Text>
          
          {/* Category Filter */}
          {renderCategoryFilter()}
          
          {products.length > 0 ? (
            <FlatList
              data={products}
              renderItem={renderProduct}
              keyExtractor={(item) => item.id}
              scrollEnabled={false} // Disable scrolling since we're inside ScrollView
              numColumns={2}
              columnWrapperStyle={styles.productRow}
            />
          ) : (
            <EmptyProductsList />
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    marginTop: 16,
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
    paddingBottom: 80, // Extra space for floating button
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
  storeImageWrapper: {
    width: '100%',
    height: 180,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  storePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  storeDetails: {
    padding: 16,
    paddingTop: 24,
  },
  storeNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  verifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  verifiedText: {
    fontSize: 12,
    color: '#4CAF50',
    fontWeight: '500',
    marginLeft: 2,
  },
  storeDescription: {
    fontSize: 16,
    color: '#666',
    marginBottom: 16,
    lineHeight: 22,
  },
  contactContainer: {
    backgroundColor: '#f9f9f9',
    padding: 12,
    borderRadius: 8,
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
  categoryFilterContainer: {
    marginBottom: 16,
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  filterTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
    paddingHorizontal: 4,
  },
  categoriesScrollView: {
    paddingVertical: 4,
    paddingBottom: 8,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#f0f0f0',
    borderRadius: 20,
    marginRight: 8,
  },
  selectedCategoryButton: {
    backgroundColor: '#E3EFFD',
  },
  categoryButtonText: {
    fontSize: 14,
    color: '#555',
  },
  selectedCategoryText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  productRow: {
    justifyContent: 'space-between',
  },
  productCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    flexDirection: 'column',
    minWidth: 160,
    maxWidth: '48%',
    margin: 4,
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: '#f0f0f0',
    position: 'relative',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  categoryTag: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.6)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  categoryTagText: {
    color: 'white',
    fontSize: 10,
    fontWeight: '500',
  },
  productInfo: {
    padding: 12,
  },
  productName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  productActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addToCartButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minHeight: 36,
    flex: 1,
    marginRight: 8,
  },
  addToCartButtonText: {
    color: 'white',
    fontWeight: '600',
    marginLeft: 6,
    fontSize: 14,
  },
  viewButton: {
    backgroundColor: '#E3EFFD',
    padding: 8,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    height: 36,
    width: 36,
  },
  emptyProducts: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 40,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 20,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    marginTop: 8,
    textAlign: 'center',
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
    top: -2,
    right: -2,
    backgroundColor: '#FF3B30',
    borderRadius: 12,
    minWidth: 22,
    height: 22,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
    borderWidth: 2,
    borderColor: 'white',
  },
  cartBadgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  logoContainer: {
    position: 'absolute',
    bottom: -35,
    left: 20,
    width: 70,
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
    zIndex: 10,
  },
  storeLogo: {
    width: '100%',
    height: '100%',
    borderRadius: 35,
  },
}); 