import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { useRouter } from "expo-router";

const LOG_KEY = "RIVAL_AI_LOG_STATE";

export default function LogbookScreen() {
  const router = useRouter();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = async () => {
    const raw = await AsyncStorage.getItem(LOG_KEY);
    if (!raw) return;

    const parsed = JSON.parse(raw);
    setLogs(parsed.logs || []);
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 20 }}>
      
      {/* BACK BUTTON */}
      <TouchableOpacity onPress={() => router.back()}>
        <Text
          style={{
            color: "#888",
            fontSize: 16,
            fontWeight: "600",
            marginBottom: 10
          }}
        >
          ← Back
        </Text>
      </TouchableOpacity>

      {/* HEADER */}
      <Text
        style={{
          color: "#E50914",
          fontSize: 13,
          fontWeight: "800"
        }}
      >
        LOGBOOK
      </Text>

      <Text
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: "900",
          marginBottom: 20
        }}
      >
        Your Work vs Theirs
      </Text>

      {/* EMPTY STATE */}
      {logs.length === 0 && (
        <View
          style={{
            marginTop: 60,
            alignItems: "center"
          }}
        >
          <Text style={{ color: "#777", fontSize: 16 }}>
            No logs yet.
          </Text>
          <Text style={{ color: "#555", marginTop: 6 }}>
            The rival is waiting.
          </Text>
        </View>
      )}

      {/* LOG LIST */}
      <ScrollView>
        {logs.map((log, index) => {
          const isRival = log.sender === "rival";

          return (
            <View
              key={index}
              style={{
                backgroundColor: isRival ? "#1a0000" : "#111",
                borderRadius: 12,
                padding: 14,
                marginBottom: 12,
                borderLeftWidth: isRival ? 4 : 0,
                borderLeftColor: isRival ? "#E50914" : "transparent"
              }}
            >
              <Text
                style={{
                  color: isRival ? "#ffb3b3" : "#fff",
                  fontWeight: isRival ? "700" : "500",
                  fontSize: 15
                }}
              >
                {isRival ? "Rival" : "You"}
              </Text>

              <Text
                style={{
                  color: "#ddd",
                  marginTop: 6,
                  fontSize: 15
                }}
              >
                {log.text}
              </Text>

              {log.taunt && (
                <Text
                  style={{
                    color: "#E50914",
                    fontSize: 12,
                    fontStyle: "italic",
                    marginTop: 6
                  }}
                >
                  “{log.taunt}”
                </Text>
              )}

              {log.xp && (
                <Text
                  style={{
                    color: "#777",
                    fontSize: 12,
                    marginTop: 6
                  }}
                >
                  +{log.xp} XP
                </Text>
              )}
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}
