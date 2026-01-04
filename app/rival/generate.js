export const rivalPersonalities = [
  {
    name: "The Aggressive Rival",
    type: "aggressive",
    intro: "I’m not here to motivate you. I’m here to beat you."
  },
  {
    name: "The Balanced Rival",
    type: "balanced",
    intro: "I’ll push you just past your limit. Every time."
  },
  {
    name: "The Respectful Rival",
    type: "respectful",
    intro: "Iron sharpens iron. Let’s grow."
  },
  {
    name: "The Chaotic Rival",
    type: "chaotic",
    intro: "Some days I dominate. Some days I disappear. Adapt."
  }
];

export function generateRival(type) {
  if (!type) {
    const index = Math.floor(Math.random() * rivalPersonalities.length);
    return rivalPersonalities[index];
  }

  return rivalPersonalities.find(r => r.type === type);
}
