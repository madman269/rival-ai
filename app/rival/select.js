import { View, Text, TouchableOpacity } from "react-native";
import { useRouter } from "expo-router";

export default function RivalSelect() {
  const router = useRouter();

  const options = [
    { label: "Aggressive", type: "aggressive" },
    { label: "Balanced", type: "balanced" },
    { label: "Respectful", type: "respectful" },
    { label: "Chaotic", type: "chaotic" }
  ];

  return (
    <View style={{ flex: 1, padding: 30, backgroundColor: "#000" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
        Choose Your Rival
      </Text>

      {options.map((opt, index) => (
        <TouchableOpacity
          key={index}
          onPress={() =>
            router.push({
              pathname: "/arc/setup",
              params: { rivalType: opt.type }
            })
          }
          style={{
            backgroundColor: "#111",
            padding: 18,
            borderRadius: 10,
            marginTop: 20
          }}
        >
          <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
