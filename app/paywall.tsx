import React from 'react';
import {View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, SafeAreaView, Platform} from 'react-native';

// TODO: Replace with your actual logo import
// import Logo from '@/assets/images/Logo.png'; 

const BROWN = '#793206';
const BEIGE = '#EDE4D2';
const BROWN_OPACITY = '#79320633';
const LIGHT_BROWN = '#A0522D'; // A slightly lighter brown for accents
const WHITE = '#FFFFFF';

const MONTHLY_PRICE = 4.99;
const YEARLY_PRICE = 39.99;
const YEARLY_SAVING_PERCENTAGE = Math.round(((MONTHLY_PRICE * 12) - YEARLY_PRICE) / (MONTHLY_PRICE * 12) * 100);

export default function Paywall() {
    const [selectedPlan, setSelectedPlan] = React.useState<'monthly' | 'yearly'>('yearly');

    const proBenefits = [
        "Access to Jacquin, your AI personal chef",
        "Recipe importing using AI",
        "Access to meal plan generator",
        "Priority support"
    ];

    const getButtonText = () => {
        if (selectedPlan === 'yearly') {
            return `Continue with Yearly for $${YEARLY_PRICE}`;
        }
        return `Continue with Monthly for $${MONTHLY_PRICE}`;
    };

    return (
        <SafeAreaView style={styles.safeArea}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContentContainer}>
                <View style={styles.headerContainer}>
                    {/* Replace with actual Image component once Logo is imported */}
                    <Image source={require('@/assets/images/Logo.png')} style={styles.logo} />
                    <Text style={styles.mainTitle}>Go PRO & Cook Smarter!</Text>
                    <Text style={styles.subTitle}>Join Farelo PRO to unlock exclusive features and enhance your culinary journey.</Text>
                </View>

                <View style={styles.planSelectionContainer}>
                    {/* Monthly Plan Card */}
                    <TouchableOpacity 
                        style={[styles.planCard, selectedPlan === 'monthly' ? styles.selectedPlanCard : styles.unselectedPlanCard]}
                        onPress={() => setSelectedPlan('monthly')}
                    >
                        <View style={styles.planDetails}>
                            <Text style={[styles.planName, selectedPlan === 'monthly' ? styles.selectedPlanText : styles.unselectedPlanText]}>Monthly</Text>
                            <Text style={[styles.planPrice, selectedPlan === 'monthly' ? styles.selectedPlanText : styles.unselectedPlanText]}>${MONTHLY_PRICE}/month</Text>
                        </View>
                    </TouchableOpacity>

                    {/* Yearly Plan Card */}
                    <TouchableOpacity 
                        style={[styles.planCard, selectedPlan === 'yearly' ? styles.selectedPlanCard : styles.unselectedPlanCard]}
                        onPress={() => setSelectedPlan('yearly')}
                    >
                        <View style={styles.planDetails}>
                            <Text style={[styles.planName, selectedPlan === 'yearly' ? styles.selectedPlanText : styles.unselectedPlanText]}>Yearly</Text>
                            <Text style={[styles.planPrice, selectedPlan === 'yearly' ? styles.selectedPlanText : styles.unselectedPlanText]}>${YEARLY_PRICE}/year</Text>
                        </View>
                        <View style={styles.saveBadge}>
                            <Text style={styles.saveBadgeText}>SAVE {YEARLY_SAVING_PERCENTAGE}%</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                <View style={styles.benefitsSection}>
                    <Text style={styles.benefitsTitle}>What you get with PRO:</Text>
                    {proBenefits.map((benefit, index) => (
                        <View key={index} style={styles.benefitItem}>
                            <Text style={styles.benefitIcon}>✓</Text>
                            <Text style={styles.benefitText}>{benefit}</Text>
                        </View>
                    ))}
                </View>
                
            </ScrollView>
            <View style={styles.bottomSection}>
                <TouchableOpacity style={styles.proButton} onPress={() => { /* Handle subscription */ }}>
                    <Text style={styles.proButtonText}>{getButtonText()}</Text>
                </TouchableOpacity>
                <Text style={styles.cancelText}>Cancel anytime. No penalties or fees.</Text>
                <Text style={styles.disclaimerText}>
                    By continuing, you agree to our Terms of Service and Privacy Policy.
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: BEIGE,
        paddingTop: Platform.OS === 'android' ? 30 : 20,
    },
    scrollView: {
        flex: 1,
    },
    scrollContentContainer: {
        paddingBottom: 160, // Increased padding for larger bottom section
    },
    headerContainer: {
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'android' ? 30 : 20,
        paddingBottom: 20,
        backgroundColor: BEIGE, 
    },
    logo: {
        width: 160, // Slightly smaller for balance
        height: 50,
        resizeMode: 'contain',
        marginBottom: 15,
    },
    mainTitle: {
        fontSize: 24, // Larger title
        fontWeight: 'bold',
        color: BROWN,
        textAlign: 'center',
        marginBottom: 8,
        fontFamily: 'System', // Consider custom font
    },
    subTitle: {
        fontSize: 16,
        color: LIGHT_BROWN,
        textAlign: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    planSelectionContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        paddingHorizontal: 15,
        marginBottom: 25,
    },
    planCard: {
        flex: 1,
        borderRadius: 12,
        paddingVertical: 15,
        paddingHorizontal: 10,
        marginHorizontal: 5,
        alignItems: 'center',
        borderWidth: 2,
        shadowColor: BROWN_OPACITY,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 3,
        elevation: 3,
        position: 'relative', // For badge positioning
    },
    selectedPlanCard: {
        backgroundColor: BROWN,
        borderColor: BROWN,
    },
    unselectedPlanCard: {
        backgroundColor: WHITE,
        borderColor: BROWN_OPACITY,
    },
    planDetails: {
        alignItems: 'center',
    },
    planName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
        fontFamily: 'System',
    },
    planPrice: {
        fontSize: 14,
        fontFamily: 'System',
    },
    selectedPlanText: {
        color: BEIGE,
    },
    unselectedPlanText: {
        color: BROWN,
    },
    saveBadge: {
        position: 'absolute',
        top: -10,
        right: -10, // Adjusted for better placement on card edge
        backgroundColor: LIGHT_BROWN, // Using a different brown for contrast
        paddingHorizontal: 8,
        paddingVertical: 3,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: BEIGE,
    },
    saveBadgeText: {
        color: WHITE,
        fontSize: 10,
        fontWeight: 'bold',
    },
    benefitsSection: {
        marginHorizontal: 20,
        marginBottom: 20,
        padding: 20,
        backgroundColor: WHITE, 
        borderRadius: 12,
        shadowColor: BROWN_OPACITY,
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.5,
        shadowRadius: 2,
        elevation: 2,
    },
    benefitsTitle: {
        fontSize: 18, // Style from user instructions: title font size 20 - applying here
        fontWeight: 'bold',
        color: BROWN,
        marginBottom: 15,
        textAlign: 'center',
    },
    benefitItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    benefitIcon: {
        color: BROWN,
        marginRight: 12,
        fontSize: 18, // Larger checkmark
    },
    benefitText: {
        fontSize: 15,
        color: '#444444', // Darker grey for readability
        flexShrink: 1,
    },
    bottomSection: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        paddingHorizontal: 20,
        paddingTop: 15,
        paddingBottom: Platform.OS === 'ios' ? 30 : 20, // Safe area padding for bottom
        backgroundColor: BEIGE,
        borderTopWidth: 1,
        borderTopColor: BROWN_OPACITY,
    },
    proButton: {
        backgroundColor: BROWN,
        paddingVertical: 16, // Slightly adjusted padding
        borderRadius: 25, // More rounded
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
        shadowColor: BROWN,
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.35,
        shadowRadius: 4,
        elevation: 5,
    },
    proButtonText: {
        color: BEIGE,
        fontSize: 17, // Slightly adjusted size
        fontWeight: 'bold',
        fontFamily: 'System',
    },
    cancelText: {
        fontSize: 14,
        color: LIGHT_BROWN,
        textAlign: 'center',
        marginBottom: 8,
    },
    disclaimerText: {
        fontSize: 11, // Slightly smaller
        color: BROWN,
        textAlign: 'center',
        opacity: 0.8,
    }
});

// Removed ThemedView as we are using SafeAreaView with specific background
// container style is now part of safeArea and scrollContentContainer
