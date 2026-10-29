
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

/* MEMORY UPLOADS */
const memoryCards = document.querySelectorAll("[data-memory-category]");
const memoryDatabase = new Promise(function (resolve, reject) {
  const request = indexedDB.open("lavin-memories", 1);

  request.onupgradeneeded = function () {
    request.result.createObjectStore("memories", {
      keyPath: "id",
      autoIncrement: true
    });
  };

  request.onsuccess = function () {
    resolve(request.result);
  };

  request.onerror = function () {
    reject(request.error || new Error("Could not open memory storage."));
  };
});

function transactionComplete(transaction) {
  return new Promise(function (resolve, reject) {
    transaction.oncomplete = resolve;
    transaction.onerror = function () {
      reject(transaction.error || new Error("Memory storage failed."));
    };
    transaction.onabort = function () {
      reject(transaction.error || new Error("Memory storage was cancelled."));
    };
  });
}

function setMemoryStatus(card, message) {
  card.querySelector("[data-memory-status]").textContent = message;
}

function renderMemory(record, container) {
  const item = document.createElement("div");
  item.className = "memory-item";

  const mediaUrl = URL.createObjectURL(record.file);
  const media = document.createElement(
    record.file.type.startsWith("video/") ? "video" : "img"
  );
  media.className = "memory-media";
  media.src = mediaUrl;

  if (media instanceof HTMLVideoElement) {
    media.controls = true;
    media.playsInline = true;
  } else {
    media.alt = record.file.name || "Uploaded memory";
  }

  const caption = document.createElement("textarea");
  caption.className = "memory-caption";
  caption.placeholder = "Add a note about this memory...";
  caption.value = record.caption || "";
  caption.setAttribute("aria-label", "Caption for " + (record.file.name || "memory"));
  caption.addEventListener("change", async function () {
    try {
      const database = await memoryDatabase;
      const transaction = database.transaction("memories", "readwrite");
      record.caption = caption.value;
      transaction.objectStore("memories").put(record);
      await transactionComplete(transaction);
      setMemoryStatus(
        container.closest("[data-memory-category]"),
        "Caption saved."
      );
    } catch (error) {
      setMemoryStatus(
        container.closest("[data-memory-category]"),
        "Could not save this caption: " + error.message
      );
    }
  });

  const removeButton = document.createElement("button");
  removeButton.className = "memory-remove";
  removeButton.type = "button";
  removeButton.textContent = "Remove";
  removeButton.setAttribute("aria-label", "Remove " + (record.file.name || "memory"));
  removeButton.addEventListener("click", async function () {
    try {
      const database = await memoryDatabase;
      const transaction = database.transaction("memories", "readwrite");
      transaction.objectStore("memories").delete(record.id);
      await transactionComplete(transaction);
      URL.revokeObjectURL(mediaUrl);
      await loadMemories();
      setMemoryStatus(
        container.closest("[data-memory-category]"),
        "Memory removed."
      );
    } catch (error) {
      setMemoryStatus(
        container.closest("[data-memory-category]"),
        "Could not remove this memory: " + error.message
      );
    }
  });

  item.append(media, caption, removeButton);
  container.append(item);
}

async function loadMemories() {
  const database = await memoryDatabase;
  const transaction = database.transaction("memories", "readonly");
  const request = transaction.objectStore("memories").getAll();
  const records = await new Promise(function (resolve, reject) {
    request.onsuccess = function () {
      resolve(request.result);
    };
    request.onerror = function () {
      reject(request.error || new Error("Could not load saved memories."));
    };
  });

  memoryCards.forEach(function (card) {
    const container = card.querySelector("[data-memory-items]");
    container.querySelectorAll(".memory-media").forEach(function (media) {
      URL.revokeObjectURL(media.src);
    });
    container.replaceChildren();
    const categoryRecords = records.filter(function (record) {
      return record.category === card.dataset.memoryCategory;
    });

    if (categoryRecords.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.className = "memory-empty";
      emptyMessage.textContent = "Your photos and videos will appear here.";
      container.append(emptyMessage);
    } else {
      categoryRecords.forEach(function (record) {
        renderMemory(record, container);
      });
    }
  });
}

memoryCards.forEach(function (card) {
  card.querySelector("[data-memory-upload]").addEventListener("change", async function (event) {
    const input = event.currentTarget;
    const files = Array.from(input.files);

    if (files.length === 0) return;

    const unsupportedFiles = files.filter(function (file) {
      return !file.type.startsWith("image/") && !file.type.startsWith("video/");
    });
    if (unsupportedFiles.length > 0) {
      setMemoryStatus(card, "Please choose image or video files only.");
      input.value = "";
      return;
    }

    try {
      setMemoryStatus(card, "Saving your memories...");
      const database = await memoryDatabase;
      const transaction = database.transaction("memories", "readwrite");
      const store = transaction.objectStore("memories");
      files.forEach(function (file) {
        store.add({
          category: card.dataset.memoryCategory,
          file: file,
          caption: ""
        });
      });
      await transactionComplete(transaction);
      await loadMemories();
      setMemoryStatus(card, files.length + " file(s) added.");
    } catch (error) {
      setMemoryStatus(card, "Could not save your files: " + error.message);
    } finally {
      input.value = "";
    }
  });
});

loadMemories().catch(function (error) {
  memoryCards.forEach(function (card) {
    setMemoryStatus(card, "Could not load saved memories: " + error.message);
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
