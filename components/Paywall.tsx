import React, { useEffect } from 'react';
import RevenueCatUI, { PAYWALL_RESULT } from 'react-native-purchases-ui';
import { Alert, Platform, StyleSheet, View, Text, Pressable } from 'react-native';
import Purchases, { PurchasesStoreTransaction, CustomerInfo, PurchasesError } from 'react-native-purchases';
import { useRevenueCat } from '@/contexts/RevenueCatContext';

// Define the expected structure for the result of presentPaywall
interface PresentPaywallResult {
    result: PAYWALL_RESULT;
    customerInfo?: CustomerInfo;
    storeTransaction?: PurchasesStoreTransaction;
    error?: PurchasesError; 
}

interface PaywallProps {
    onDismiss: () => void;
}

export const Paywall: React.FC<PaywallProps> = ({ onDismiss }) => {
    const { refreshCustomerInfo } = useRevenueCat();

    const handlePurchaseCompleted = async (customerInfo: CustomerInfo, storeTransaction: PurchasesStoreTransaction | null) => {
        console.log('Purchase completed via presentPaywall:', customerInfo, storeTransaction);
        Alert.alert('Purchase Successful', 'Your access has been updated.');
        
        try {
            await refreshCustomerInfo();
            console.log('[PaywallScreen] CustomerInfo refreshed after purchase.');
        } catch (error) {
            console.error('[PaywallScreen] Error refreshing customerInfo after purchase:', error);
        }
        
        onDismiss();
    };

    const handleRestoreCompleted = async (customerInfo: CustomerInfo) => {
        console.log('Restore completed via presentPaywall:', customerInfo);
        Alert.alert('Restore Successful', 'Your purchases have been restored.');
        
        try {
            await refreshCustomerInfo();
            console.log('[PaywallScreen] CustomerInfo refreshed after restore.');
        } catch (error) {
            console.error('[PaywallScreen] Error refreshing customerInfo after restore:', error);
        }

        onDismiss();
    };

    useEffect(() => {
        const presentPaywallFlow = async () => {
            try {
                // Force cast the type if linter is confused
                const paywallOutcome = await RevenueCatUI.presentPaywall({
                    displayCloseButton: true,
                }) as unknown as PresentPaywallResult;

                console.log('Paywall outcome:', paywallOutcome);

                switch (paywallOutcome.result) {
                    case PAYWALL_RESULT.PURCHASED:
                        if (paywallOutcome.customerInfo && paywallOutcome.storeTransaction) {
                            await handlePurchaseCompleted(paywallOutcome.customerInfo, paywallOutcome.storeTransaction);
                        } else {
                            console.warn("Purchase reported but customerInfo or storeTransaction missing from result.");
                            Alert.alert('Purchase Processed', 'Your purchase is being processed.');
                            onDismiss();
                        }
                        break;
                    case PAYWALL_RESULT.RESTORED:
                        if (paywallOutcome.customerInfo) {
                            await handleRestoreCompleted(paywallOutcome.customerInfo);
                        } else {
                            console.warn("Restore reported but customerInfo missing from result.");
                            Alert.alert('Restore Processed', 'Your restore is being processed.');
                            onDismiss();
                        }
                        break;
                    case PAYWALL_RESULT.CANCELLED:
                        console.log('Paywall cancelled by user.');
                        onDismiss();
                        break;
                    case PAYWALL_RESULT.ERROR:
                        if (paywallOutcome.error) {
                            console.error('Paywall error:', paywallOutcome.error);
                            Alert.alert('Error', paywallOutcome.error.message || 'An error occurred with the paywall.');
                        } else {
                            console.error('Paywall error reported but no error object found.');
                            Alert.alert('Error', 'An unknown error occurred with the paywall.');
                        }
                        onDismiss();
                        break;
                    default:
                        console.log('Paywall not presented or unknown result:', paywallOutcome.result);
                        onDismiss();
                        break;
                }
            } catch (e: any) {
                console.error('Failed to present paywall overall:', e);
                Alert.alert('Error', e.message || 'Could not display payment options.');
                onDismiss();
            }
        };

        presentPaywallFlow();
    }, []);

    const handleManualRestore = async () => {
        try {
            const customerInfo = await Purchases.restorePurchases();
            console.log('Manual restore triggered, customerInfo:', customerInfo);
            if (customerInfo.entitlements.active && Object.keys(customerInfo.entitlements.active).length > 0) {
                Alert.alert('Restore Successful', 'Your access has been restored.');
                onDismiss();
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