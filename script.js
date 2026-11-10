const GameService = (() => {

  const WORDS_URL = "https://raw.githubusercontent.com/napolux/paroleitaliane/refs/heads/main/paroleitaliane/60000_parole_italiane.txt";

  let italianWords = [];

  const loadWords = () => {
    return fetch(WORDS_URL)
      .then(res => res.text())
      .then(text => {
        italianWords = text.split("\n").map(w => w.trim().toUpperCase());
      });
  };

  const hangmanStates = [
    "https://i.postimg.cc/63SX88TK/foto1.png",
    "https://i.postimg.cc/mZzc8MYC/foto2.png",
    "https://i.postimg.cc/SQBn5sdB/foto3.png",
    "https://i.postimg.cc/Z5ZCbM1f/foto4.png",
    "https://i.postimg.cc/g0tJKkr8/foto5.png",
    "https://i.postimg.cc/zB9G9tCv/foto6.png",
    "https://i.postimg.cc/0jDyxYZR/foto7.png"
  ];

  let game = {
    word: "",
    errors: 0,
    guessed: [],
    letters: [],
    state: 0
  };

  const getRandomWord = () => {
    let w = "";
    while (w.length < 5) {
      w = italianWords[Math.floor(Math.random() * italianWords.length)];
    }
    return w;
  };

  const startGame = () => {
    game.word = getRandomWord();
    game.errors = 0;
    game.guessed = [];
    game.letters = [];
    game.state = 0;
    return game;
  };

  const isWordGuessed = () => {
    const duplicates = [... new Set(game.word)];
    return duplicates.every(letters => game.guessed.includes(letters));
  };

  const chooseLetter = (letter) => {

    if (game.state !== 0) return game;

    game.letters.push(letter);

    if (game.word.includes(letter)) {

      game.guessed.push(letter);

      if (isWordGuessed()) {
        game.state = 1;
      }

    } else {

      game.errors++;

      if (game.errors >= 6) {
        game.state = 2;
      }
    }

    return game;
  };

  const getHangmanImage = () => hangmanStates[game.errors];

  const getGame = () => game;

  return {
    loadWords: loadWords,
    startGame: startGame,
    chooseLetter: chooseLetter,
    getGame: getGame,
    getHangmanImage: getHangmanImage
  };

})();

const renderImage = () => {
  document.getElementById("hangman-img").src = GameService.getHangmanImage();
};

const renderWord = () => {
  let g = GameService.getGame();
  let html = "";

  for (let c of g.word) {
    html += "<span style='margin: 0 8px;'>" + (g.guessed.includes(c) ? c : "___") + "</span>";
  }

  document.getElementById("word").innerHTML = html;
};

const renderKeyboard = () => {
  let g = GameService.getGame();
  const keys = document.querySelectorAll(".key");

  keys.forEach(key => {
    const letter = key.textContent;

    key.disabled = g.letters.includes(letter) || g.state !== 0;

    key.classList.remove("btn-success", "btn-danger", "btn-outline-secondary");

    if (!g.letters.includes(letter)) {
      key.classList.add("btn-outline-secondary");
    } else if (g.word.includes(letter)) {
      key.classList.add("btn-success");
    } else {
      key.classList.add("btn-danger");
    }
  });
};

const renderMessage = () => {
  let g = GameService.getGame();
  const msg = document.getElementById("message");

  if (g.state === 1) msg.textContent = "Hai indovinato la parola!!";
  else if (g.state === 2) msg.textContent = "Hai perso! La parola era: " + g.word;
  else msg.textContent = "";
};

const renderAll = () => {
  renderImage();
  renderWord();
  renderKeyboard();
  renderMessage();
};

GameService.loadWords().then(() => {
  GameService.startGame();
  renderAll();
});

document.querySelectorAll(".key").forEach(key => {
  key.onclick = () => {
    GameService.chooseLetter(key.textContent);
    renderAll();
  };
});