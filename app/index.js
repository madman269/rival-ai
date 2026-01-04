import { View, Text, TouchableOpacity, Image } from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const RIVAL_KEY = "RIVAL_AI_CURRENT_RIVAL";

export default function HomeScreen() {
  const router = useRouter();
 const [rival, setRival] = useState(null);


  useEffect(() => {
    loadRival();
  }, []);

  const loadRival = async () => {
    const raw = await AsyncStorage.getItem(RIVAL_KEY);
    if (raw) setRival(JSON.parse(raw));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 30 }}>
      
      {/* BRAND */}
      <View style={{ alignItems: "center", marginTop: 20 }}>
        <Image
          source={require("../assets/icon.png")}
          style={{ width: 90, height: 90, marginBottom: 15 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 34, fontWeight: "800", color: "#fff" }}>
          Rival.AI
        </Text>
        <Text style={{ color: "#888", marginTop: 6 }}>
          Someone is always ahead.
        </Text>
      </View>

      {/* MAIN ACTION */}
      <TouchableOpacity
        onPress={() =>
          rival
            ? router.push("/rival/room")
            : router.push("/rival/create")
        }
        style={{
          backgroundColor: "#E50914",
          padding: 18,
          borderRadius: 14,
          marginTop: 50
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: "700",
            textAlign: "center"
          }}
        >
          {rival ? "Enter Rival Room" : "Create Your Rival"}
        </Text>

        {rival && (
          <Text
            style={{
              color: "#ffcccc",
              fontSize: 13,
              textAlign: "center",
              marginTop: 4
            }}
          >
            {rival.name} • {rival.personality.toUpperCase()} • LV {rival.level}
          </Text>
        )}
      </TouchableOpacity>

      {/* SECONDARY ACTIONS */}
      <View style={{ marginTop: 25 }}>
        <TouchableOpacity
          onPress={() => router.push("/rival/create")}
          style={{
            borderWidth: 1,
            borderColor: "#E50914",
            padding: 15,
            borderRadius: 12,
            marginBottom: 15
          }}
        >
          <Text style={{ color: "#fff", fontSize: 18, textAlign: "center" }}>
            Create Rival
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/log")}
          style={{
            borderWidth: 1,
            borderColor: "#222",
            padding: 15,
            borderRadius: 12
          }}
        >
          <Text style={{ color: "#aaa", fontSize: 18, textAlign: "center" }}>
            Logbook
          </Text>
        </TouchableOpacity>
      </View>

      {/* FOOTER ACTIONS */}
      <View style={{ marginTop: "auto", paddingBottom: 20 }}>
        <TouchableOpacity
          onPress={() => router.push("/shop")}
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
              fontSize: 17,
              textAlign: "center",
              fontWeight: "600"
            }}
          >
            Shop
          </Text>
          <Text
            style={{
              color: "#777",
              fontSize: 12,
              textAlign: "center",
              marginTop: 4
            }}
          >
            Skins • Rival Arenas • Cosmetics
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/settings")}
          style={{
            backgroundColor: "#111",
            padding: 16,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: "#222"
          }}
        >
          <Text
            style={{
              color: "#aaa",
              fontSize: 17,
              textAlign: "center",
              fontWeight: "600"
            }}
          >
            Settings
          </Text>
          <Text
            style={{
              color: "#666",
              fontSize: 12,
              textAlign: "center",
              marginTop: 4
            }}
          >
            Preferences • Notifications • Data
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
