import { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert } from "react-native";
import { useRouter } from "expo-router";
import { createGame } from "../../lib/rivalGame";

const RED = "#E50914";
const card = { padding: 15, marginTop: 9, borderRadius: 12 } as const;

export default function CreateRivalScreen() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [sport, setSport] = useState<"gym" | "soccer" | "tennis">("gym");
  const [personality, setPersonality] = useState<"aggressive" | "mocking" | "cold" | "respectful">("aggressive");
  const [days, setDays] = useState(14);
  const [creating, setCreating] = useState(false);

  const start = async () => {
    if (creating) return;
    if (!name.trim()) {
      Alert.alert("Choose a name", "Your rival needs a name before the battle begins.");
      return;
    }
    setCreating(true);
    try {
      await createGame({ name, sport, personality, durationDays: days });
      router.replace("/rival/room");
    } catch (error: any) {
      Alert.alert("Could not create rival", error?.message || "Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const option = (label: string, value: string | number, selected: boolean, onPress: () => void) => (
    <TouchableOpacity
      key={String(value)}
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={[card, { backgroundColor: selected ? "#21090b" : "#151515", borderWidth: 1, borderColor: selected ? RED : "#303030" }]}
    >
      <Text style={{ color: selected ? "#fff" : "#aaa", fontSize: 15, fontWeight: selected ? "700" : "500" }}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#050505" }}>
      <ScrollView contentContainerStyle={{ padding: 24, paddingBottom: 48 }}>
        <TouchableOpacity onPress={() => router.back()}><Text style={{ color: "#aaa", fontSize: 16 }}>← Back</Text></TouchableOpacity>
        <Text style={{ color: RED, fontSize: 13, fontWeight: "800", marginTop: 30, letterSpacing: 2 }}>RIVAL.AI / NEW ARC</Text>
        <Text style={{ color: "#fff", fontSize: 34, fontWeight: "900", marginTop: 8 }}>Build your opponent.</Text>
        <Text style={{ color: "#999", fontSize: 15, marginTop: 10, lineHeight: 22 }}>Log your actual work. Face a simulated rival. Win the arc with consistency.</Text>

        <Text style={{ color: "#ccc", fontSize: 15, fontWeight: "700", marginTop: 28 }}>Rival name</Text>
        <TextInput
          value={name} onChangeText={setName} maxLength={30}
          autoCapitalize="words" placeholder="e.g. Shadow" placeholderTextColor="#777"
          style={{ color: "#fff", fontSize: 17, marginTop: 9, padding: 16, backgroundColor: "#151515", borderRadius: 12 }}
        />

        <Text style={{ color: "#ccc", fontSize: 15, fontWeight: "700", marginTop: 28 }}>Arena</Text>
        {option("🏋️  Gym", "gym", sport === "gym", () => setSport("gym"))}
        {option("⚽  Soccer", "soccer", sport === "soccer", () => setSport("soccer"))}
        {option("🎾  Tennis", "tennis", sport === "tennis", () => setSport("tennis"))}

        <Text style={{ color: "#ccc", fontSize: 15, fontWeight: "700", marginTop: 28 }}>Personality</Text>
        {option("Aggressive — intense pressure", "aggressive", personality === "aggressive", () => setPersonality("aggressive"))}
        {option("Mocking — competitive trash talk", "mocking", personality === "mocking", () => setPersonality("mocking"))}
        {option("Cold — few words, high standards", "cold", personality === "cold", () => setPersonality("cold"))}
        {option("Respectful — supportive competition", "respectful", personality === "respectful", () => setPersonality("respectful"))}

        <Text style={{ color: "#ccc", fontSize: 15, fontWeight: "700", marginTop: 28 }}>Battle duration</Text>
        <View style={{ flexDirection: "row", gap: 9 }}>
          {[7, 14, 30].map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setDays(n)}
              style={{ flex: 1, marginTop: 10, padding: 13, alignItems: "center", borderRadius: 12, borderWidth: 1, backgroundColor: days === n ? "#21090b" : "#151515", borderColor: days === n ? RED : "#303030" }}
            >
              <Text style={{ color: "#fff", fontWeight: "800" }}>{n} DAYS</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          disabled={creating} onPress={start}
          style={{ backgroundColor: RED, marginTop: 35, borderRadius: 14, padding: 19, opacity: creating ? 0.5 : 1 }}
        >
          <Text style={{ textAlign: "center", color: "white", fontSize: 18, fontWeight: "900" }}>
            {creating ? "Creating…" : "START YOUR ARC →"}
          </Text>
        </TouchableOpacity>
        <Text style={{ textAlign: "center", color: "#777", marginTop: 12, lineHeight: 19 }}>
          Rival training scores are simulated. Only your logged sessions represent real activity.
        </Text>
      </ScrollView>
    </View>
  );
}
