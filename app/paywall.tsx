import React from 'react';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { router } from 'expo-router';
import { Alert, Platform, StyleSheet, View, Text, Pressable } from 'react-native';
import Purchases, { PurchasesStoreTransaction, CustomerInfo } from 'react-native-purchases';

export default function PaywallScreen() {
    const handleDismiss = () => {
        console.log('Paywall dismissed');
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/');
        }
    };

    const onPurchaseCompleted = ({ customerInfo, storeTransaction }: { customerInfo: CustomerInfo; storeTransaction: PurchasesStoreTransaction; }) => {
        console.log('Purchase completed from Paywall component:', customerInfo, storeTransaction);
        Alert.alert('Purchase Successful', 'Your access has been updated.');
    };

    const onRestoreCompleted = ({ customerInfo }: { customerInfo: CustomerInfo; }) => {
        console.log('Restore completed from Paywall component:', customerInfo);
        Alert.alert('Restore Successful', 'Your purchases have been restored.');
    };

    const handleManualRestore = async () => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            console.log('Manual restore triggered, customerInfo:', customerInfo);
            if (customerInfo.entitlements.active && Object.keys(customerInfo.entitlements.active).length > 0) {
                Alert.alert('Restore Successful', 'Your access has been restored.');
                handleDismiss();
            } else {
                Alert.alert('No Active Subscriptions', 'No active subscriptions found to restore.');
            }
        } catch (e: any) {
            console.error('Manual restore error:', e);
            Alert.alert('Restore Failed', e.message || 'Could not restore purchases.');
        }
    };

    return (
        <View style={styles.container}>
            <RevenueCatUI.Paywall 
                options={{
                    displayCloseButton: true,
                }}
                onDismiss={handleDismiss}
                onPurchaseCompleted={onPurchaseCompleted}
                onRestoreCompleted={onRestoreCompleted}
            />
            {Platform.OS === 'android' && (
                <View style={styles.manualRestoreContainerAndroid}>
                    <Pressable style={styles.restoreButton} onPress={handleManualRestore}>
                        <Text style={styles.restoreButtonText}>Restore Purchases</Text>
                    </Pressable>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#EDE4D2',
    },
    manualRestoreContainerAndroid: {
        position: 'absolute',
        bottom: 30,
        left: 0,
        right: 0,
        alignItems: 'center',
    },
    restoreButton: {
        backgroundColor: '#793206',
        paddingVertical: 12,
        paddingHorizontal: 30,
        borderRadius: 8,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 1.41,
    },
    restoreButtonText: {
        color: '#EDE4D2',
        fontSize: 16,
        fontWeight: 'bold',
    },
});
