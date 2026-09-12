(() => {
  "use strict";

  const state = {
    mode: "learn",
    category: "",
    cards: [],
    currentIndex: 0,
    answers: [],
    data: null,
  };

  const $ = (selector) => document.querySelector(selector);
  const screens = {
    setup: $("#setupScreen"),
    exercise: $("#exerciseScreen"),
    result: $("#resultScreen"),
  };

  function showScreen(name) {
    Object.values(screens).forEach((screen) =>
      screen.classList.remove("active"),
    );
    screens[name].classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function loadData() {
    const select = $("#categorySelect");
    try {
      const config = await fetch("data/categories.json").then((response) =>
        response.json(),
      );
      const files = await Promise.all(
        config.files.map((file) =>
          fetch(`data/${file}`).then((response) => response.json()),
        ),
      );
      state.data = {
        categories: Object.fromEntries(
          files
            .flatMap((file) => file.categories || [])
            .map((category) => [category.id, category]),
        ),
      };
      select.innerHTML = "";
      Object.entries(state.data.categories).forEach(([id, category]) => {
        const option = document.createElement("option");
        option.value = id;
        option.textContent = category.name;
        select.appendChild(option);
      });
      state.category = select.value;
    } catch (error) {
      select.innerHTML = "<option>Daten konnten nicht geladen werden</option>";
      $("#setupStatus").textContent =
        "Starte die Vorlage über einen lokalen Webserver.";
      console.error(error);
    }
  }

  function selectMode(mode) {
    state.mode = mode;
    document
      .querySelectorAll(".mode-card")
      .forEach((button) =>
        button.classList.toggle("selected", button.dataset.mode === mode),
      );
  }

  function start() {
    const category = state.data?.categories?.[state.category];
    if (!category?.cards?.length) return;
    state.cards = [...category.cards];
    state.currentIndex = 0;
    state.answers = [];
    $("#categoryLabel").textContent = category.name;
    $("#modeLabel").textContent = state.mode === "learn" ? "Lernen" : "Test";
    $("#exerciseTitle").textContent =
      state.mode === "learn" ? "Lernkarte" : "Teste dein Wissen";
    showScreen("exercise");
    renderCard();
  }

  function renderCard() {
    const card = state.cards[state.currentIndex];
    if (!card) return finish();
    const total = state.cards.length;
    $("#progressLabel").textContent = `${state.currentIndex + 1} / ${total}`;
    $("#progressBar").style.width =
      `${((state.currentIndex + 1) / total) * 100}%`;
    $("#questionText").textContent = card.question;
    $("#feedback").textContent = "";
    $("#feedback").className = "feedback";
    $("#backButton").hidden = state.currentIndex === 0;
    $("#nextButton").textContent =
      state.currentIndex === total - 1 ? "Fertig" : "Weiter";

    const answerArea = $("#answerArea");
    answerArea.innerHTML = "";
    if (state.mode === "learn") {
      const answer = document.createElement("div");
      answer.className = "answer-display";
      answer.textContent = card.answer;
      answerArea.appendChild(answer);
      return;
    }

    const input = document.createElement("input");
    input.id = "answerInput";
    input.className = "answer-input";
    input.placeholder = "Antwort eingeben ...";
    input.autocomplete = "off";
    input.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        next();
      }
    });
    answerArea.appendChild(input);
    setTimeout(() => input.focus(), 80);
  }

  function next() {
    if (state.mode === "test")
      state.answers[state.currentIndex] = $("#answerInput")?.value.trim() || "";
    if (state.currentIndex >= state.cards.length - 1) return finish();
    state.currentIndex += 1;
    renderCard();
  }

  function previous() {
    if (state.currentIndex === 0) return;
    state.currentIndex -= 1;
    renderCard();
  }

  function finish() {
    if (state.mode === "learn") return showScreen("setup");
    const correct = state.cards.reduce(
      (count, card, index) =>
        count +
        (state.answers[index]?.toLowerCase() === card.answer.toLowerCase()
          ? 1
          : 0),
      0,
    );
    const total = state.cards.length;
    $("#scorePercent").textContent =
      `${total ? Math.round((correct / total) * 100) : 0}%`;
    $("#scoreSummary").textContent = `${correct} von ${total} richtig`;
    showScreen("result");
  }

  function returnHome() {
    showScreen("setup");
  }

  function setTheme(theme) {
    const dark = theme === "dark";
    document.documentElement.dataset.theme = dark ? "dark" : "light";
    $("#themeIcon").textContent = dark ? "☀" : "☾";
    $("#themeButton").setAttribute(
      "aria-label",
      dark ? "Hellmodus aktivieren" : "Dunkelmodus aktivieren",
    );
    localStorage.setItem("templateTheme", theme);
  }

  $("#categorySelect").addEventListener("change", (event) => {
    state.category = event.target.value;
  });
  document
    .querySelectorAll(".mode-card")
    .forEach((button) =>
      button.addEventListener("click", () => selectMode(button.dataset.mode)),
    );
  $("#startButton").addEventListener("click", start);
  $("#backButton").addEventListener("click", previous);
  $("#nextButton").addEventListener("click", next);
  $("#finishButton").addEventListener("click", returnHome);
  $("#restartButton").addEventListener("click", start);
  $("#resultHomeButton").addEventListener("click", returnHome);
  $("#themeButton").addEventListener("click", () =>
    setTheme(
      document.documentElement.dataset.theme === "dark" ? "light" : "dark",
    ),
  );

  setTheme(localStorage.getItem("templateTheme") || "light");
  loadData();
})();
