import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import * as Speech from "expo-speech";
import { getRivalSpeech } from "../rival/rivalSpeech";

export default function ArcResult() {
  const router = useRouter();
  const { playerXP, rivalXP, rivalType } = useLocalSearchParams();

  const pXP = Number(playerXP);
  const rXP = Number(rivalXP);

  let resultKey = "draw";
  let title = "DRAW";
  let color = "#fff";

  if (pXP > rXP) {
    resultKey = "win";
    title = "VICTORY";
    color = "#00ff88";
  } else if (pXP < rXP) {
    resultKey = "lose";
    title = "DEFEAT";
    color = "#E50914";
  }

  const speechText = getRivalSpeech({
    result: resultKey,
    rivalType: rivalType || "balanced"
  });

  // Voice tuning per rival personality
  const voiceSettings = {
    aggressive: { rate: 0.95, pitch: 0.8 },
    respectful: { rate: 1.0, pitch: 1.0 },
    balanced: { rate: 1.0, pitch: 0.95 },
    chaotic: { rate: 1.15, pitch: 1.2 }
  };

  const speak = () => {
    Speech.stop();
    Speech.speak(speechText, {
      rate: voiceSettings[rivalType]?.rate || 1,
      pitch: voiceSettings[rivalType]?.pitch || 1
    });
  };

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#000",
        padding: 30,
        justifyContent: "center"
      }}
    >
      <Text
        style={{
          fontSize: 36,
          fontWeight: "bold",
          color,
          textAlign: "center"
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          marginTop: 20,
          fontSize: 18,
          color: "#aaa",
          textAlign: "center"
        }}
      >
        You: {pXP} XP · Rival: {rXP} XP
      </Text>

      {/* RIVAL SPEECH */}
      <View
        style={{
          marginTop: 40,
          padding: 20,
          backgroundColor: "#111",
          borderRadius: 12
        }}
      >
        <Text style={{ color: "#E50914", marginBottom: 6 }}>
          Rival says:
        </Text>
        <Text style={{ color: "#fff", fontStyle: "italic" }}>
          “{speechText}”
        </Text>

        <TouchableOpacity
          onPress={speak}
          style={{
            marginTop: 15,
            backgroundColor: "#1a0000",
            padding: 12,
            borderRadius: 8
          }}
        >
          <Text style={{ color: "#E50914", textAlign: "center" }}>
            🔊 Play Voice
          </Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        onPress={() => router.replace("/")}
        style={{
          marginTop: 50,
          backgroundColor: "#111",
          padding: 16,
          borderRadius: 10
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>
          Start New Arc
        </Text>
      </TouchableOpacity>
    </View>
  );
}
