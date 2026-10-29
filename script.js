
/* MOBILE NAVIGATION */
const menuToggle = document.getElementById("menuToggle");
const navLinks = document.getElementById("navLinks");

menuToggle.addEventListener("click", function () {
  navLinks.classList.toggle("open");
});

navLinks.querySelectorAll("a").forEach(function (link) {
  link.addEventListener("click", function () {
    navLinks.classList.remove("open");
  });
});

/* LOVE LETTERS */
const letters = {
  miss: {
    title: "When you miss me 🥹",
    message: "Baby, I wish I could be right there with you, holding you close. Until I can, remember that distance and busy days don't change what you mean to me. You're always in my heart, Lavin. Close your eyes and imagine the biggest hug from your boy. ❤️"
  },

  sad: {
    title: "When you've had a hard day 🌷",
    message: "Hey, my love. You don't have to be strong every second of every day. It's okay to rest, to feel things, and to take things slowly. I'm proud of you, even on the days when you don't feel proud of yourself. I hope tomorrow is gentler with you. You deserve that and so much more. 💗"
  },

  reassurance: {
    title: "When you need reassurance 🫶",
    message: "My love, I'm not going anywhere just because life gets busy. If I take time to reply, it doesn't mean you've become less important to me. I'm building my future, and I want us to keep growing together. You matter to me, Lavin, on the easy days and the difficult ones. Always remember that. ❤️"
  },

  sleep: {
    title: "Before you sleep, beautiful 🌙",
    message: "Goodnight, my gorgeous girl. I hope you fall asleep knowing that somebody out here appreciates your heart, your smile, your patience, and all the little things that make you you. Rest that beautiful mind of yours. If I could choose where to be tonight, I'd choose right beside you. Sweet dreams, baby. 💋"
  }
};

const modal = document.getElementById("letterModal");
const modalTitle = document.getElementById("modalTitle");
const modalMessage = document.getElementById("modalMessage");
const closeModal = document.getElementById("closeModal");
const modalDone = document.getElementById("modalDone");

document.querySelectorAll("[data-letter]").forEach(function (button) {
  button.addEventListener("click", function () {
    const letter = letters[button.dataset.letter];

    modalTitle.textContent = letter.title;
    modalMessage.textContent = letter.message;
    modal.classList.add("show");
    modal.setAttribute("aria-hidden", "false");
    closeModal.focus();
  });
});

function hideModal() {
  modal.classList.remove("show");
  modal.setAttribute("aria-hidden", "true");
}

closeModal.addEventListener("click", hideModal);
modalDone.addEventListener("click", hideModal);

modal.addEventListener("click", function (event) {
  if (event.target === modal) {
    hideModal();
  }
});

document.addEventListener("keydown", function (event) {
  if (event.key === "Escape") {
    hideModal();
  }
});

/* REASONS I LOVE YOU */
const reasons = [
  "I love how you make me feel safe enough to be myself. ❤️",
  "I love the way you understand me, even when I struggle to explain myself.",
  "I love your beautiful smile. It does something to my heart every time. 🥹",
  "I love that you stood by me when life wasn't easy.",
  "I love the little ways you show me that you care.",
  "I love how easy it feels to love you.",
  "I love your patience and the way you make me feel valued.",
  "I love that you're not just my girlfriend; you're my favourite person.",
  "I love the memories we have made and the ones still waiting for us.",
  "I love you because you're Lavin. You don't have to be anybody else. 💗"
];

let lastReason = -1;

document.getElementById("reasonButton").addEventListener("click", function () {
  let nextReason;

  if (reasons.length === 1) {
    nextReason = 0;
  } else {
    do {
      nextReason = Math.floor(Math.random() * reasons.length);
    } while (nextReason === lastReason);
  }

  lastReason = nextReason;
  document.getElementById("reasonText").textContent = reasons[nextReason];
});

/* ANNIVERSARY COUNTDOWN / RELATIONSHIP DURATION */

/* CHANGE THIS TO YOUR REAL RELATIONSHIP START DATE.
   Format: YYYY-MM-DD */
const relationshipStart = "2026-04-04";

function updateAnniversary() {
  const start = new Date(relationshipStart + "T00:00:00");
  const now = new Date();

  const count = document.getElementById("anniversaryCount");
  const dateLabel = document.getElementById("anniversaryDate");

  if (Number.isNaN(start.getTime()) || start > now) {
    count.textContent = "Our story is just beginning ♡";
    dateLabel.textContent = "Add your special date in script.js";
    return;
  }

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  let days = now.getDate() - start.getDate();

  if (days < 0) {
    months--;
    const previousMonth = new Date(
      now.getFullYear(),
      now.getMonth(),
      0
    );
    days += previousMonth.getDate();
  }

  if (months < 0) {
    years--;
    months += 12;
  }

  const parts = [];

  if (years > 0) parts.push(years + (years === 1 ? " year" : " years"));
  if (months > 0) parts.push(months + (months === 1 ? " month" : " months"));
  if (days > 0 || parts.length === 0) {
    parts.push(days + (days === 1 ? " day" : " days"));
  }

  count.textContent = parts.join(", ");

  dateLabel.textContent = "Since " + start.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric"
  });
}

updateAnniversary();
