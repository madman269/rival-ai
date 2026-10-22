import { Redirect } from "expo-router";

// Old deep links must not mount the retired screen, which writes an incompatible
// shape to the same storage key used by the current training room.
export default function LegacyLogScreen() {
  return <Redirect href="/rival/room" />;
}
