import { useCallback, useState } from "react";
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { useFocusEffect, useRouter } from "expo-router";
import { getStatus, readGame } from "../lib/rivalGame";

const RED = "#E50914";
const cardStyle = { backgroundColor: "#131313", borderWidth: 1, borderColor: "#292929", borderRadius: 16, padding: 18 };
const button = { backgroundColor: RED, padding: 18, borderRadius: 13, alignItems: "center" };

export default function HomeScreen() {
  const router = useRouter();
  const [rival, setRival] = useState(null);
  const [game, setGame] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useFocusEffect(useCallback(() => {
    let active = true;
    setLoading(true);
    readGame().then(({ rival: current, state }) => {
      if (!active) return;
      setRival(current);
      setGame(state);
      setError("");
    }).catch((e) => active && setError(e?.message || "Unable to load Rival AI"))
      .finally(() => active && setLoading(false));
    return () => { active = false; };
  }, []));

  const status = rival && game ? getStatus(rival, game) : null;
  const secondary = (title, description, route) => (
    <TouchableOpacity onPress={() => router.push(route)} style={{ ...cardStyle, marginTop: 13 }}>
      <Text style={{ color: "#fff", fontWeight: "800", fontSize: 17 }}>{title} →</Text>
      <Text style={{ color: "#858585", fontSize: 13, marginTop: 5 }}>{description}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#050505" }} contentContainerStyle={{ padding: 25, paddingTop: 50, paddingBottom: 50 }}>
      <View style={{ alignItems: "center" }}>
        <Image source={require("../assets/icon.png")} style={{ width: 86, height: 86 }} resizeMode="contain" />
        <Text style={{ color: "#fff", fontSize: 37, fontWeight: "900", marginTop: 11 }}>Rival<Text style={{ color: RED }}>.AI</Text></Text>
        <Text style={{ color: "#999", fontSize: 14, marginTop: 5 }}>Someone is always ahead.</Text>
      </View>
      {loading ? <ActivityIndicator color={RED} style={{ marginTop: 50 }} /> : (
        <>
          {error ? <Text style={{ color: "#ff8f98", marginTop: 20, textAlign: "center" }}>{error}</Text> : null}
          {status ? (
            <View style={{ ...cardStyle, marginTop: 42 }}>
              <Text style={{ color: RED, fontWeight: "900", fontSize: 12, letterSpacing: 2 }}>CURRENT RIVAL · {rival.sport.toUpperCase()}</Text>
              <Text style={{ color: "#fff", fontSize: 27, fontWeight: "900", marginTop: 9 }}>{rival.name}</Text>
              <Text style={{ color: "#aaa", fontSize: 14, marginTop: 4 }}>{rival.personality.toUpperCase()} · {status.ended ? "ARC COMPLETE" : status.daysLeft + " DAYS REMAINING"}</Text>
              <View style={{ flexDirection: "row", justifyContent: "space-between", marginTop: 24 }}>
                <View><Text style={{ color: "#888", fontWeight: "800", fontSize: 11 }}>YOU</Text><Text style={{ color: "#fff", fontSize: 30, fontWeight: "900" }}>{status.playerXP}</Text></View>
                <View><Text style={{ color: "#888", fontWeight: "800", fontSize: 11 }}>RIVAL</Text><Text style={{ color: RED, fontSize: 30, fontWeight: "900" }}>{status.rivalXP}</Text></View>
              </View>
              <View style={{ height: 7, backgroundColor: "#292929", borderRadius: 9, marginTop: 14, overflow: "hidden" }}>
                <View style={{ height: "100%", width: (status.progress * 100) + "%", backgroundColor: RED }} />
              </View>
              <Text style={{ color: "#aaa", fontSize: 13, marginTop: 12 }}>🔥 {status.streak}-day streak · {status.trainedDays} logged days</Text>
            </View>
          ) : (
            <View style={{ marginTop: 53, paddingHorizontal: 15 }}>
              <Text style={{ color: "#fff", fontSize: 27, fontWeight: "900", textAlign: "center" }}>Meet your competition.</Text>
              <Text style={{ color: "#a0a0a0", lineHeight: 23, textAlign: "center", marginTop: 13 }}>
                Create a rival, log real training, and battle across a timed season.
              </Text>
            </View>
          )}
          <TouchableOpacity onPress={() => router.push(rival ? "/rival/room" : "/rival/create")}
            style={{ ...button, marginTop: 27 }}>
            <Text style={{ color: "#fff", fontWeight: "900", fontSize: 18 }}>
              {status?.ended ? "VIEW YOUR RESULTS →" : rival ? "ENTER RIVAL ROOM →" : "CREATE YOUR RIVAL →"}
            </Text>
          </TouchableOpacity>
          {secondary("Training logbook", "Your sessions, XP and history", "/log")}
          {secondary("Settings", "Manage progress and your rival", "/settings")}
          {secondary("Shop", "Cosmetics and arenas", "/shop")}
          {status?.ended ? secondary("New battle", "Create a new rival and reset the arc", "/rival/create") : null}
          <Text style={{ color: "#626262", textAlign: "center", marginTop: 29, fontSize: 12, lineHeight: 18 }}>
            Your rival's XP is a simulated challenge. Train at your own pace and record only real sessions.
          </Text>
        </>
      )}
    </ScrollView>
  );
}
