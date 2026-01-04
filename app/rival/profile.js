import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { generateRival } from "./generate";

export default function RivalProfile() {
  const { days, rivalType } = useLocalSearchParams();
  const router = useRouter();

  // Generate rival based on selected personality
  const rival = generateRival(rivalType);

  return (
    <View style={{ flex: 1, padding: 30, backgroundColor: "#000" }}>

      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
        Your Rival Awaits
      </Text>

      <View style={{ marginTop: 20 }}>
        <Text style={{ fontSize: 22, fontWeight: "600", color: "#fff" }}>
          {rival.name}
        </Text>

        <Text
          style={{
            marginTop: 10,
            fontSize: 16,
            opacity: 0.7,
            color: "#fff"
          }}
        >
          {rival.intro}
        </Text>

        <Text style={{ marginTop: 30, fontSize: 16, color: "#E50914" }}>
          Arc Length: {days} days
        </Text>

        <Text style={{ marginTop: 10, fontSize: 14, color: "#777" }}>
          Rival Type: {rival.type}
        </Text>
      </View>

      <TouchableOpacity
        onPress={() =>
          router.push({
            pathname: "/logs/log",
            params: { rivalType }
          })
        }
        style={{
          backgroundColor: "#E50914",
          padding: 15,
          borderRadius: 10,
          marginTop: 40
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>
          Start Logging
        </Text>
      </TouchableOpacity>

    </View>
  );
}
