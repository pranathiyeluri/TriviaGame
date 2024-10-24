class Game {
  constructor(player1, player2) {
    this.player1 = { name: player1, score: 0 };
    this.player2 = { name: player2, score: 0 };
    this.currentPlayer = this.player1;
    this.selectedCategories = [];
    this.currentQuestion = 0;
    this.questions = [];
    this.initialization();
  }

  initialization() {
    this.playerName();
    this.categories();
  }

  playerName() {
    this.scoreForDisplay();
    document.querySelector(".current_player").textContent = this.currentPlayer.name;
  }

  categories() {
    document.querySelector("#start").addEventListener("click", async () => {
      const selectedCategory = document.querySelector("#category_list").value;
      if (!this.selectedCategories.includes(selectedCategory)) {
        this.selectedCategories.push(selectedCategory);
        await this.fetchQuestions(selectedCategory);
        document.querySelector("#category").style.display = "none";
        document.querySelector("#question_section").style.display = "block";
        this.displayQuestion();
      } else {
        alert("Category already selected! Please choose another.");
      }
    });

    document.querySelector("#stop").addEventListener("click", () => {
      this.endGame();
    });
  }

  async fetchQuestions(category) {
    this.questions = [];
    this.currentQuestion = 0;
    const levels = ["easy", "medium", "hard"];
    const maxQuestionsPerLevel = 2;

    for (const level of levels) {
      const url = `https://the-trivia-api.com/v2/questions?categories=${category}&limit=${maxQuestionsPerLevel}&difficulties=${level}`;
      const response = await fetch(url);
      const data = await response.json();
      this.questions.push(...data);
    }
  }

  displayQuestion() {
    const currentQuestionData = this.questions[this.currentQuestion];
    const answers = this.shuffleOptions([currentQuestionData.correctAnswer, ...currentQuestionData.incorrectAnswers]);

    document.querySelector(".question").innerHTML = `
      <p>${currentQuestionData.question.text}</p>
    `;

    const answersContainer = document.querySelector(".answers");
    answersContainer.innerHTML = ''; 

    answers.forEach(answer => {
      const button = document.createElement('button');
      button.textContent = answer;
      button.classList.add("answer-btn");
      button.addEventListener("click", () => {
        this.verifyAnswer(answer);
      });
      answersContainer.appendChild(button);
    });
  }

  shuffleOptions(answers) {
    for (let i = answers.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [answers[i], answers[j]] = [answers[j], answers[i]];
    }
    return answers;
  }

  verifyAnswer(selectedAnswer) {
    const correctAnswer = this.questions[this.currentQuestion].correctAnswer;
    const resultMessage = document.querySelector("#scores"); 

   
    if (selectedAnswer === correctAnswer) {
      this.currentPlayer.score += this.calculatePoints(this.currentQuestion);
      resultMessage.textContent = "Correct!";
      resultMessage.style.color = "green";
    } else {
      resultMessage.textContent = `Incorrect! The correct answer was: ${correctAnswer}`;
      resultMessage.style.color = "red";
    }

    resultMessage.style.display = "block";
    setTimeout(() => {
      resultMessage.style.display = "none";
      this.nextTurn();
    }, 2000);

    this.scoreForDisplay();
  }

  calculatePoints(index) {
    if (index < 2) return 10;
    if (index < 4) return 15;
    return 20;
  }

  nextTurn() {
    this.currentQuestion++;
    if (this.currentQuestion >= this.questions.length) {
      this.updateCategory();
    } else {
      this.switchPlayer();
      this.displayQuestion();
    }
  }

  switchPlayer() {
    this.currentPlayer = this.currentPlayer === this.player1 ? this.player2 : this.player1;
    document.querySelector(".current_player").textContent = this.currentPlayer.name;
  }

  scoreForDisplay() {
    document.querySelector("#p1score").textContent = `${this.player1.name}: ${this.player1.score}`;
    document.querySelector("#p2score").textContent = `${this.player2.name}: ${this.player2.score}`;
  }

  updateCategory() {
    this.selectedCategories.forEach((category) => {
      const option = document.querySelector(`#category_list option[value="${category}"]`);
      if (option) {
        option.remove();
      }
    });

    if (this.selectedCategories.length < 9) {
      document.querySelector("#category").style.display = "block";
      document.querySelector("#question_section").style.display = "none";
    } else {
      this.endGame();
    }
  }

  endGame() {
    document.querySelector("#category").style.display = "none";
    document.querySelector("#question_section").style.display = "none";
    const gameoverText = `${this.player1.name} vs ${this.player2.name}`;
    document.querySelector("#gameover").textContent = gameoverText;

    if (this.player1.score > this.player2.score) {
      document.querySelector("#winner").textContent = `${this.player1.name} Wins!`;
    } else if (this.player2.score > this.player1.score) {
      document.querySelector("#winner").textContent = `${this.player2.name} Wins!`;
    } else {
      document.querySelector("#winner").textContent = "It's a Tie!";
    }

    document.querySelector("#score_section").style.display = "block";
    document.querySelector("#playagain").style.display = "block";
    document.querySelector("#playagain").addEventListener("click", () => {
      location.reload();
    });
  }
}

document.querySelector("#submit").addEventListener("click", () => {
  const player1Name = document.querySelector("#player1").value;
  const player2Name = document.querySelector("#player2").value;

  if (player1Name && player2Name) {
    const game = new Game(player1Name, player2Name);
    document.querySelector("#players_content").style.display = "none";
    document.querySelector("#category").style.display = "block";
  } else {
    alert("Please enter both player names!");
  }
});
