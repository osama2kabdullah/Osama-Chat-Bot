import bot from "./assets/bot.svg";
import user from "./assets/user.svg";

const form = document.querySelector("form");
const chat_container = document.getElementById("chat_container");

let loadInterval;

// ...loading function
function loader(element) {
  element.textContent = "";
  loadInterval = setInterval(() => {
    element.textContent += ".";
    if (element.textContent === "....") {
      element.textContent = "";
    }
  }, 300);
}

// typing function
function textTyping(element, text) {
  let index = 0;
  let interval = setInterval(() => {
    if (index < text.length) {
      element.innerHTML += text.charAt(index);
      index++;
    } else {
      clearInterval(interval);
    }
  }, 20);
}

// genarate Unique ID
function uniqueID() {
  const time = Date.now();
  const randomNum = Math.random();
  const hexCode = randomNum.toString(16);
  return "id-" + time + "-" + hexCode;
}

//chat box element
function chatStripe(isAi, value, uID) {
  return `
  <div class='wrapper ${isAi && "ai"}'>
    <div class='chat'>
      <div class='profile'>
        <img
        src='${isAi ? bot : user}'
        alt='${isAi ? "bot" : "user"}'
        />
      </div>
      <div class='message' id='${uID}'>${value}</div>
    </div>
  </div>
  `;
}

async function handleSubmit(event) {
  event.preventDefault();
  const data = new FormData(form);
  //user's chat
  chat_container.innerHTML += chatStripe(false, data.get("prompt"));

  form.reset();

  //bot now
  //uid genarate
  const uid = uniqueID();
  chat_container.innerHTML += chatStripe(true, " ", uid);

  chat_container.scrollTop = chat_container.scrollHeight;

  const messageDiv = document.getElementById(uid);
  //star loading before genarte answer
  loader(messageDiv);

  //fetching answers
  const res = await fetch("http://localhost:5000/post", {
    method: "POST",
    headers: {
      "Content-type": "application/json",
    },
    body: JSON.stringify({
      prompt: data.get("prompt"),
    }),
  });

  clearInterval(loadInterval);
  messageDiv.innerHTML = "";
  
  if (res.ok) {
    const data = await res.json();
    const parsedData = data.bot.trim();

    textTyping(messageDiv, parsedData);
  } else {
    const error = await res.text();
    messageDiv.innerHTML = 'Something went wrong';
    alert(error);
  }
}

form.addEventListener("submit", handleSubmit);
form.addEventListener("keyup", (e) => {
  if (e.keyCode === 13) {
    handleSubmit(e);
  }
});
