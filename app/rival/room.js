import { fetchRivalReply } from "../src/api/rivalApi"; // ✅ correct path if rivalApi.js is in app/api/
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ImageBackground,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import { useRouter } from "expo-router";

const RIVAL_KEY = "RIVAL_AI_CURRENT_RIVAL";

/* ---------------- FALLBACK RESPONSES (if API fails) ---------------- */

const getFallbackReply = personality => {
  switch (personality) {
    case "aggressive":
      return "That’s all? I already doubled it.";
    case "mocking":
      return "Cute effort. You sure that counts?";
    case "cold":
      return "Noted. I trained longer.";
    case "respectful":
      return "Good work. Don’t slow down.";
    default:
      return "I’m still ahead.";
  }
};

/* ---------------- MAP YOUR PERSONALITIES → AI RIVALS ---------------- */
// Your current personalities: aggressive / mocking / cold / respectful
// Backend rivals: TYRANT / SILENT_PRO / FALLEN_LEGEND
const mapPersonalityToRivalId = personality => {
  switch (personality) {
    case "aggressive":
      return "TYRANT";
    case "cold":
      return "SILENT_PRO";
    case "mocking":
      return "FALLEN_LEGEND";
    case "respectful":
      return "SILENT_PRO";
    default:
      return "TYRANT";
  }
};

/* ---------------- ARENA BACKGROUNDS ---------------- */

const arenaMap = {
  gym: require("../../assets/arenas/gym.jpg"),
  soccer: require("../../assets/arenas/soccer.jpg"),
  tennis: require("../../assets/arenas/court.jpg")
};

// Helper: build a better prompt payload so the rival doesn't go flat
const buildDailyLogPayload = ({ rival, userText }) => {
  const sportName =
    rival?.sport === "gym"
      ? "gym"
      : rival?.sport === "soccer"
      ? "soccer"
      : "tennis";

  const personality = rival?.personality || "unknown";
  const level = rival?.level ?? 1;

  return `
DAILY LOG (Rival.AI)

Context:
- Rival name: ${rival?.name || "unknown"}
- Rival personality: ${personality}
- Rival level: ${level}
- Arena: ${sportName}

User entry:
"${userText}"

Rules for your reply:
- Be the rival. Stay in character.
- Respond with 1–2 short lines max.
- Always compare effort using a concrete axis (volume/time/intensity/consistency).
- If the user asks "how/why", either:
  (a) give ONE metric, or
  (b) demand the missing metric in one sentence.
- End with: "Next move: <one specific action>" (<= 12 words).
`;
};

export default function RivalRoom() {
  const router = useRouter();

  const [rival, setRival] = useState(null);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    loadRival();
  }, []);

  const loadRival = async () => {
    const raw = await AsyncStorage.getItem(RIVAL_KEY);
    if (!raw) return;

    const storedRival = JSON.parse(raw);
    setRival(storedRival);

    setMessages([
      {
        sender: "rival",
        text:
          storedRival.personality === "aggressive"
            ? "You’re late. I already trained."
            : storedRival.personality === "mocking"
            ? "Took you long enough."
            : storedRival.personality === "cold"
            ? "You’re behind."
            : "Ready when you are."
      }
    ]);
  };

  const submitLog = async () => {
    if (!message.trim() || !rival || isSending) return;

    const userTextRaw = message.trim();
    setMessage("");

    // 1) Immediately show the user's message
    setMessages(prev => [...prev, { sender: "you", text: userTextRaw }]);
    setIsSending(true);

    try {
      const rivalId = mapPersonalityToRivalId(rival.personality);

      // Lightweight memory stub (expand later)
      const memory = {
        goals: [
          rival.sport === "gym" ? "Train consistently" : `Improve at ${rival.sport}`
        ],
        streak: 0,
        missedDays14: 0,
        excuses: [],
        lastPromise: "",
        lastAction: userTextRaw,
        premium: false
      };

      // ✅ Wrapped payload so the rival has structure to respond to
      const userText = buildDailyLogPayload({ rival, userText: userTextRaw });

      // 2) Call backend AI
      const reply = await fetchRivalReply({
        rivalId,
        userText,
        memory
      });

      // 3) Show rival response
      setMessages(prev => [...prev, { sender: "rival", text: reply || "…" }]);
    } catch (e) {
      console.log("Rival API failed:", e?.message);

      // Fallback so experience doesn't break
      setMessages(prev => [
        ...prev,
        { sender: "rival", text: getFallbackReply(rival.personality) }
      ]);
    } finally {
      setIsSending(false);
    }
  };

  if (!rival) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          justifyContent: "center",
          alignItems: "center"
        }}
      >
        <Text style={{ color: "#fff", fontSize: 16 }}>
          No rival found. Create one first.
        </Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={arenaMap[rival.sport]}
      style={{ flex: 1 }}
      resizeMode="cover"
    >
      {/* DARK OVERLAY */}
      <View
        style={{
          flex: 1,
          padding: 20,
          backgroundColor: "rgba(0,0,0,0.85)"
        }}
      >
        {/* BACK BUTTON */}
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginBottom: 10 }}
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
        <View style={{ marginBottom: 15 }}>
          <Text
            style={{
              color: "#E50914",
              fontWeight: "800",
              fontSize: 13
            }}
          >
            {rival.personality.toUpperCase()} RIVAL • LV {rival.level}
          </Text>

          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "900"
            }}
          >
            {rival.name}
          </Text>

          <Text style={{ color: "#777", marginTop: 4 }}>
            {rival.sport === "gym"
              ? "Iron Gym"
              : rival.sport === "soccer"
              ? "Training Pitch"
              : "Practice Court"}
          </Text>
        </View>

        {/* CHAT */}
        <ScrollView style={{ flex: 1 }}>
          {messages.map((msg, i) => (
            <View
              key={i}
              style={{
                alignSelf: msg.sender === "you" ? "flex-end" : "flex-start",
                backgroundColor: msg.sender === "you" ? "#222" : "#1a0000",
                padding: 12,
                borderRadius: 10,
                marginBottom: 10,
                maxWidth: "80%"
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15 }}>{msg.text}</Text>
            </View>
          ))}
        </ScrollView>

        {/* INPUT */}
        <View style={{ marginTop: 10 }}>
          <TextInput
            value={message}
            onChangeText={setMessage}
            placeholder="Log your work..."
            placeholderTextColor="#777"
            editable={!isSending}
            style={{
              backgroundColor: "#111",
              color: "#fff",
              padding: 14,
              borderRadius: 10,
              opacity: isSending ? 0.7 : 1
            }}
          />

          <TouchableOpacity
            onPress={submitLog}
            disabled={isSending}
            style={{
              backgroundColor: "#E50914",
              padding: 14,
              borderRadius: 10,
              marginTop: 8,
              opacity: isSending ? 0.7 : 1
            }}
          >
            <Text
              style={{
                color: "#fff",
                textAlign: "center",
                fontWeight: "800"
              }}
            >
              {isSending ? "Thinking..." : "Submit"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </ImageBackground>
  );
}
