import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import Toast from 'react-native-toast-message';
import { router } from 'expo-router';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../../services/firebaseConfig';

export default function CartScreen() {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();
  const [placingOrder, setPlacingOrder] = useState(false);

  // Get cart total
  const cartTotal = getCartTotal();

  // Group cart items by store
  const itemsByStore = cartItems.reduce((stores, item) => {
    const { storeId, storeName } = item;
    if (!stores[storeId]) {
      stores[storeId] = {
        storeId,
        storeName,
        items: []
      };
    }
    stores[storeId].items.push(item);
    return stores;
  }, {});

  const storeGroups = Object.values(itemsByStore);

  const handlePlaceOrder = async () => {
    if (cartItems.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Cart is empty',
        text2: 'Add products to your cart first'
      });
      return;
    }

    setPlacingOrder(true);

    try {
      // Create an order for each store
      const orderPromises = storeGroups.map(async (group) => {
        const { storeId, items } = group;
        
        // Calculate total for this store's items
        const storeTotal = items.reduce((total, item) => {
          return total + (item.price * item.quantity);
        }, 0);
        
        // Create the order object
        const order = {
          storeId,
          items: items.map(item => ({
            productId: item.productId,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            imageUrl: item.imageUrl,
          })),
          total: storeTotal,
          userId: auth.currentUser?.uid || null,
          userEmail: auth.currentUser?.email || 'anonymous',
          createdAt: serverTimestamp(),
          status: 'placed'
        };
        
        // Save to Firestore
        const orderRef = await addDoc(collection(db, 'orders'), order);
        return orderRef.id;
      });
      
      // Wait for all orders to be created
      await Promise.all(orderPromises);
      
      // Clear the cart
      clearCart();
      
      // Show success message
      Toast.show({
        type: 'success',
        text1: 'Order Placed Successfully',
        text2: 'Thank you for your order!'
      });
      
      // Navigate back to the main page
      router.push('/(public)/');
      
    } catch (error) {
      console.error('Error placing order:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to place order. Please try again.'
      });
    } finally {
      setPlacingOrder(false);
    }
  };

  const increaseQuantity = (productId, currentQuantity) => {
    updateQuantity(productId, currentQuantity + 1);
  };

  const decreaseQuantity = (productId, currentQuantity) => {
    if (currentQuantity > 1) {
      updateQuantity(productId, currentQuantity - 1);
    } else {
      removeFromCart(productId);
    }
  };

  const renderCartItem = ({ item }) => (
    <View style={styles.cartItem}>
      <View style={styles.productImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={30} color="#999" />
          </View>
        )}
      </View>
      
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <Text style={styles.productPrice}>${parseFloat(item.price).toFixed(2)}</Text>
        
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => decreaseQuantity(item.productId, item.quantity)}
          >
            <Ionicons name="remove" size={18} color="#666" />
          </TouchableOpacity>
          
          <Text style={styles.quantityText}>{item.quantity}</Text>
          
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={() => increaseQuantity(item.productId, item.quantity)}
          >
            <Ionicons name="add" size={18} color="#666" />
          </TouchableOpacity>
        </View>
      </View>
      
      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeFromCart(item.productId)}
      >
        <Ionicons name="trash-outline" size={22} color="#FF3B30" />
      </TouchableOpacity>
    </View>
  );

  const renderStoreGroup = ({ item }) => (
    <View style={styles.storeGroup}>
      <Text style={styles.storeName}>{item.storeName}</Text>
      <FlatList
        data={item.items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.productId}
        scrollEnabled={false}
      />
    </View>
  );

  if (cartItems.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 40 }} />
        </View>
        
        <View style={styles.emptyCart}>
          <Ionicons name="cart-outline" size={80} color="#ccc" />
          <Text style={styles.emptyCartText}>Your cart is empty</Text>
          <Text style={styles.emptyCartSubtext}>
            Browse stores and add products to your cart
          </Text>
          <TouchableOpacity
            style={styles.browseButton}
            onPress={() => router.push('/(public)/')}
          >
            <Text style={styles.browseButtonText}>Browse Stores</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cart</Text>
        <TouchableOpacity
          style={styles.clearButton}
          onPress={clearCart}
        >
          <Text style={styles.clearButtonText}>Clear</Text>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={storeGroups}
        renderItem={renderStoreGroup}
        keyExtractor={(item) => item.storeId}
        contentContainerStyle={styles.cartList}
        ListFooterComponent={
          <View style={styles.orderSummary}>
            <Text style={styles.orderSummaryTitle}>Order Summary</Text>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>${cartTotal.toFixed(2)}</Text>
            </View>
            
            <View style={styles.summaryItem}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={styles.summaryValue}>$0.00</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>${cartTotal.toFixed(2)}</Text>
            </View>
            
            <TouchableOpacity
              style={styles.placeOrderButton}
              onPress={handlePlaceOrder}
              disabled={placingOrder}
            >
              {placingOrder ? (
                <ActivityIndicator color="white" size="small" />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color="white" />
                  <Text style={styles.placeOrderButtonText}>Place Order</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eeeeee',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    color: '#FF3B30',
    fontSize: 14,
    fontWeight: '600',
  },
  cartList: {
    padding: 16,
    paddingBottom: 40,
  },
  storeGroup: {
    marginBottom: 24,
    backgroundColor: 'white',
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  storeName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cartItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
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
    marginLeft: 16,
    justifyContent: 'space-between',
  },
  productName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 8,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: 16,
    fontWeight: '600',
    marginHorizontal: 12,
    minWidth: 25,
    textAlign: 'center',
  },
  removeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  orderSummaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  summaryLabel: {
    fontSize: 16,
    color: '#666',
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#f0f0f0',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  totalValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#007AFF',
  },
  placeOrderButton: {
    backgroundColor: '#4CAF50',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  placeOrderButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  emptyCart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  emptyCartText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 16,
  },
  emptyCartSubtext: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  browseButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
  },
  browseButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
}); 