import { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getStatus, readGame } from "../../lib/rivalGame";

const RED = "#E50914";
export default function LogbookScreen() {
  const router = useRouter();
  const [rival, setRival] = useState<any>(null);
  const [game, setGame] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useFocusEffect(useCallback(() => {
    let active = true;
    readGame().then(({ rival, state }) => {
      if (active) { setRival(rival); setGame(state); }
    }).finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []));

  const status = rival && game ? getStatus(rival, game) : null;
  const sessions = (game?.sessions || []).slice().reverse();

  return (
    <View style={{ flex: 1, backgroundColor: "#050505", paddingHorizontal: 20, paddingTop: 23 }}>
      <TouchableOpacity onPress={() => router.back()} style={{ paddingVertical: 10 }}>
        <Text style={{ color: "#aaa", fontSize: 16 }}>← Back</Text>
      </TouchableOpacity>
      <Text style={{ color: RED, fontSize: 12, letterSpacing: 2, fontWeight: "900", marginTop: 18 }}>TRAINING HISTORY</Text>
      <Text style={{ color: "#fff", fontSize: 30, fontWeight: "900", marginTop: 4 }}>The Logbook</Text>
      {status && (
        <View style={{ flexDirection: "row", backgroundColor: "#151515", padding: 18, borderRadius: 14, marginTop: 21, justifyContent: "space-between" }}>
          <View><Text style={{ color: "#888", fontSize: 12 }}>YOUR XP</Text><Text style={{ color: "#fff", fontSize: 25, fontWeight: "900" }}>{status.playerXP}</Text></View>
          <View><Text style={{ color: "#888", fontSize: 12 }}>RIVAL XP</Text><Text style={{ color: RED, fontSize: 25, fontWeight: "900" }}>{status.rivalXP}</Text></View>
          <View><Text style={{ color: "#888", fontSize: 12 }}>BEST STREAK</Text><Text style={{ color: "#fff", fontSize: 25, fontWeight: "900" }}>{Math.max(status.streak, game.bestStreak || 0)}</Text></View>
        </View>
      )}
      {loading ? <ActivityIndicator color={RED} style={{ marginTop: 45 }} /> : (
        <ScrollView style={{ marginTop: 24 }} contentContainerStyle={{ paddingBottom: 45 }}>
          {sessions.length === 0 ? (
            <View style={{ marginTop: 35 }}>
              <Text style={{ color: "#fff", fontSize: 19, fontWeight: "800", textAlign: "center" }}>No sessions yet</Text>
              <Text style={{ color: "#888", marginTop: 9, textAlign: "center" }}>Log your first workout to begin earning XP.</Text>
              <TouchableOpacity onPress={() => router.push(rival ? "/rival/room" : "/rival/create")}
                style={{ backgroundColor: RED, padding: 16, marginTop: 20, borderRadius: 12 }}>
                <Text style={{ color: "#fff", fontWeight: "900", textAlign: "center" }}>START TRAINING →</Text>
              </TouchableOpacity>
            </View>
          ) : sessions.map((s: any) => (
            <View key={s.id} style={{ padding: 17, marginBottom: 12, borderRadius: 14, backgroundColor: "#161616", borderWidth: 1, borderColor: "#303030" }}>
              <Text style={{ color: "#919191", fontSize: 12, fontWeight: "800" }}>{s.day}</Text>
              <Text style={{ color: "#fff", fontSize: 18, fontWeight: "800", marginTop: 5 }}>{s.activity}</Text>
              <Text style={{ color: "#ccc", marginTop: 6 }}>{s.minutes} minutes · +{s.xp} XP</Text>
              {s.detail ? <Text style={{ color: "#aaa", marginTop: 7, lineHeight: 20 }}>{s.detail}</Text> : null}
              <Text style={{ color: "#ff999f", marginTop: 10, fontSize: 12 }}>
                Simulated rival: {s.rivalMinutes} min · +{s.opponentXP} XP
              </Text>
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
}
