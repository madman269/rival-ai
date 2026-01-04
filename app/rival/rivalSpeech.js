export function getRivalSpeech({ result, rivalType }) {
  const speeches = {
    aggressive: {
      win: [
        "You think this is over? Next arc, I crush you.",
        "Enjoy the win. It won’t happen again."
      ],
      lose: [
        "Tch. I underestimated you.",
        "You got lucky. Don’t let it get to your head."
      ],
      draw: [
        "A tie? Disgusting.",
        "I don’t accept draws."
      ]
    },

    respectful: {
      win: [
        "You earned this victory. I acknowledge you.",
        "Strong work. You surpassed me this time."
      ],
      lose: [
        "I’ll reflect and return stronger.",
        "This loss will shape me."
      ],
      draw: [
        "We are evenly matched. Interesting.",
        "Balance remains."
      ]
    },

    balanced: {
      win: [
        "Solid execution. You edged me out.",
        "Consistency won you this arc."
      ],
      lose: [
        "I pushed hard — but not enough.",
        "Next arc, I’ll adjust."
      ],
      draw: [
        "Neither of us gave an inch.",
        "This rivalry is far from over."
      ]
    },

    chaotic: {
      win: [
        "Wow. Didn’t see that coming.",
        "Hah! Guess you win… for now."
      ],
      lose: [
        "Meh. I wasn’t even trying.",
        "Losses happen. Or do they?"
      ],
      draw: [
        "Was this a win? Was this a loss?",
        "Reality feels… flexible."
      ]
    }
  };

  const pool =
    speeches[rivalType]?.[result] ||
    speeches.balanced[result];

  return pool[Math.floor(Math.random() * pool.length)];
}
