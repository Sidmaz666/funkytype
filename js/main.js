// Get Focus Element
const focus_element = document.querySelector("#focus-element");
// Display Challange Text Element
const challenge_text = document.querySelector("#challenge-text");
// Display User Typed Text Element
const typed_text = document.querySelector("#user-text");
// Display Time Left
const time_display = document.querySelector("#time-display");
// Get Keypress Audio Element
const keypress_sound = document.querySelector('#keypress-sound')
// Track Index Of Each Character
let charIndex = 0;
// Timer Function
let seconds = 30;
let hasTimerStarted = false;
let hasTestFinished = false;
// Keep Track of Mistakes
let mistakes = 0;

// Import Wordlist
import wordlist from "./wordlist.js";

// Generate Initial Three Words Function
function generateWords(maximum_words = 3) {
  const word = [];
  for (let i = 0; i < maximum_words; i++) {
    word.push(wordlist[Math.floor(Math.random() * wordlist.length)]);
  }
  return word;
}

// Function To insert challange text
function provide_challange(word) {
  let sentence = `${challenge_text.value}${word
    .toString()
    .replaceAll(",", " ")}`;
  challenge_text.value = sentence.trim();
}

// Function To insert User Typed Text
function insert_user_text(letter) {
  let key = letter == "space" ? "&nbsp;" : letter;

  const challenge_text_value = challenge_text.value;
  let styleClass;

  if (challenge_text_value[charIndex] == letter) {
    styleClass = "text-blue-500";
  } else {
    styleClass = "text-red-500";
  }

  typed_text.insertAdjacentHTML(
    "beforeend",
    `<span class="${styleClass} h-[25px]">${key}</span>`
  );

  if (typed_text.textContent.length == challenge_text_value.length) {
    provide_challange(" " + generateWords());
  }

  charIndex++;
}
// BackSpace Function
function back_space() {
  if (typed_text.childElementCount !== 1)
    document
      .querySelectorAll("#user-text > span")
      [document.querySelectorAll("#user-text > span").length - 2].remove();
  if (charIndex < 0) {
    charIndex = 0;
  } else {
    charIndex--;
    mistakes++;
  }
}

function updateCursor() {
  if (document.querySelector("#cursor"))
    document.querySelector("#cursor").remove();

  typed_text.insertAdjacentHTML(
    "beforeend",
    `<span 
    id="cursor" 
    class="p-[1.5px] bg-pink-800
    animate-ping opacity-100 duration-200"></span>`
  );
}

// Focus Function
function focusOn() {
  focus_element.focus();
}
// Exporting focusOn Function to be able to use in HTML
window.focusOn = focusOn;

// Start Focusing When KeyPress is detected on the Body
document.body.addEventListener("keydown", function (e) {
  focusOn();
  keypress_sound.play()
});

// KeyDown Event For BackSpace

focus_element.addEventListener("keydown", function (e) {
  if (e.key == "Backspace" && !hasTestFinished) {
    back_space();
    updateCursor();
  }
});

// Listen To Input
focus_element.addEventListener("input", function (e) {
  let key = e.data;
  key == " " ? (key = "space") : (key = e.data);
  if (/^[a-z]/.test(key) && key !== null && !hasTestFinished)
    keyboardAnimation(key); 
});

// Animate Keyboard Letter
function keyboardAnimation(key) {
  const select_elm = document.querySelector(`#${key}-key`);
  select_elm.classList.add("bg-[#b8065f]");
  insert_user_text(key);
  let reset = setTimeout(() => {
    select_elm.classList.remove("bg-[#b8065f]");
    clearTimeout(reset);
  }, 150);
  // Update the Cursor
  updateCursor();
  // Start the Timer
  if (!hasTimerStarted && !hasTestFinished) start_countdown();
  // Remove Instructions If not removed
  if (document.querySelector("#result-report")) {
    document.querySelector("#result-report").remove();
  }
}
// Timer Function
function start_countdown() {
  hasTimerStarted = true;
  let interval = setInterval(() => {
    seconds--;
    time_display.textContent = `${seconds} left`;
    if (seconds == 0) {
      seconds = 30;
      hasTestFinished = true;
      display_result(calculate_wpm());
      clearInterval(interval);
    }
  }, 1000);
}

// Calculate and Show Result Function
function percentage(part, whole) {
  let p = part;
  if (p < 0) {
    p = 0;
  }
  let percentage = (part / whole) * 100;
  if (percentage < 0) {
    percentage = 0;
  }
  return percentage.toFixed(2) + "%";
}

