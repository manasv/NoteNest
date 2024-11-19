import { Tabs } from "expo-router";
import { TabBarIcon } from "@/components/navigation/TabBarIcon";
import {
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  Modal,
  View,
  Text,
  Button,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useState } from "react";
import CreateNote from "@/app/create-note";

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);

  const openModal = () => {
    setModalVisible(true);
  };

  return (
    <>
      <Tabs screenOptions={{ tabBarActiveTintColor: "#0a7ea4" }}>
        <Tabs.Screen
          name="index"
          options={{
            title: "Notes",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="document-text" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: "Settings",
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="settings-outline" color={color} />
            ),
          }}
        />
      </Tabs>
      <TouchableOpacity style={styles.fab} onPress={openModal}>
        <View style={styles.circleBackground}>
          <MaterialIcons name="add-circle" size={80} color="#0a7ea4" />
        </View>
      </TouchableOpacity>

      <Modal
        animationType="slide"
        transparent={false}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
        presentationStyle="pageSheet"
      >
        <CreateNote
          onSave={() => setModalVisible(false)}
          onCancel={() => setModalVisible(false)}
        />
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fab: {
    position: "absolute",
    bottom: Platform.OS === "ios" ? 40 : 10,
    left: "50%",
    marginLeft: -40,
    alignItems: "center",
    justifyContent: "center",
    elevation: 5,
  },
  circleBackground: {
    width: 80,
    height: 80,
    borderRadius: 50,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
