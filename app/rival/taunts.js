const TAUNTS = {
  winning_big: [
    "You’re not even close.",
    "This is getting boring.",
    "I’m way ahead of you.",
    "You’re falling behind fast."
  ],
  winning_small: [
    "I’ve got a slight edge.",
    "Careful — I’m pulling ahead.",
    "Don’t let me widen the gap."
  ],
  losing_small: [
    "You’re barely ahead.",
    "This isn’t over.",
    "I’m still in this."
  ],
  losing_big: [
    "Enjoy the lead while it lasts.",
    "I’ll catch up.",
    "This gap won’t save you."
  ],
  tied: [
    "Dead even.",
    "This is close.",
    "One move decides it."
  ],
  outperform: [
    "I outpaced you.",
    "I did more than you.",
    "I won this round."
  ],
  underperform: [
    "You beat me this time.",
    "Nice move.",
    "I’ll answer that."
  ]
};

const pick = arr => arr[Math.floor(Math.random() * arr.length)];

export function getContextualTaunt({
  rivalType = "balanced",
  playerXP,
  rivalXP,
  userXP,
  rivalXPValue
}) {
  const diff = rivalXP - playerXP;

  // Immediate round outcome (strongest signal)
  if (rivalXPValue > userXP) {
    return pick(TAUNTS.outperform);
  }

  if (rivalXPValue < userXP) {
    return pick(TAUNTS.underperform);
  }

  // Overall arc context
  if (diff === 0) return pick(TAUNTS.tied);
  if (diff >= 30) return pick(TAUNTS.winning_big);
  if (diff > 0) return pick(TAUNTS.winning_small);
  if (diff <= -30) return pick(TAUNTS.losing_big);
  return pick(TAUNTS.losing_small);
}
