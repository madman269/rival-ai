import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";
import RivalStatusCard from "../../components/ui/RivalStatusCard";
import { generateRivalResponse } from "../rival/rivalResponse";
import { getContextualTaunt } from "../rival/taunts";

const STORAGE_KEY = "RIVAL_AI_LOG_STATE";
const ARC_KEY = "RIVAL_AI_ARC_META";

/* ---------------- LEVEL & RANK ---------------- */

const getLevel = xp => Math.floor(xp / 100) + 1;

const getRank = level => {
  if (level >= 15) return "Apex";
  if (level >= 10) return "Diamond";
  if (level >= 7) return "Platinum";
  if (level >= 5) return "Gold";
  if (level >= 3) return "Silver";
  return "Bronze";
};

/* ---------------- TIMER HELPERS ---------------- */

const formatTimeRemaining = ms => {
  if (ms <= 0) return "Arc Complete";

  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);

  if (days > 0) return `${days}d ${hours}h remaining`;
  return `${hours}h remaining`;
};

export default function LogScreen() {
  const router = useRouter();
  const { rivalType, days } = useLocalSearchParams();

  const [entry, setEntry] = useState("");
  const [logs, setLogs] = useState([]);
  const [playerXP, setPlayerXP] = useState(0);
  const [rivalXP, setRivalXP] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState("");
  const [arcProgress, setArcProgress] = useState(0);

  const rival = { type: rivalType || "balanced" };

  /* ---------------- ANIMATIONS ---------------- */

  const xpAnim = useRef(new Animated.Value(0)).current;
  const xpOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const playXPPop = () => {
    xpAnim.setValue(0);
    xpOpacity.setValue(1);

    Animated.parallel([
      Animated.timing(xpAnim, {
        toValue: -30,
        duration: 600,
        useNativeDriver: true
      }),
      Animated.timing(xpOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true
      })
    ]).start();
  };

  const playShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnim, { toValue: 10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -10, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: -6, duration: 50, useNativeDriver: true }),
      Animated.timing(shakeAnim, { toValue: 0, duration: 50, useNativeDriver: true })
    ]).start();
  };

  /* ---------------- ARC INIT ---------------- */

  useEffect(() => {
    loadState();
    initArcIfNeeded();
  }, []);

  useEffect(() => {
    saveState();
    checkArcEnd();
  }, [logs, playerXP, rivalXP]);

  /* ---------------- TIMER + PROGRESS ---------------- */

  useEffect(() => {
    let interval;

    const updateTimer = async () => {
      const metaRaw = await AsyncStorage.getItem(ARC_KEY);
      if (!metaRaw) return;

      const { startTime, durationDays } = JSON.parse(metaRaw);

      const totalMs = durationDays * 86400000;
      const elapsedMs = Date.now() - startTime;
      const remainingMs = totalMs - elapsedMs;

      setTimeRemaining(formatTimeRemaining(remainingMs));
      setArcProgress(Math.min(Math.max(elapsedMs / totalMs, 0), 1));
    };

    updateTimer();
    interval = setInterval(updateTimer, 60000);

    return () => clearInterval(interval);
  }, []);

  const initArcIfNeeded = async () => {
    const existing = await AsyncStorage.getItem(ARC_KEY);
    if (existing) return;

    await AsyncStorage.setItem(
      ARC_KEY,
      JSON.stringify({
        startTime: Date.now(),
        durationDays: Number(days) || 1
      })
    );
  };

  const checkArcEnd = async () => {
    const metaRaw = await AsyncStorage.getItem(ARC_KEY);
    if (!metaRaw) return;

    const { startTime, durationDays } = JSON.parse(metaRaw);
    if (Date.now() >= startTime + durationDays * 86400000) {
      router.replace({
        pathname: "/arc/result",
        params: { playerXP, rivalXP, rivalType }
      });
    }
  };

  /* ---------------- STORAGE ---------------- */

  const loadState = async () => {
    const saved = await AsyncStorage.getItem(STORAGE_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);
    setLogs(parsed.logs || []);
    setPlayerXP(parsed.playerXP || 0);
    setRivalXP(parsed.rivalXP || 0);
  };

  const saveState = async () => {
    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ logs, playerXP, rivalXP })
    );
  };

  /* ---------------- XP ---------------- */

  const getRivalXP = () => {
    if (rival.type === "aggressive") return 12;
    if (rival.type === "respectful") return 8;
    if (rival.type === "chaotic") return Math.floor(Math.random() * 7) + 8;
    return 10;
  };

  const addLog = () => {
    if (!entry.trim()) return;

    const userXP = 10;
    const rivalXPValue = getRivalXP();

    setPlayerXP(p => p + userXP);
    setRivalXP(r => r + rivalXPValue);

    setLogs(l => [
      {
        sender: "rival",
        ...generateRivalResponse(entry, rival),
        xp: rivalXPValue,
        taunt:
          Math.random() < 0.8
            ? getContextualTaunt({
                rivalType: rival.type,
                playerXP,
                rivalXP,
                userXP,
                rivalXPValue
              })
            : null
      },
      {
        sender: "you",
        text: entry,
        timestamp: new Date().toLocaleTimeString(),
        xp: userXP
      },
      ...l
    ]);

    setEntry("");
    playXPPop();
    if (rivalXPValue > userXP) playShake();
  };

  /* ---------------- DERIVED ---------------- */

  const playerLevel = getLevel(playerXP);
  const rivalLevel = getLevel(rivalXP);

  const playerRank = getRank(playerLevel);
  const rivalRank = getRank(rivalLevel);

  /* ---------------- UI ---------------- */

  return (
    <Animated.View
      style={{
        flex: 1,
        padding: 25,
        backgroundColor: "#000",
        transform: [{ translateX: shakeAnim }]
      }}
    >
      <Text style={{ fontSize: 28, fontWeight: "bold", color: "#fff" }}>
        Your Log
      </Text>

      <RivalStatusCard
        playerXP={playerXP}
        rivalXP={rivalXP}
        playerLevel={playerLevel}
        rivalLevel={rivalLevel}
        playerRank={playerRank}
        rivalRank={rivalRank}
      />

      <Text style={{ color: "#aaa", marginTop: 6, fontSize: 13, textAlign: "center" }}>
        ⏱️ {timeRemaining}
      </Text>

      {/* PROGRESS BAR */}
      <View
        style={{
          height: 8,
          backgroundColor: "#111",
          borderRadius: 10,
          overflow: "hidden",
          marginTop: 10
        }}
      >
        <View
          style={{
            height: "100%",
            width: `${arcProgress * 100}%`,
            backgroundColor: arcProgress > 0.85 ? "#E50914" : "#00ff88"
          }}
        />
      </View>

      <TextInput
        value={entry}
        onChangeText={setEntry}
        placeholder="What did you do?"
        placeholderTextColor="#777"
        style={{
          backgroundColor: "#111",
          color: "#fff",
          padding: 15,
          borderRadius: 10,
          marginTop: 20
        }}
      />

      <TouchableOpacity
        onPress={addLog}
        style={{
          backgroundColor: "#E50914",
          padding: 15,
          borderRadius: 10,
          marginTop: 15
        }}
      >
        <Text style={{ color: "#fff", textAlign: "center", fontSize: 18 }}>
          Add Log Entry
        </Text>
      </TouchableOpacity>

      <ScrollView style={{ marginTop: 30 }}>
        {logs.map((log, index) => (
          <View
            key={index}
            style={{
              backgroundColor: log.sender === "rival" ? "#1a0000" : "#111",
              borderRadius: 12,
              padding: 14,
              marginBottom: 12
            }}
          >
            <Text style={{ color: "#fff" }}>
              {log.sender === "rival" ? "Rival: " : "You: "}
              {log.text}
            </Text>

            {log.taunt && (
              <Text style={{ color: "#E50914", fontSize: 12, fontStyle: "italic" }}>
                “{log.taunt}”
              </Text>
            )}

            <Text style={{ color: "#777", fontSize: 12 }}>+{log.xp} XP</Text>
          </View>
        ))}
      </ScrollView>
    </Animated.View>
  );
}
