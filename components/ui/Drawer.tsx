import { View, StyleSheet, Text, TouchableOpacity, ScrollView, Animated, Modal, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface DrawerOption {
  icon: keyof typeof MaterialIcons.glyphMap;
  text: string;
  onPress: () => void;
}

interface DrawerProps {
  isDrawerOpen: boolean;
  toggleDrawer: () => void;
  drawerAnimation: Animated.Value;
  options: DrawerOption[];
  title: string;
}

export default function Drawer({ 
  isDrawerOpen, 
  toggleDrawer, 
  drawerAnimation, 
  options,
  title 
}: DrawerProps) {
  return (
    <Modal
      animationType="fade"
      transparent={true}
      visible={isDrawerOpen}
      onRequestClose={toggleDrawer}
    >
      <TouchableOpacity 
        style={styles.modalOverlay}
        activeOpacity={1} 
        onPress={toggleDrawer}
      >
        <View 
          style={styles.drawerContainerWrapper}
          onStartShouldSetResponder={() => true}
        >
          <Animated.ScrollView 
            style={[
              styles.drawerContent,
              {
                transform: [{
                  translateY: drawerAnimation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [300, 0]
                  })
                }]
              }
            ]}
          >
            <View style={styles.drawerHeader}>
              <Text style={styles.drawerTitle}>{title}</Text>
              <TouchableOpacity onPress={toggleDrawer}>
                <MaterialIcons name="close" size={24} color="#793206" />
              </TouchableOpacity>
            </View>

            {options.map((option, index) => (
              <TouchableOpacity 
                key={index}
                style={[styles.drawerOption, index === options.length - 1 && { marginBottom: 32 }]} 
                onPress={option.onPress}
              >
                <MaterialIcons name={option.icon} size={24} color="#793206" />
                <Text style={styles.drawerOptionText}>{option.text}</Text>
              </TouchableOpacity>
            ))}
          </Animated.ScrollView>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  drawerContainerWrapper: {
    width: '100%',
  },
  drawerContent: {
    width: '100%',
    backgroundColor: '#EDE4D2',
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: Dimensions.get('window').height * 0.6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  drawerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  drawerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#793206',
  },
  drawerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 16,
    backgroundColor: '#79320633',
    borderRadius: 8,
    marginBottom: 12,
  },
  drawerOptionText: {
    fontSize: 16,
    color: '#793206',
    fontWeight: '500',
  },
}); 