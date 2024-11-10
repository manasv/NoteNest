import { Tabs } from 'expo-router';
import { TabBarIcon } from '@/components/navigation/TabBarIcon';
import { TouchableOpacity, StyleSheet, Alert, Platform } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function TabLayout() {
  const showAlert = () => {
    Alert.alert("Hello");
  };

  return (
    <>
      <Tabs screenOptions={{ tabBarActiveTintColor: '#0a7ea4' }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Notes',
            tabBarIcon: ({ color }) => <TabBarIcon name="document-text" color={color} />,
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabBarIcon name="settings-outline" color={color} />,
          }}
        />
      </Tabs>
      <TouchableOpacity style={styles.fab} onPress={showAlert}>
        <MaterialIcons name="add-circle" size={80} color="#0a7ea4" />
      </TouchableOpacity>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 10,
    left: '50%',
    marginLeft: -40,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 5,
  },
});
