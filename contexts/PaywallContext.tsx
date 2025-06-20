import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Paywall } from '@/components/Paywall';

interface PaywallContextType {
    showPaywall: (onDismiss?: () => void) => void;
}

const PaywallContext = createContext<PaywallContextType | undefined>(undefined);

export const PaywallProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [isVisible, setIsVisible] = useState(false);
    const [onDismissCallback, setOnDismissCallback] = useState<() => void>(() => () => {});

    const showPaywall = (onDismiss?: () => void) => {
        if (onDismiss) {
            setOnDismissCallback(() => onDismiss);
        }
        setIsVisible(true);
    };

    const handleDismiss = () => {
        setIsVisible(false);
        onDismissCallback();
        setOnDismissCallback(() => () => {}); // Reset callback
    };

    return (
        <PaywallContext.Provider value={{ showPaywall }}>
            {children}
            {isVisible && <Paywall onDismiss={handleDismiss} />}
        </PaywallContext.Provider>
    );
};

export const usePaywall = () => {
    const context = useContext(PaywallContext);
    if (!context) {
        throw new Error('usePaywall must be used within a PaywallProvider');
    }
    return context;
}; 