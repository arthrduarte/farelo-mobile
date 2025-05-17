import React from 'react';
import CustomPaywall from '@/components/CustomPaywall';
import { router } from 'expo-router';

export default function PaywallScreen() {
    const handleContinue = (plan: 'monthly' | 'yearly') => {
        // TODO: Implement actual subscription logic
        console.log('Selected plan:', plan);
        // For now, just navigate away or close the modal
        if (router.canGoBack()) {
            router.back();
        } else {
            router.replace('/'); // Or to a relevant screen
        }
    };

    const handleRestore = () => {
        // TODO: Implement restore purchases logic
        console.log('Restore purchases tapped');
    };

    return <CustomPaywall onContinue={handleContinue} onRestore={handleRestore} />;
}
