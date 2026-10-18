import { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator, Alert, ImageBackground, KeyboardAvoidingView, Platform,
  ScrollView, Text, TextInput, TouchableOpacity, View,
} from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import RivalStatusCard from "../../components/ui/RivalStatusCard";
import { fetchRivalReply } from "../src/api/rivalApi";
import {
  addMessage, buildMemory, getStatus, readGame, recordTraining, saveState,
} from "../../lib/rivalGame";

const RED = "#E50914";
const arenaMap = {
  gym: require("../../assets/arenas/gym.jpg"),
  soccer: require("../../assets/arenas/soccer.jpg"),
  tennis: require("../../assets/arenas/court.jpg"),
};
const personalityId = { aggressive: "TYRANT", mocking: "FALLEN_LEGEND", cold: "SILENT_PRO", respectful: "SILENT_PRO" };
const activityHints = { gym: "Strength training", soccer: "Soccer practice", tennis: "Tennis practice" };
const label = { fontSize: 13, fontWeight: "800", color: "#aaa", letterSpacing: 1 };
const input = { color: "#fff", backgroundColor: "#161616", borderColor: "#333", borderWidth: 1, borderRadius: 12, padding: 15, fontSize: 16 };
const primary = { backgroundColor: RED, padding: 15, alignItems: "center", borderRadius: 12 };

