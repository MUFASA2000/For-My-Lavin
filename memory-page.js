/* MEMORY PAGE NAVIGATION */
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

/* MEMORY STORAGE */
const memoryPage = document.querySelector("[data-memory-category]");
const category = memoryPage.dataset.memoryCategory;
const memoryStatus = memoryPage.querySelector("[data-memory-status]");
const memoryItems = memoryPage.querySelector("[data-memory-items]");
const uploadInput = memoryPage.querySelector("[data-memory-upload]");
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

function renderMemory(record) {
  const item = document.createElement("article");
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
      memoryStatus.textContent = "Caption saved.";
    } catch (error) {
      memoryStatus.textContent = "Could not save this caption: " + error.message;
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
      memoryStatus.textContent = "Memory removed.";
    } catch (error) {
      memoryStatus.textContent = "Could not remove this memory: " + error.message;
    }
  });

  item.append(media, caption, removeButton);
  memoryItems.append(item);
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

  memoryItems.querySelectorAll(".memory-media").forEach(function (media) {
    URL.revokeObjectURL(media.src);
  });
  memoryItems.replaceChildren();

  const categoryRecords = records.filter(function (record) {
    return record.category === category;
  });

  if (categoryRecords.length === 0) {
    const emptyMessage = document.createElement("p");
    emptyMessage.className = "memory-empty";
    emptyMessage.textContent = "Your photos and videos will appear here.";
    memoryItems.append(emptyMessage);
    return;
  }

  categoryRecords.forEach(renderMemory);
}

uploadInput.addEventListener("change", async function () {
  const files = Array.from(uploadInput.files);
  if (files.length === 0) return;

  const unsupportedFiles = files.filter(function (file) {
    return !file.type.startsWith("image/") && !file.type.startsWith("video/");
  });
  if (unsupportedFiles.length > 0) {
    memoryStatus.textContent = "Please choose image or video files only.";
    uploadInput.value = "";
    return;
  }

  try {
    memoryStatus.textContent = "Saving your memories...";
    const database = await memoryDatabase;
    const transaction = database.transaction("memories", "readwrite");
    const store = transaction.objectStore("memories");
    files.forEach(function (file) {
      store.add({
        category: category,
        file: file,
        caption: ""
      });
    });
    await transactionComplete(transaction);
    await loadMemories();
    memoryStatus.textContent = files.length + " file(s) added.";
  } catch (error) {
    memoryStatus.textContent = "Could not save your files: " + error.message;
  } finally {
    uploadInput.value = "";
  }
});

loadMemories().catch(function (error) {
  memoryStatus.textContent = "Could not load saved memories: " + error.message;
});
