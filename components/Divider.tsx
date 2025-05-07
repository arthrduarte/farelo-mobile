import { View, StyleSheet } from "react-native";

export const Divider = ({ marginVertical = 16 }: { marginVertical?: number }) => {
    return (
        <View style={{
            borderBottomColor: '#79320633',
            borderBottomWidth: StyleSheet.hairlineWidth,
            marginVertical: marginVertical,
        }} />
    );
};