function calculate_wpm() {
  let typed_words = String(
    document.querySelector("#user-text").textContent.trim()
  ).split("\u00A0");
  document.querySelectorAll('#user-text > span').forEach(e => {
    if(e.classList.contains("text-red-500") && e.id !== "cursor" && e.textContent !== "\u00A0")
    {
        mistakes++
    }
})
  if (typed_words == "") {
    typed_words = 0;
  } else {
    typed_words = typed_words.length;
  }
  let wpm = (typed_words / (seconds / 60)) * 2;
  let accuracy = percentage(typed_words - mistakes, typed_words);
  if (typed_words == 0) {
    wpm = 0;
    accuracy = 0;
  }
  return { wpm, accuracy, mistakes, typed_words };
}
// Function To Display Result
function display_result({ wpm, accuracy, typed_words, mistakes }) {
  let stars = 0;

  if (wpm >= 10 && accuracy.replace("%", "") >= 30) {
    stars = 1;
  }

  if (wpm >= 30 && accuracy.replace("%", "") >= 50) {
    stars = 2;
  }

  if (wpm >= 50 && accuracy.replace("%", "") >= 80) {
    stars = 3;
  }

  document.body.insertAdjacentHTML(
    "beforeend",
    `
    	<div
	id="result-report"
	class="bg-black/90 flex justify-center font-mono
	items-center w-screen h-screen
	overflow-hidden flex-col 
	absolute top-0 left-0"
	>
			<div
			class="bg-gray-900 flex w-[450px]
			font-mono text-gray-200 font-semibold text-xl
			flex-col rounded-md relative"
			>

			<div class="flex space-x-2 text-4xl justify-center items-center p-2 border-b-2 border-blue-500 pt-3 pb-3">
			    <i class="fa-solid fa-star ${
            stars == 1 || stars == 2 ? "text-yellow-500" : "text-black/40"
          }"></i>
			    <i class="fa-solid fa-star ${
            stars == 2 || stars == 3 ? "text-yellow-500" : "text-black/40"
          }"></i>
			    <i class="fa-solid fa-star ${
            stars == 3 ? "text-yellow-500" : "text-black/40"
          }"></i>
			</div>

			<div class="p-2 pl-5 mt-5 mb-2">
			<span class="text-gray-500">WPM(Words Per Minute):</span>
			<span>${wpm}</span>
			</div>

			<div class="p-2 pl-5 mt-2 mb-2">
			<span class="text-gray-500">Accuracy:</span>
			<span>${accuracy}</span>
			</div>

			<div class="p-2 pl-5 mt-2 mb-2">
			<span class="text-gray-500">Total Words:</span>
			<span>${typed_words}</span>
			</div>

			<div class="p-2 pl-5 mt-2 mb-2">
			<span class="text-gray-500">Mistakes:</span>
			<span>${mistakes}</span>
			</div>

			<div class="flex justify-center items-center
			w-full space-x-2 pb-8">
			<button class="p-2 bg-gray-800
			rounded-md hover:bg-blue-800"
			onclick="restart()"
			>
			<i class="fa-solid fa-refresh"></i>
			<span> Restart</span>
			</button>
			</div>

			</div>
	</div>
    `
  );
}

// Restart Function
function restart() {
  if (document.querySelector("#result-report")) {
    document.querySelector("#result-report").remove();
  }
  challenge_text.value = "";
  typed_text.innerHTML = "";
  time_display.textContent = `${seconds} left`;
  hasTimerStarted = false;
  hasTestFinished = false;
  charIndex = 0;
  mistakes = 0;
  init();
}
// Exporting Restart Function
window.restart = restart;

//Initialization Function
function init() {
  focusOn();
  // Generate Initial Random Words
  provide_challange(generateWords());
  // Place the Cursor
  updateCursor();
}

function instructions() {
  document.body.insertAdjacentHTML(
    "beforeend",
    `
    	<div
	id="instructions"
	class="bg-black/90 flex justify-center font-mono
	items-center w-screen h-screen
	overflow-hidden flex-col 
	absolute top-0 left-0
	z-[100]
	"
	>
			<div
			class="flex w-[450px] justify-center items-center
			font-mono text-gray-200 
			font-semibold text-xl flex-col"
			>
	
		      <button class="text-gray-600"
			onclick="
			document.querySelector('#instructions').remove()
			"
		      >
			<span class="text-8xl flex flex-col animate-bounce">
			<i class="fa-solid fa-keyboard"></i>
			</span> 	
			<span class="text-base font-extralight mb-3">Click Here!</span>
		    </button>

		    <span class="text-center mt-5 text-gray-400">
			Click on the Keyboard Icon and Start Typing. Write as many words in 30 seconds.
		    </span>

			</div>
			</div>

 `
  );
}

// Onload Function
window.onload = function () {
  instructions();
  init();
};
