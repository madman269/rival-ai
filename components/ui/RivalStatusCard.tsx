import { View, Text } from "react-native";

type Props = {
  playerXP: number;
  rivalXP: number;
  playerLevel: number;
  rivalLevel: number;
  playerRank: string;
  rivalRank: string;
};

export default function RivalStatusCard({
  playerXP,
  rivalXP,
  playerLevel,
  rivalLevel,
  playerRank,
  rivalRank
}: Props) {
  const diff = playerXP - rivalXP;

  let statusText = "You are tied this arc";
  let statusColor = "#aaa";

  if (diff > 0) {
    statusText = `You are ahead by ${diff} XP`;
    statusColor = "#00ff88";
  } else if (diff < 0) {
    statusText = `Rival is ahead by ${Math.abs(diff)} XP`;
    statusColor = "#E50914";
  }

  const maxXP = Math.max(playerXP, rivalXP, 100);

  return (
    <View
      style={{
        backgroundColor: "#0d0d0d",
        borderRadius: 16,
        padding: 16,
        marginTop: 20
      }}
    >
      {/* HEADER */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between"
        }}
      >
        <Text style={{ color: "#fff", fontWeight: "700" }}>YOU</Text>
        <Text style={{ color: "#777", fontWeight: "700" }}>VS</Text>
        <Text style={{ color: "#E50914", fontWeight: "700" }}>RIVAL</Text>
      </View>

      {/* LEVELS */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginTop: 6
        }}
      >
        <Text style={{ color: "#aaa" }}>
          Lv {playerLevel} • {playerRank}
        </Text>
        <Text style={{ color: "#E50914" }}>
          Lv {rivalLevel} • {rivalRank}
        </Text>
      </View>

      {/* XP BARS */}
      <View style={{ marginTop: 12 }}>
        <View
          style={{
            height: 6,
            backgroundColor: "#111",
            borderRadius: 6,
            overflow: "hidden"
          }}
        >
          <View
            style={{
              width: `${(playerXP / maxXP) * 100}%`,
              height: "100%",
              backgroundColor: "#00ff88"
            }}
          />
        </View>

        <View
          style={{
            height: 6,
            backgroundColor: "#111",
            borderRadius: 6,
            overflow: "hidden",
            marginTop: 6
          }}
        >
          <View
            style={{
              width: `${(rivalXP / maxXP) * 100}%`,
              height: "100%",
              backgroundColor: "#E50914"
            }}
          />
        </View>
      </View>

      {/* STATUS */}
      <Text
        style={{
          marginTop: 12,
          color: statusColor,
          fontWeight: "600",
          textAlign: "center"
        }}
      >
        {statusText}
      </Text>
    </View>
  );
}
