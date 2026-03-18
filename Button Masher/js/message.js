function getEndMessage(score) {
      if (score < 2) return "You scanned 3% of Psyche's surface!\n\nPsyche was the 16th asteroid ever discovered.";
      if (score < 3) return "You scanned 6% of Psyche's surface!\n\nPsyche was the 16th asteroid ever discovered.";
      if (score < 4) return "You scanned 9% of Psyche's surface!\n\nPsyche was the 16th asteroid ever discovered";
      if (score < 5) return "You scanned 12% of Psyche's surface!\n\nPsyche was the 16th asteroid ever discovered";
      if (score < 6) return "You scanned 15% of Psyche's surface!\n\nPsyche was the 16th asteroid ever discovered";
      if (score < 7) return "You scanned 18% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 8) return "You scanned 21% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 9) return "You scanned 24% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 10) return "You scanned 27% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 11) return "You scanned 30% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 12) return "You scanned 33% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 13) return "You scanned 36% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 14) return "You scanned 39% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 15) return "You scanned 42% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 16) return "You scanned 45% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 17) return "You scanned 48% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 18) return "You scanned 51% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 19) return "You scanned 54% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 20) return "You scanned 57% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 21) return "You scanned 60% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 22) return "You scanned 63% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 23) return "You scanned 66% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 24) return "You scanned 69% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 25) return "You scanned 72% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 26) return "You scanned 75% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 27) return "You scanned 78% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 28) return "You scanned 81% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 29) return "You scanned 84% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 30) return "You scanned 87% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 31) return "You scanned 90% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 32) return "You scanned 93% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      if (score < 33) return "You scanned 96% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
      return "You scanned 100% of Psyche's surface!\n\nItalian astronomer Annibale de Gasparis discovered Psyche in 1852.";
    }

    function scoreToOrbitSeconds(score) {
      if (score <= 5) return 9.0;
      if (score <= 10) return 7.5;
      if (score <= 15) return 6.0;
      if (score <= 20) return 5.0;
      if (score <= 25) return 4.2;
      if (score <= 30) return 3.6;
      return 2.0;
    }

    function getRank(score) {
      if (score < 20) return "Mehh 😅";
      if (score < 40) return "Oh you're pretty good 👀";
      if (score < 60) return "Super fast 🔥";
      return "FASTEST HANDS IN THE WEST 🤠";
    }

    