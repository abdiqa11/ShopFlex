import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  Pressable, 
  Image, 
  ActivityIndicator, 
  useWindowDimensions,
  SafeAreaView,
  StatusBar,
  ImageBackground
} from 'react-native';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebaseConfig';
import { router } from 'expo-router';
import Toast from 'react-native-toast-message';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

// Array of beautiful gradient color pairs for store cards
const CARD_GRADIENTS = [
  ['#FF9966', '#FF5E62'],
  ['#56CCF2', '#2F80ED'],
  ['#4776E6', '#8E54E9'],
  ['#00B09B', '#96C93D'],
  ['#FDC830', '#F37335'],
  ['#667EEA', '#764BA2'],
  ['#FF416C', '#FF4B2B'],
  ['#7F7FD5', '#91EAE4'],
];

export default function PublicStoresList() {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const { width } = useWindowDimensions();
  
  // Determine grid columns based on screen width
  const numColumns = width > 768 ? 3 : width > 480 ? 2 : 1;
  const cardWidth = (width - 48) / numColumns; // Account for padding

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      setLoading(true);
      const storesCollection = collection(db, 'stores');
      const storesSnapshot = await getDocs(storesCollection);
      
      const storesList = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log(`Fetched ${storesList.length} stores`);
      setStores(storesList);
    } catch (error) {
      console.error('Error fetching stores:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load stores. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  const navigateToStore = (storeId) => {
    router.push(`/(public)/store/${storeId}`);
  };

  const navigateToSellerDashboard = () => {
    router.push("/(tabs)/");
  };

  // Assign a consistent gradient to each store based on its index
  const getGradientColors = (index) => {
    return CARD_GRADIENTS[index % CARD_GRADIENTS.length];
  };

  const renderStore = ({ item, index }) => {
    const gradientColors = getGradientColors(index);
    const storeName = item.name || "Unnamed Store";
    
    return (
      <Pressable 
        style={[styles.storeCard, { width: cardWidth - 16 }]} 
        onPress={() => navigateToStore(item.id)}
      >
        <View style={styles.storeImageContainer}>
          {item.imageUrl ? (
            <Image source={{ uri: item.imageUrl }} style={styles.storeImage} />
          ) : (
            <LinearGradient
              colors={gradientColors}
              style={styles.gradientBackground}
            >
              <Ionicons name="storefront" size={48} color="rgba(255,255,255,0.8)" />
              <Text style={styles.storeInitial}>
                {storeName.charAt(0).toUpperCase()}
              </Text>
            </LinearGradient>
          )}
          
          {/* Store badge */}
          <View style={styles.storeBadge}>
            <Ionicons name="checkmark-circle" size={16} color="#fff" />
          </View>
        </View>
        
        <View style={styles.storeInfo}>
          <Text style={styles.storeName}>{storeName}</Text>
          <Text style={styles.storeDescription} numberOfLines={2}>
            {item.description || 'No description available'}
          </Text>
          
          <View style={styles.storeFooter}>
            <View style={styles.productCount}>
              <Ionicons name="cart-outline" size={14} color="#666" />
              <Text style={styles.productCountText}>Products</Text>
            </View>
            <Text style={styles.viewStoreText}>View Store →</Text>
          </View>
        </View>
      </Pressable>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Discovering stores...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View>
            <Text style={styles.appName}>ShopFlex</Text>
            <Text style={styles.title}>Discover Amazing Stores</Text>
          </View>
          <Pressable 
            style={styles.sellerButton}
            onPress={navigateToSellerDashboard}
          >
            <Ionicons name="briefcase-outline" size={16} color="#555" />
            <Text style={styles.sellerButtonText}>I'm a seller</Text>
          </Pressable>
        </View>
      </View>
      
      {/* Featured banner */}
      <View style={styles.banner}>
        <LinearGradient
          colors={['#667EEA', '#764BA2']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.bannerGradient}
        >
          <View style={styles.bannerContent}>
            <View>
              <Text style={styles.bannerTitle}>Find Unique Products</Text>
              <Text style={styles.bannerSubtitle}>Support local businesses</Text>
            </View>
            <Ionicons name="gift-outline" size={36} color="#fff" />
          </View>
        </LinearGradient>
      </View>
      
      {/* Stores grid */}
      {stores.length > 0 ? (
        <FlatList
          data={stores}
          renderItem={renderStore}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          key={numColumns} // Force re-render when columns change
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          columnWrapperStyle={numColumns > 1 ? styles.row : null}
        />
      ) : (
        <View style={styles.emptyState}>
          <Ionicons name="storefront" size={70} color="#ccc" />
          <Text style={styles.emptyText}>No stores found</Text>
          <Text style={styles.emptySubtext}>Be the first to create a store!</Text>
          <Pressable 
            style={styles.createStoreButton}
            onPress={navigateToSellerDashboard}
          >
            <Text style={styles.createStoreButtonText}>Become a Seller</Text>
          </Pressable>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
  },
  appName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 4,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
  },
  sellerButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  sellerButtonText: {
    color: '#555',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 5,
  },
  banner: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bannerGradient: {
    padding: 20,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  bannerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  list: {
    padding: 16,
    paddingBottom: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  storeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeImageContainer: {
    height: 140,
    position: 'relative',
  },
  storeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  gradientBackground: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInitial: {
    position: 'absolute',
    fontSize: 32,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.9)',
  },
  storeBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: '#34C759',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  storeInfo: {
    padding: 16,
  },
  storeName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
    color: '#333',
  },
  storeDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  storeFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    paddingTop: 12,
  },
  productCount: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productCountText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#666',
  },
  viewStoreText: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#666',
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#999',
    marginTop: 8,
    textAlign: 'center',
    marginBottom: 24,
  },
  createStoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  createStoreButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
}); 