export default function RivalRoom() {
  const router = useRouter();
  const [rival, setRival] = useState(null);
  const [game, setGame] = useState(null);
  const [tab, setTab] = useState("training");
  const [activity, setActivity] = useState("");
  const [minutes, setMinutes] = useState("");
  const [detail, setDetail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);
  const busyRef = useRef(false);

  useFocusEffect(useCallback(() => {
    let active = true;
    readGame()
      .then(({ rival: loadedRival, state }) => {
        if (!active) return;
        setRival(loadedRival);
        setGame(state);
        if (loadedRival) setActivity(activityHints[loadedRival.sport] || "Training");
      })
      .catch((error) => active && Alert.alert("Unable to load progress", error?.message || "Please try again."))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []));

  const commit = async (next) => {
    await saveState(next);
    setGame(next);
  };

  const submitSession = async () => {
    if (busyRef.current || !rival || !game) return;
    busyRef.current = true;
    setBusy(true);
    try {
      const { next } = recordTraining(rival, game, { activity, minutes: Number(minutes), detail });
      await commit(next);
      setMinutes("");
      setDetail("");
      setTab("chat");
    } catch (error) {
      Alert.alert("Training not recorded", error?.message || "Please try again.");
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  };

  const submitChat = async () => {
    const text = message.trim();
    if (!text || !rival || !game || busyRef.current) return;
    busyRef.current = true;
    setBusy(true);
    setMessage("");
    try {
      const withUser = addMessage(game, "you", text);
      await commit(withUser);
      let reply;
      try {
        reply = await fetchRivalReply({
          rivalId: personalityId[rival.personality] || "TYRANT",
          userText: text,
          memory: buildMemory(rival, withUser),
        });
      } catch (error) {
        const detail = error?.message || "Check your backend connection.";
        reply = "AI chat is offline. Your training score is still saved. " + detail;
      }
      await commit(addMessage(withUser, "rival", reply));
    } catch (error) {
      Alert.alert("Could not save message", error?.message || "Try again.");
    } finally {
      setBusy(false);
      busyRef.current = false;
    }
  };

  if (loading) {
    return <View style={{ flex: 1, backgroundColor: "#050505", justifyContent: "center" }}><ActivityIndicator color={RED} size="large" /></View>;
  }
  if (!rival || !game) {
    return (
      <View style={{ flex: 1, backgroundColor: "#050505", padding: 30, justifyContent: "center" }}>
        <Text style={{ fontSize: 25, color: "#fff", fontWeight: "800" }}>No rival yet.</Text>
        <TouchableOpacity onPress={() => router.replace("/rival/create")} style={{ ...primary, marginTop: 22 }}>
          <Text style={{ color: "#fff", fontWeight: "800" }}>Create Your Rival</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const status = getStatus(rival, game);
  const finished = status.ended;
  return (
    <ImageBackground source={arenaMap[rival.sport] || arenaMap.gym} style={{ flex: 1 }} resizeMode="cover">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.91)" }}
      >
        <View style={{ flex: 1, paddingHorizontal: 18, paddingTop: 20, paddingBottom: 14 }}>
          <TouchableOpacity onPress={() => router.replace("/")} style={{ paddingBottom: 12 }}>
            <Text style={{ color: "#aaa", fontSize: 15 }}>← Home</Text>
          </TouchableOpacity>
          <Text style={{ color: RED, fontWeight: "900", letterSpacing: 2, fontSize: 12 }}>
            {rival.personality.toUpperCase()} · {rival.sport.toUpperCase()} · {status.daysLeft} DAYS LEFT
          </Text>
          <Text style={{ color: "#fff", fontWeight: "900", fontSize: 30, marginTop: 5 }}>{rival.name}</Text>
          <RivalStatusCard
            playerXP={status.playerXP} rivalXP={status.rivalXP}
            playerLevel={status.playerLevel} rivalLevel={status.rivalLevel}
            playerRank={"Level " + status.playerLevel} rivalRank={"Level " + status.rivalLevel}
          />
          <View style={{ flexDirection: "row", justifyContent: "space-around", paddingVertical: 13 }}>
            <Text style={{ color: "#eee", fontWeight: "700" }}>🔥 {status.streak}-day streak</Text>
            <Text style={{ color: "#aaa", fontWeight: "700" }}>✓ {status.trainedDays} active days</Text>
            <Text style={{ color: "#aaa", fontWeight: "700" }}>⌛ {status.daysLeft} left</Text>
          </View>

          {finished ? (
            <View style={{ backgroundColor: "#111", borderColor: "#333", borderWidth: 1, borderRadius: 14, padding: 20, marginTop: 12 }}>
              <Text style={{ color: status.outcome === "VICTORY" ? "#4ade80" : RED, textAlign: "center", fontSize: 29, fontWeight: "900" }}>{status.outcome}</Text>
              <Text style={{ color: "#bbb", textAlign: "center", marginTop: 9 }}>Arc complete · Your {status.playerXP} XP vs simulated rival {status.rivalXP} XP</Text>
              <TouchableOpacity onPress={() => router.push("/rival/create")} style={{ ...primary, marginTop: 19 }}>
                <Text style={{ color: "#fff", fontSize: 16, fontWeight: "900" }}>START A NEW ARC</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/log")} style={{ padding: 15 }}>
                <Text style={{ color: "#ccc", textAlign: "center" }}>See your logbook →</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <View style={{ flexDirection: "row", marginVertical: 8, backgroundColor: "#121212", borderRadius: 11, padding: 4 }}>
                {[["training", "LOG TRAINING"], ["chat", "RIVAL CHAT"]].map(([key, text]) => (
                  <TouchableOpacity key={key} onPress={() => setTab(key)}
                    style={{ flex: 1, paddingVertical: 12, borderRadius: 9, backgroundColor: tab === key ? RED : "transparent" }}>
                    <Text style={{ color: tab === key ? "#fff" : "#aaa", textAlign: "center", fontWeight: "900", fontSize: 12 }}>{text}</Text>
                  </TouchableOpacity>
                ))}
              </View>
              {tab === "training" ? (
                <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingTop: 13, paddingBottom: 35 }}>
                  <Text style={label}>WHAT DID YOU DO?</Text>
                  <TextInput style={{ ...input, marginTop: 9 }} value={activity} maxLength={45} onChangeText={setActivity} placeholder="Activity" placeholderTextColor="#777" />
                  <Text style={{ ...label, marginTop: 18 }}>DURATION · MINUTES</Text>
                  <TextInput style={{ ...input, marginTop: 9 }} value={minutes} onChangeText={setMinutes}
                    keyboardType="number-pad" maxLength={3} placeholder="e.g. 45" placeholderTextColor="#777" />
                  <Text style={{ ...label, marginTop: 18 }}>NOTES · OPTIONAL</Text>
                  <TextInput style={{ ...input, marginTop: 9, minHeight: 84, textAlignVertical: "top" }}
                    value={detail} onChangeText={setDetail} multiline maxLength={280}
                    placeholder="What did you work on?" placeholderTextColor="#777" />
                  <TouchableOpacity onPress={submitSession} disabled={busy} style={{ ...primary, marginTop: 20, opacity: busy ? 0.5 : 1 }}>
                    <Text style={{ color: "#fff", fontWeight: "900", fontSize: 17 }}>{busy ? "Saving…" : "CLAIM YOUR XP →"}</Text>
                  </TouchableOpacity>
                  <Text style={{ color: "#888", textAlign: "center", marginTop: 11, fontSize: 12, lineHeight: 18 }}>
                    Your first log of the day earns bonus XP. Additional logs earn 5 XP. Scores represent a game, not verified workouts.
                  </Text>
                </ScrollView>
              ) : (
                <>
                  <ScrollView ref={scrollRef} style={{ flex: 1 }} contentContainerStyle={{ paddingVertical: 10 }}
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}>
                    {(game.messages || []).map((m) => (
                      <View key={m.id}
                        style={{
                          alignSelf: m.role === "you" ? "flex-end" : "flex-start",
                          maxWidth: "88%", backgroundColor: m.role === "you" ? "#252525" : "#26080b",
                          padding: 13, borderRadius: 14, marginBottom: 12,
                          borderColor: m.role === "you" ? "#333" : "#602126", borderWidth: 1,
                        }}>
                        <Text style={{ color: m.role === "you" ? "#aaa" : "#ff8f98", fontWeight: "800", marginBottom: 4, fontSize: 11 }}>
                          {m.role === "you" ? "YOU" : rival.name.toUpperCase()}
                        </Text>
                        <Text style={{ color: "#fff", fontSize: 15, lineHeight: 21 }}>{m.text}</Text>
                      </View>
                    ))}
                    {busy && <ActivityIndicator color={RED} style={{ marginTop: 8 }} />}
                  </ScrollView>
                  <View style={{ flexDirection: "row", alignItems: "flex-end", gap: 8, marginTop: 8 }}>
                    <TextInput style={{ ...input, flex: 1, maxHeight: 100 }} value={message} onChangeText={setMessage}
                      multiline maxLength={1400} placeholder="Challenge your rival…" placeholderTextColor="#777" editable={!busy} />
                    <TouchableOpacity onPress={submitChat} disabled={busy || !message.trim()}
                      style={{ ...primary, paddingHorizontal: 17, opacity: busy || !message.trim() ? 0.5 : 1 }}>
                      <Text style={{ color: "#fff", fontWeight: "900" }}>SEND</Text>
                    </TouchableOpacity>
                  </View>
                </>
              )}
            </>
          )}
        </View>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}
