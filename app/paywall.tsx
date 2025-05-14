import {View, Text, StyleSheet} from 'react-native';
import { ThemedView } from '@/components/ThemedView';

export default function Paywall() {
    return (
        <ThemedView style={styles.container}>
          <Text>Paywall</Text>
        </ThemedView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    }
})
