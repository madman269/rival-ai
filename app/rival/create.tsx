import { View, Text, TextInput, TouchableOpacity } from "react-native";
import { useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";

const RIVAL_KEY = "RIVAL_AI_CURRENT_RIVAL";

export default function CreateRivalScreen() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [sport, setSport] = useState<"gym" | "soccer" | "tennis">("gym");
  const [personality, setPersonality] = useState<
    "aggressive" | "mocking" | "cold" | "respectful"
  >("aggressive");

  const createRival = async () => {
    if (!name.trim()) return;

    const rival = {
      name,
      sport,
      personality,
      createdAt: Date.now(),
      level: 1,
      xp: 0
    };

    await AsyncStorage.setItem(RIVAL_KEY, JSON.stringify(rival));
    router.replace("/rival/room");
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 25 }}>

      {/* BACK BUTTON */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{ marginBottom: 20 }}
      >
        <Text
          style={{
            color: "#888",
            fontSize: 16,
            fontWeight: "600"
          }}
        >
          ← Back
        </Text>
      </TouchableOpacity>

      {/* HEADER */}
      <Text style={{ color: "#E50914", fontSize: 14, fontWeight: "700" }}>
        CREATE YOUR RIVAL
      </Text>
      <Text
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: "800",
          marginTop: 6
        }}
      >
        Name the one chasing you
      </Text>

      {/* NAME INPUT */}
      <Text style={{ color: "#888", marginTop: 25, marginBottom: 6 }}>
        Rival Name
      </Text>
      <TextInput
        value={name}
        onChangeText={setName}
        placeholder="e.g. Marcus"
        placeholderTextColor="#555"
        style={{
          backgroundColor: "#111",
          color: "#fff",
          padding: 14,
          borderRadius: 10,
          fontSize: 16
        }}
      />

      {/* SPORT SELECT */}
      <Text style={{ color: "#888", marginTop: 25, marginBottom: 10 }}>
        Arena
      </Text>
      {[
        { id: "gym", label: "🏋️ Gym" },
        { id: "soccer", label: "⚽ Soccer Field" },
        { id: "tennis", label: "🎾 Court" }
      ].map(opt => (
        <TouchableOpacity
          key={opt.id}
          onPress={() => setSport(opt.id as any)}
          style={{
            backgroundColor: sport === opt.id ? "#1a0000" : "#111",
            borderWidth: 1,
            borderColor: sport === opt.id ? "#E50914" : "#222",
            padding: 14,
            borderRadius: 10,
            marginBottom: 10
          }}
        >
          <Text style={{ color: "#fff", fontSize: 16 }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}

      {/* PERSONALITY */}
      <Text style={{ color: "#888", marginTop: 20, marginBottom: 10 }}>
        Personality
      </Text>
      {[
        { id: "aggressive", label: "Aggressive — pushes hard" },
        { id: "mocking", label: "Mocking — talks trash" },
        { id: "cold", label: "Cold — says less, does more" },
        { id: "respectful", label: "Respectful — competitive but fair" }
      ].map(opt => (
        <TouchableOpacity
          key={opt.id}
          onPress={() => setPersonality(opt.id as any)}
          style={{
            backgroundColor: personality === opt.id ? "#111" : "#0a0a0a",
            borderWidth: 1,
            borderColor: personality === opt.id ? "#00ff88" : "#222",
            padding: 14,
            borderRadius: 10,
            marginBottom: 8
          }}
        >
          <Text style={{ color: "#fff", fontSize: 15 }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}

      {/* CREATE BUTTON */}
      <TouchableOpacity
        onPress={createRival}
        style={{
          backgroundColor: "#E50914",
          padding: 18,
          borderRadius: 14,
          marginTop: "auto"
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 20,
            fontWeight: "800",
            textAlign: "center"
          }}
        >
          Create Rival
        </Text>
        <Text
          style={{
            color: "#ffcccc",
            fontSize: 12,
            textAlign: "center",
            marginTop: 4
          }}
        >
          You won’t outrun them.
        </Text>
      </TouchableOpacity>

    </View>
  );
}
