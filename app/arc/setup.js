import { View, Text, TouchableOpacity } from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useState } from "react";

export default function ArcSetup() {
  const router = useRouter();
  const { rivalType } = useLocalSearchParams();
  const [selected, setSelected] = useState(null);

  const arcOptions = [
    { label: "1-Day Arc", value: 1 },
    { label: "3-Day Mini Arc", value: 3 },
    { label: "7-Day Battle", value: 7 },
    { label: "30-Day Season", value: 30 }
  ];

  const confirmArc = () => {
    if (!selected) return;

    router.push({
      pathname: "/rival/profile",
      params: {
        days: selected,
        rivalType
      }
    });
  };

  return (
    <View style={{ flex: 1, padding: 30, backgroundColor: "#000" }}>
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
        Choose Your Arc
      </Text>

      {arcOptions.map((opt, index) => (
        <TouchableOpacity
          key={index}
          onPress={() => setSelected(opt.value)}
          style={{
            padding: 18,
            marginTop: 20,
            borderRadius: 10,
            backgroundColor: selected === opt.value ? "#E50914" : "#111"
          }}
        >
          <Text
            style={{
              color: selected === opt.value ? "#fff" : "#bbb",
              textAlign: "center",
              fontSize: 18
            }}
          >
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        onPress={confirmArc}
        style={{
          backgroundColor: selected ? "#E50914" : "#333",
          padding: 18,
          marginTop: 40,
          borderRadius: 10
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>
          Continue
        </Text>
      </TouchableOpacity>
    </View>
  );
}
