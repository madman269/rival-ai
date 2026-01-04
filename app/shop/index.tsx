import { useRouter } from "expo-router";
import { ScrollView, Text, TouchableOpacity, View } from "react-native";

export default function ShopScreen() {
  const router = useRouter();

  return (
    <View style={{ flex: 1, backgroundColor: "#000", padding: 25 }}>
      
      {/* HEADER */}
      <Text style={{ color: "#E50914", fontSize: 14, fontWeight: "700" }}>
        SHOP
      </Text>
      <Text
        style={{
          color: "#fff",
          fontSize: 28,
          fontWeight: "800",
          marginTop: 6
        }}
      >
        Rival Upgrades
      </Text>
      <Text style={{ color: "#777", marginTop: 6 }}>
        
      </Text>

      <ScrollView style={{ marginTop: 30 }} showsVerticalScrollIndicator={false}>
        
        {/* ARENAS */}
        <Text style={{ color: "#888", fontSize: 13, marginBottom: 10 }}>
          ARENAS
        </Text>

        <ShopCard
          title="Iron Gym"
          subtitle="Default Arena"
          status="owned"
          accent="#E50914"
        />

        <ShopCard
          title="Training Pitch"
          subtitle="Soccer Field Arena"
          status="locked"
          accent="#1DB954"
        />

        <ShopCard
          title="Practice Court"
          subtitle="Tennis Arena"
          status="locked"
          accent="#3A7AFE"
        />

        {/* PERSONALITIES */}
        <Text
          style={{
            color: "#888",
            fontSize: 13,
            marginTop: 30,
            marginBottom: 10
          }}
        >
          RIVAL PERSONALITIES
        </Text>

        <ShopCard
          title="Aggressive"
          subtitle="Pushes relentlessly"
          status="owned"
          accent="#E50914"
        />

        <ShopCard
          title="Mocking"
          subtitle="Talks trash"
          status="locked"
          accent="#ffaa00"
        />

        <ShopCard
          title="Cold"
          subtitle="Silent domination"
          status="locked"
          accent="#3A7AFE"
        />

        <ShopCard
          title="Respectful"
          subtitle="Honors effort"
          status="locked"
          accent="#00ff88"
        />

        {/* COSMETICS */}
        <Text
          style={{
            color: "#888",
            fontSize: 13,
            marginTop: 30,
            marginBottom: 10
          }}
        >
          COSMETICS (COMING SOON)
        </Text>

        <DisabledCard text="Rival Skins" />
        <DisabledCard text="Animated Arenas" />
        <DisabledCard text="Voice Taunts" />
      </ScrollView>

      {/* BACK */}
      <TouchableOpacity
        onPress={() => router.back()}
        style={{
          marginTop: 20,
          padding: 16,
          borderRadius: 12,
          borderWidth: 1,
          borderColor: "#222"
        }}
      >
        <Text
          style={{
            color: "#aaa",
            textAlign: "center",
            fontSize: 16,
            fontWeight: "600"
          }}
        >
          Back
        </Text>
      </TouchableOpacity>
    </View>
  );
}

/* ---------------- COMPONENTS ---------------- */

function ShopCard({ title, subtitle, status, accent }) {
  const owned = status === "owned";

  return (
    <View
      style={{
        backgroundColor: owned ? "#111" : "#0a0a0a",
        padding: 16,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: owned ? accent : "#222"
      }}
    >
      <Text
        style={{
          color: owned ? "#fff" : "#888",
          fontSize: 17,
          fontWeight: "700"
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          color: owned ? "#aaa" : "#555",
          fontSize: 13,
          marginTop: 4
        }}
      >
        {subtitle}
      </Text>

      <Text
        style={{
          marginTop: 8,
          color: owned ? accent : "#555",
          fontSize: 12,
          fontWeight: "700"
        }}
      >
        {owned ? "OWNED" : "LOCKED"}
      </Text>
    </View>
  );
}

function DisabledCard({ text }) {
  return (
    <View
      style={{
        backgroundColor: "#050505",
        padding: 16,
        borderRadius: 12,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: "#111"
      }}
    >
      <Text style={{ color: "#444", fontSize: 15 }}>{text}</Text>
      <Text style={{ color: "#333", fontSize: 12, marginTop: 4 }}>
        Coming soon
      </Text>
    </View>
  );
}
