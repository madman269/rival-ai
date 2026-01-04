import { View, Text, TouchableOpacity, Alert } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const RIVAL_KEY = "RIVAL_AI_CURRENT_RIVAL";
const LOG_KEY = "RIVAL_AI_LOG_STATE";
const ARC_KEY = "RIVAL_AI_ARC_META";

export default function SettingsScreen() {
  const router = useRouter();

  const resetRival = async () => {
    Alert.alert(
      "Delete Rival?",
      "This will permanently delete your rival and reset progress.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(RIVAL_KEY);
            await AsyncStorage.removeItem(LOG_KEY);
            await AsyncStorage.removeItem(ARC_KEY);
            router.replace("/");
          }
        }
      ]
    );
  };

  const clearLogs = async () => {
    Alert.alert(
      "Clear Logbook?",
      "This will remove all logged entries. Rival remains.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            await AsyncStorage.removeItem(LOG_KEY);
            await AsyncStorage.removeItem(ARC_KEY);
            Alert.alert("Cleared", "Logbook reset.");
          }
        }
      ]
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 25 }}>
      
      {/* HEADER */}
      <Text style={{ color: "#E50914", fontSize: 14, fontWeight: "700" }}>
        SETTINGS
      </Text>
      <Text
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: "800",
          marginTop: 6
        }}
      >
        Control Room
      </Text>
      <Text style={{ color: "#777", marginTop: 6 }}>
        Manage your rival and progress.
      </Text>

      {/* SECTION */}
      <View style={{ marginTop: 40 }}>
        <Text
          style={{
            color: "#888",
            fontSize: 13,
            marginBottom: 10
          }}
        >
          PROGRESS
        </Text>

        <TouchableOpacity
          onPress={clearLogs}
          style={{
            backgroundColor: "#111",
            padding: 16,
            borderRadius: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: "#222"
          }}
        >
          <Text
            style={{
              color: "#fff",
              fontSize: 16,
              fontWeight: "600"
            }}
          >
            Reset Logbook
          </Text>
          <Text style={{ color: "#666", fontSize: 12, marginTop: 4 }}>
            Clears all logged sessions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetRival}
          style={{
            backgroundColor: "#1a0000",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#E50914"
          }}
        >
          <Text
            style={{
              color: "#E50914",
              fontSize: 16,
              fontWeight: "700"
            }}
          >
            Delete Rival
          </Text>
          <Text style={{ color: "#ffb3b3", fontSize: 12, marginTop: 4 }}>
            Permanently removes rival & progress
          </Text>
        </TouchableOpacity>
      </View>

      {/* FUTURE FEATURES */}
      <View style={{ marginTop: 40 }}>
        <Text style={{ color: "#888", fontSize: 13, marginBottom: 10 }}>
          COMING SOON
        </Text>

        <View
          style={{
            backgroundColor: "#0a0a0a",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#222"
          }}
        >
          <Text style={{ color: "#555", fontSize: 15 }}>
            • Notifications  
            {"\n"}• Rival Difficulty Scaling  
            {"\n"}• Cloud Sync  
            {"\n"}• Multiple Rivals
          </Text>
        </View>
      </View>

      {/* BACK */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          marginTop: "auto",
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#222"
        }}
      >
        <Text
          style={{
            color: "#aaa",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "600"
          }}
        >
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}
