const BASE = {
  coins: 500,
  wins: 0,

  players: [
    {
      id: 1,
      name: "Starter",
      rating: 12,
      color: "#55d6ff",
      speed: 0,
      tackle: 0,
      accuracy: 0
    },
    {
      id: 2,
      name: "Runner",
      rating: 15,
      color: "#ffd166",
      speed: 1,
      tackle: 0,
      accuracy: 0
    },
    {
      id: 3,
      name: "Guard",
      rating: 14,
      color: "#62e6a5",
      speed: 0,
      tackle: 1,
      accuracy: 0
    },
    {
      id: 4,
      name: "Striker",
      rating: 18,
      color: "#b48cff",
      speed: 0,
      tackle: 0,
      accuracy: 1
    },
    {
      id: 5,
      name: "Wing",
      rating: 13,
      color: "#ff9f5a",
      speed: 1,
      tackle: 0,
      accuracy: 0
    }
  ]
};

function loadClub() {
  try {
    const data = JSON.parse(
      localStorage.getItem("rv2")
    );

    if (data && data.players) return data;
  } catch (e) {}

  return JSON.parse(JSON.stringify(BASE));
}

let club = loadClub();

function saveClub() {
  localStorage.setItem(
    "rv2",
    JSON.stringify(club)
  );
}

function rarity(r) {
  if (r >= 90) return "LEGENDARISCH";
  if (r >= 70) return "ELITE";
  if (r >= 45) return "ZELDZAAM";
  return "GEWOON";
}

function rarityClass(r) {
  if (r >= 90) return "legend";
  if (r >= 70) return "elite";
  if (r >= 45) return "rare";
  return "";
}
