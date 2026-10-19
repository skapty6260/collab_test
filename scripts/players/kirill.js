/* =========================================================
   kirill.js — данные профиля Кирилла Насиковского
   ========================================================= */

window.PLAYER = {
  nick: "captain",
  position: 5,
  role: "Hard Support · Captain",

  heroes: [
    {
      name: "Crystal Maiden",
      role: "Support",
      winrate: 60,
      games: 312,
      kda: "2.8",
    },
    { name: "Warlock", role: "Support", winrate: 58, games: 245, kda: "3.2" },
    { name: "Oracle", role: "Support", winrate: 55, games: 198, kda: "3.5" },
    { name: "Dazzle", role: "Support", winrate: 57, games: 176, kda: "3.1" },
    { name: "Undying", role: "Support", winrate: 54, games: 154, kda: "2.9" },
  ],

  matches: [
    { hero: "Crystal Maiden", win: true, kda: "3 / 9 / 28", duration: "45:10" },
    { hero: "Warlock", win: true, kda: "4 / 6 / 22", duration: "39:45" },
    { hero: "Oracle", win: false, kda: "2 / 8 / 14", duration: "51:20" },
    { hero: "Dazzle", win: true, kda: "5 / 5 / 19", duration: "36:15" },
    { hero: "Undying", win: false, kda: "1 / 11 / 16", duration: "42:55" },
  ],

  facts: [
    "Всегда покупает Smoke of Deceit, даже если команда не просит.",
    "Считает, что варды выигрывают игры больше, чем рапира.",
    "Никогда не пикает саппорта без стана или сейва.",
    "Ведёт таблицу с таймингами ротации курьеров.",
    "Однажды спас керри от смерти 14 раз за один матч.",
    "Обожает смотреть разборы драфтов от профессиональных капитанов.",
  ],
};
