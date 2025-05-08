import { StyleSheet } from "react-native";
import { ThemedView } from "@/components/ThemedView";
import { ScreenHeader } from "@/components/ui/ScreenHeader";

export default function Settings() {
  return (
    <ThemedView style={styles.container}>
      <ScreenHeader title="Settings" showBackButton />
      {/* Add other settings content here */}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});


