/*************************************************************
 * FULL UPDATED BOT SCRIPT
 *************************************************************/

const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const schedule = require("node-schedule");

// ======================
// 1) BOT CONFIG
// ======================

// Put your real bot token here
const token = "YOUR_BOT_TOKEN_HERE";
const bot = new TelegramBot(token, { polling: true });

// Paths for storing data
const dataFilePath = "./userStates.json";       // Active user states
const deletedHistoryPath = "./deletedStates.json"; // History of deleted states

let userStates = {}; // Main memory object for active states
let lastResetDate = new Date().toLocaleDateString(); // Store last reset date

// Admin array: only these IDs can use admin commands
const adminIds = [
  1298085044, // Митко
  // Add more admin IDs if you want
];

// Hardcoded dictionary: Telegram ID -> Custom Display Name
const userNamesMapping = {
  1298085044: "Митко",
  6208525707: "Виктория",
  6018753010: "Валерия",
  6803895686: "Адриана",
  7831972697: "Бибек",
  8170978602: "Емилия",
  8058320207: "Сидат",
  7645547746: "F&B",
  8092075805: "Сусан",
  // Add more if needed...
};

// ======================
// 2) RESET LOGIC
// ======================

/**
 * resetUserStates(): Clears all active userStates, and updates lastResetDate.
 */
function resetUserStates() {
  userStates = {}; // Clear everything
  lastResetDate = new Date().toLocaleDateString();
  saveLastResetDate();

  saveDataToFile(userStates, (err) => {
    if (err) {
      console.error("Failed to reset userStates:", err);
    } else {
      console.log("userStates reset successfully.");
    }
  });
}

// Reset times: 22:00, 00:00, 02:00, 04:00, 16:00
schedule.scheduleJob("0 22 * * *", () => {
  console.log("Resetting userStates at 22:00...");
  resetUserStates();
});
schedule.scheduleJob("0 0 * * *", () => {
  console.log("Resetting userStates at 00:00...");
  resetUserStates();
});
schedule.scheduleJob("0 2 * * *", () => {
  console.log("Resetting userStates at 02:00...");
  resetUserStates();
});
schedule.scheduleJob("0 4 * * *", () => {
  console.log("Resetting userStates at 04:00...");
  resetUserStates();
});
schedule.scheduleJob("0 16 * * *", () => {
  console.log("Resetting userStates at 16:00...");
  resetUserStates();
});

// ======================
// 3) LAST RESET DATE
// ======================

function saveLastResetDate() {
  fs.writeFile("./lastResetDate.txt", lastResetDate, (err) => {
    if (err) {
      console.error("Failed to save last reset date:", err);
    } else {
      console.log("Last reset date saved successfully.");
    }
  });
}

function loadLastResetDate() {
  fs.readFile("./lastResetDate.txt", "utf8", (err, data) => {
    if (err) {
      console.error("Failed to load last reset date, assuming today:", err);
      lastResetDate = new Date().toLocaleDateString();
    } else {
      lastResetDate = data;
    }
  });
}
loadLastResetDate();

// ======================
// 4) TIPS LOGIC
// ======================
const tipsArray = [
  "Поднесете менюто с усмивка.",
  "Бъдете вежливи и отзивчиви.",
  "Проверете дали клиентите са доволни от обслужването.",
  "Запомнете предпочитанията на редовните клиенти.",
  "Бъдете бързи и ефективни в работата си.",
  "Внимавайте с детайлите - дори малките жестове правят голямо впечатление.",
  "Научете се да разчитате настроението на клиентите и предлагайте услуги според това.",
  "Бъдете гъвкави и готови да се адаптирате към нуждите на клиентите.",
  "Избягвайте конфликтите - винаги търсете дипломатични решения.",
  "Създайте позитивна атмосфера - усмивката и доброто настроение са заразни.",
  "Бъдете внимателни с времето за обслужване - бързината и качеството са важни.",
  "Научете се да препоръчвате ястия и напитки според вкусовете на клиентите.",
  "Поддържайте чистота и нареденост в работното пространство - първото впечатление е важно.",
  "Бъдете проактивни и предвиждащи - предварителното предложение на още вода или хляб може да направи разлика.",
  "Слушайте внимателно изискванията на клиентите и се опитвайте да ги удовлетворите.",
  "Смейте се и бъдете усмихнати - положителната енергия се отразява на клиентите.",
  "Научете се да работите под налягане - ресторантската среда често изисква бързо реагиране.",
  "Поддържайте контакт с клиентите, но без да сте нахални - балансът е ключов.",
  "Бъдете внимателни със специалните нужди на клиентите - алергии, предпочитания и др.",
  "Научете се да отговаряте на въпроси за менюто и напитките с увереност.",
  "Обучавайте се редовно за нови ястия, вина и тенденции в гастрономията.",
];

// Shuffle tips
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}
shuffle(tipsArray);

let scheduledTips = 0;
let tipsSentToday = 0;
let lastSentDay = new Date().getDate();

/**
 * sendRandomTip(chatId): Sends one tip from the tipsArray.
 */
function sendRandomTip(chatId) {
  const randomTip = tipsArray[scheduledTips];
  bot.sendMessage(chatId, `Съвет за обслужване: ${randomTip}`);
  scheduledTips = (scheduledTips + 1) % tipsArray.length;
  tipsSentToday += 1;

  const currentDay = new Date().getDate();
  if (currentDay !== lastSentDay) {
    tipsSentToday = 1;
    lastSentDay = currentDay;
  }
}

/**
 * scheduleRandomTips(): every 3 hours between 09:00-22:00, send a tip if <5 tips sent today.
 */
function scheduleRandomTips() {
  const startHour = 9;
  const endHour = 22;
  setInterval(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= startHour && currentHour <= endHour && tipsSentToday < 5) {
      const chatId = "-4194911088"; 
      sendRandomTip(chatId);
    }
  }, 3 * 60 * 60 * 1000);
}
scheduleRandomTips();

// ======================
// 5) FILE MANAGEMENT
// ======================

function saveDataToFile(data, callback) {
  fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error saving data:", err);
      callback(err);
    } else {
      console.log("Data successfully saved to file.");
      callback(null);
    }
  });
}

function loadDataFromFile(callback) {
  fs.readFile(dataFilePath, (err, raw) => {
    if (err) {
      console.error("Error reading data:", err);
      callback(false);
    } else {
      try {
        userStates = JSON.parse(raw);
        console.log("Data successfully loaded from file.");
        callback(true);
      } catch (e) {
        console.error("Error parsing data:", e);
        callback(false);
      }
    }
  });
}

// ========== Deleted States History ==========
//
// We'll store past deleted states in deletedStates.json. Only keep last 7 days.

function loadDeletedHistory() {
  try {
    if (fs.existsSync(deletedHistoryPath)) {
      const raw = fs.readFileSync(deletedHistoryPath, "utf8");
      return JSON.parse(raw);
    } else {
      return [];
    }
  } catch (err) {
    console.error("Error loading deletedStates:", err);
    return [];
  }
}

function saveDeletedHistory(historyData) {
  fs.writeFileSync(deletedHistoryPath, JSON.stringify(historyData, null, 2));
  console.log("deletedStates.json updated.");
}

/**
 * Keep only last 7 days in deletedStates.json
 */
function pruneDeletedHistory() {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  const history = loadDeletedHistory();
  const pruned = history.filter((item) => item.timestamp >= sevenDaysAgo);
  saveDeletedHistory(pruned);
}

// ======================
// 6) BOT STARTUP
// ======================
loadDataFromFile((success) => {
  if (success) {
    console.log("User states loaded successfully. Bot is ready.");
  } else {
    console.log("Failed to load user states. Starting with empty states.");
  }
  setupBotListeners();
});

// ======================
// 7) HELPER FUNCTIONS
// ======================

function updateUserState(userId, updateData) {
  if (!userStates[userId]) {
    userStates[userId] = {};
  }
  userStates[userId] = { ...userStates[userId], ...updateData };
  saveDataToFile(userStates, () => {});
}

/**
 * getBusStopDescription(callbackData): converts callback_data to a text label
 */
function getBusStopDescription(callbackData) {
  const mapping = {
    // Times & stops
    "stop_0610Спортна зала": "06:10 Спортна зала",
    "stop_0615Спирка Марек": "06:15 Спирка Марек",
    "stop_0625Овчарци": "06:25 Овчарци",
    "stop_0625Пиперево кръговото": "06:25 Пиперево кръговото",
    "stop_0630103": "06:30 103",
    "stop_0640Сапарево кръговото": "06:40 Сапарево кръговото",
    "stop_0700Вю": "07:00 Вю",

    "stop_0910Спортна зала": "09:10 Спортна зала",
    "stop_0915Спирка Марек": "09:15 Спирка Марек",
    "stop_0915Сапарево кръговото": "09:15 Сапарево кръговото", // NEW STOP
    "stop_0925Овчарци": "09:25 Овчарци",
    "stop_0925Пиперево кръговото": "09:25 Пиперево кръговото",
    "stop_0930103": "09:30 103",
    "stop_1000Вю": "10:00 Вю",

    "stop_1410Спортна зала": "14:10 Спортна зала",
    "stop_1415Спирка Марек": "14:15 Спирка Марек",
    "stop_1415Сапарево кръговото": "14:15 Сапарево кръговото",
    "stop_1425Овчарци": "14:25 Овчарци",
    "stop_1425Пиперево кръговото": "14:25 Пиперево кръговото",
    "stop_1430103": "14:30 103",
    "stop_1500Вю": "15:00 Вю",
    "stop_1530Вю": "15:30 Вю",
  };
  return mapping[callbackData] || "Unknown Stop";
}

/**
 * joinNamesWithAnd(names): Merges array into "Name1, Name2 и LastName"
 */
function joinNamesWithAnd(names) {
  if (names.length === 1) return names[0];
  const lastName = names.pop();
  return names.join(", ") + " и " + lastName;
}

/**
 * isAdmin(userId): checks if userId is in adminIds
 */
function isAdmin(userId) {
  return adminIds.includes(userId);
}

// ======================
// 8) MAIN BOT LOGIC
// ======================

/**
 * handleBusCommand(msg): shows bus stops in group, storing group ID for user
 */
function handleBusCommand(msg) {
  const groupId = msg.chat.id;
  const userId = msg.from.id;
  const currentDate = new Date().toLocaleDateString();

  if (currentDate !== lastResetDate) {
    console.log("Resetting userStates for the first time today...");
    resetUserStates();
    lastResetDate = currentDate;
    saveLastResetDate();
  }

  if (!userStates[userId]) {
    userStates[userId] = {};
  }
  userStates[userId].groupChatId = groupId;
  if (!userStates[userId].responses) {
    userStates[userId].responses = {};
  }

  const busStopsKeyboard = [
    [{ text: "06:10 Спортна зала", callback_data: "stop_0610Спортна зала" }],
    [{ text: "06:15 Спирка Марек", callback_data: "stop_0615Спирка Марек" }],
    [{ text: "06:25 Овчарци", callback_data: "stop_0625Овчарци" }],
    [
      {
        text: "06:25 Пиперево кръговото",
        callback_data: "stop_0625Пиперево кръговото",
      },
    ],
    [{ text: "06:30 103", callback_data: "stop_0630103" }],
    [
      {
        text: "06:40 Сапарево кръговото",
        callback_data: "stop_0640Сапарево кръговото",
      },
    ],
    [{ text: "07:00 Вю", callback_data: "stop_0700Вю" }],

    [{ text: "09:10 Спортна зала", callback_data: "stop_0910Спортна зала" }],
    [{ text: "09:15 Спирка Марек", callback_data: "stop_0915Спирка Марек" }],
    [
      {
        text: "09:15 Сапарево кръговото",
        callback_data: "stop_0915Сапарево кръговото",
      },
    ], // new
    [{ text: "09:25 Овчарци", callback_data: "stop_0925Овчарци" }],
    [
      {
        text: "09:25 Пиперево кръговото",
        callback_data: "stop_0925Пиперево кръговото",
      },
    ],
    [{ text: "09:30 103", callback_data: "stop_0930103" }],
    [{ text: "10:00 Вю", callback_data: "stop_1000Вю" }],

    [{ text: "14:10 Спортна зала", callback_data: "stop_1410Спортна зала" }],
    [{ text: "14:15 Спирка Марек", callback_data: "stop_1415Спортна Марек" }],
    [
      {
        text: "14:15 Сапарево кръговото",
        callback_data: "stop_1415Сапарево кръговото",
      },
    ],
    [{ text: "14:25 Овчарци", callback_data: "stop_1425Овчарци" }],
    [
      {
        text: "14:25 Пиперево кръговото",
        callback_data: "stop_1425Пиперево кръговото",
      },
    ],
    [{ text: "14:30 103", callback_data: "stop_1430103" }],
    [{ text: "15:00 Вю", callback_data: "stop_1500Вю" }],
    [{ text: "15:30 Вю", callback_data: "stop_1530Вю" }],

    [{ text: "Моят заявен транспорт", callback_data: "my_transport" }],
    [{ text: "Отказ от транспорта", callback_data: "cancel_transport" }],
  ];

  bot.sendMessage(groupId, "Изберете спирка:", {
    reply_markup: { inline_keyboard: busStopsKeyboard },
  });
}

/**
 * handleTransportCommand(chatId): sends aggregated message of all user requests for tomorrow
 */
function handleTransportCommand(chatId) {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedDate = tomorrow.toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  let finalMessage = `${formattedDate} Транспорт за двете посоки:\n`;
  let hasResponses = false;
  const stopAggregation = {};

  // Group all requests by selectedStop
  Object.values(userStates).forEach((state) => {
    if (
      state.responses &&
      state.responses.selectedStop &&
      state.responses.answer1 &&
      state.responses.answer2
    ) {
      const { selectedStop, answer1, answer2, userName } = state.responses;
      if (!stopAggregation[selectedStop]) {
        stopAggregation[selectedStop] = [];
      }
      stopAggregation[selectedStop].push({ userName, answer1, answer2 });
      hasResponses = true;
    }
  });

  if (hasResponses) {
    for (const [stop, userArray] of Object.entries(stopAggregation)) {
      const destinationMap = {};
      userArray.forEach(({ userName, answer1, answer2 }) => {
        const key = `${answer1}~~${answer2}`;
        if (!destinationMap[key]) {
          destinationMap[key] = [];
        }
        destinationMap[key].push(userName);
      });

      const subMessages = [];
      for (const [destKey, nameArray] of Object.entries(destinationMap)) {
        const [ans1, ans2] = destKey.split("~~");
        const joinedNames = joinNamesWithAnd([...nameArray]);
        subMessages.push(`${joinedNames} за ${ans1} до ${ans2}`);
      }
      const combinedSub = subMessages.join(", ");
      finalMessage += `${stop}: ${combinedSub}\n`;
    }
  } else {
    finalMessage = `Няма запитвания за транспорт за ${formattedDate}.`;
  }

  bot.sendMessage(chatId, finalMessage);
}

// ======================
// 9) SETUP BOT LISTENERS
// ======================
function setupBotListeners() {
  // ========== Automated Commands ==========

  // !бус at 07:00
  schedule.scheduleJob("0 7 * * *", () => {
    const chatId = "-4194911088";
    console.log("Automatically invoking !бус at 07:00...");
    handleBusCommand({ chat: { id: chatId }, from: { id: 0 } });
  });

  // !транспорт at 17:00 + private message to 7645547746
  schedule.scheduleJob("0 17 * * *", () => {
    const chatId = "-4194911088";
    console.log("Automatically invoking !транспорт at 17:00...");
    handleTransportCommand(chatId);
    // Also send a private message to user 7645547746
    bot.sendMessage(
      7645547746,
      "Напомняне: автоматично извикване на !транспорт беше извършено в групата."
    );
  });

  // ========== Standard Commands ==========

  // /start
  bot.onText(/\/start/, (msg) => {
    bot.sendMessage(msg.chat.id, "Welcome to the bot. Your data is saved automatically.");
  });

  // !съвет
  bot.onText(/!съвет/, (msg) => {
    sendRandomTip(msg.chat.id);
  });

  // !ид => reveals user ID
  bot.onText(/!ид/, (msg) => {
    bot.sendMessage(msg.chat.id, `Your user ID is: ${msg.from.id}`);
  });

  // !дота => example custom
  bot.onText(/!дота/, (msg) => {
    bot.sendMessage(msg.chat.id, "Най-яката игра...");
  });

  // !бус => manual
  bot.onText(/!бус/, (msg) => {
    handleBusCommand(msg);
  });

  // !транспорт => manual
  bot.onText(/!транспорт/, (msg) => {
    handleTransportCommand(msg.chat.id);
  });

  // !аз => show user’s current transport
  bot.onText(/!аз/, (msg) => {
    const userId = msg.from.id;
    if (userStates[userId] && userStates[userId].responses) {
      const { selectedStop, answer1, answer2 } = userStates[userId].responses;
      if (selectedStop && answer1 && answer2) {
        bot.sendMessage(
          msg.chat.id,
          `Заявихте транспорт от ${selectedStop} за ${answer1} до ${answer2}.`
        );
      } else {
        bot.sendMessage(msg.chat.id, "Не сте завършили процеса на заявка за транспорт.");
      }
    } else {
      bot.sendMessage(msg.chat.id, "Няма активна заявка за транспорт от ваша страна.");
    }
  });

  // !шофьори => lists drivers
  bot.onText(/!шофьори/, (msg) => {
    bot.sendMessage(
      msg.chat.id,
      "Методи 0892745105\nГеорги 0893486002\nДани 0894447940\nНики 0897414777"
    );
  });

  // !кой => which driver is on duty
  const outcome1Days = [1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30];
  const outcome2Days = [3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28, 31];

  bot.onText(/!кой(.*)/, (msg, match) => {
    const chatId = msg.chat.id;
    const requestedDate = match[1] ? match[1].trim() : null;

    let currentDate;
    if (requestedDate) {
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      currentDate = new Date(`${currentYear}-${currentMonth + 1}-${requestedDate}`);
    } else {
      currentDate = new Date();
    }

    if (isNaN(currentDate.getDate())) {
      bot.sendMessage(chatId, "Невалидна дата. Моля, въведете валидна дата.");
      return;
    }

    const currentDay = currentDate.getDate();
    let outcomeMessage = "";
    const isSpecificDate = requestedDate !== null;

    if (isSpecificDate) {
      if (outcome1Days.includes(currentDay)) {
        outcomeMessage = `На ${currentDay} по график са Методи (0892745105) и Дани (0894447940)`;
      } else if (outcome2Days.includes(currentDay)) {
        outcomeMessage = `На ${currentDay} по график са Ники (0897414777) и Георги (0893486002)`;
      } else {
        outcomeMessage = `На ${currentDay} няма определен шофьор по график.`;
      }
    } else {
      // No specific date => "today"
      if (outcome1Days.includes(currentDay)) {
        outcomeMessage =
          "Днес по график са Методи (0892745105) и Дани (0894447940)";
      } else if (outcome2Days.includes(currentDay)) {
        outcomeMessage =
          "Днес по график са Ники (0897414777) и Георги (0893486002)";
      } else {
        outcomeMessage = "Днес няма определен шофьор по график.";
      }
    }

    bot.sendMessage(chatId, outcomeMessage);
  });

  // !група => shows group ID
  bot.onText(/!група/, (msg) => {
    bot.sendMessage(msg.chat.id, `Group ID: ${msg.chat.id.toString()}`);
  });

  // !график => send a schedule image
  bot.onText(/!график/, (msg) => {
    const graphImage = "gr.jpg"; 
    fs.readFile(graphImage, (err, data) => {
      if (err) {
        console.error(err);
        bot.sendMessage(msg.chat.id, "Грешка при зареждане на графика.");
      } else {
        bot.sendPhoto(msg.chat.id, data, { caption: "График на седмицата" });
      }
    });
  });

  // !моля => send a gif
  bot.onText(/!моля/, (msg) => {
    const gifImage = "molq.gif";
    fs.readFile(gifImage, (err, data) => {
      if (err) {
        console.error(err);
        bot.sendMessage(msg.chat.id, "Грешка при зареждане на гифа.");
      } else {
        bot.sendDocument(msg.chat.id, data);
      }
    });
  });

  // New chat members => greet them
  bot.on("message", (msg) => {
    if (msg.new_chat_members && msg.new_chat_members.length > 0) {
      bot.sendMessage(msg.chat.id, "Добре дошли!");
    }
  });

  // ========== ADMIN COMMANDS ==========

  // !изтриване => ask in private "Да"/"Не" before clearing userStates
  bot.onText(/!изтриване/, (msg) => {
    const userId = msg.from.id;
    if (!isAdmin(userId)) {
      bot.sendMessage(msg.chat.id, "Нямате права за тази команда.");
      return;
    }
    bot.sendMessage(
      userId,
      "Наистина ли искате да изтриете заявеният транспорт?",
      {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Да", callback_data: "admin_delete_yes" }],
            [{ text: "Не", callback_data: "admin_delete_no" }],
          ],
        },
      }
    );
  });

  // !върни => restore last deleted userStates from history
  bot.onText(/!върни/, (msg) => {
    const userId = msg.from.id;
    if (!isAdmin(userId)) {
      bot.sendMessage(msg.chat.id, "Нямате права за тази команда.");
      return;
    }

    const historyData = loadDeletedHistory();
    if (historyData.length === 0) {
      bot.sendMessage(msg.chat.id, "Няма изтрити данни за връщане.");
      return;
    }

    // Pop the last item
    const lastItem = historyData.pop();
    saveDeletedHistory(historyData);

    // Restore
    userStates = { ...userStates, ...lastItem.userStates };
    saveDataToFile(userStates, () => {});

    bot.sendMessage(msg.chat.id, "Възстановихме последно изтритите userStates.");
  });

  // On callback_query: handle admin_delete_yes/no, plus other bus logic
  bot.on("callback_query", (callbackQuery) => {
    const userId = callbackQuery.from.id;
    const data = callbackQuery.data;

    if (data === "admin_delete_yes") {
      if (!isAdmin(userId)) {
        bot.sendMessage(userId, "Нямате права за тази команда.");
        return;
      }
      // Save current userStates to deletedStates.json
      const currentCopy = JSON.parse(JSON.stringify(userStates));
      const history = loadDeletedHistory();
      history.push({
        timestamp: Date.now(),
        userStates: currentCopy,
      });
      saveDeletedHistory(history);
      pruneDeletedHistory();

      // Now clear active
      userStates = {};
      saveDataToFile(userStates, () => {});

      bot.sendMessage(
        userId,
        "Изтритият транспорт беше съхранен в историята и изтрит от активните заявки."
      );
    } else if (data === "admin_delete_no") {
      bot.sendMessage(userId, "Отказано изтриване.");
    } else {
      // If not admin-delete callbacks, handle normal logic
      handleRegularCallbackQuery(callbackQuery);
    }
  });
}

/**
 * handleRegularCallbackQuery() processes normal bus stops, q1_, q2_, etc.
 */
function handleRegularCallbackQuery(callbackQuery) {
  const userId = callbackQuery.from.id;
  const data = callbackQuery.data;
  const callbackChatId = callbackQuery.message.chat.id;

  const userName =
    userNamesMapping[userId] ||
    callbackQuery.from.first_name ||
    callbackQuery.from.username ||
    "Неизвестен";

  if (data === "cancel_transport") {
    // Cancel transport
    if (userStates[userId]) {
      delete userStates[userId];
      saveDataToFile(userStates, (err) => {
        if (!err) {
          bot.sendMessage(userId, "Вашият избор за транспорт беше отменен.");
        } else {
          bot.sendMessage(userId, "Възникна грешка, моля опитайте отново.");
        }
      });
    }
  } else if (data === "my_transport") {
    if (userStates[userId] && userStates[userId].responses) {
      const { selectedStop, answer1, answer2 } = userStates[userId].responses;
      if (selectedStop && answer1 && answer2) {
        bot.sendMessage(
          userId,
          `Вашият заявен транспорт е от ${selectedStop} за ${answer1} до ${answer2}.`
        );
      } else {
        bot.sendMessage(
          userId,
          "Не сте завършили процеса на заявка за транспорт."
        );
      }
    } else {
      bot.sendMessage(userId, "Нямате активна заявка за транспорт.");
    }
  } else if (data.startsWith("stop_")) {
    // User clicked on a bus stop
    const selectedStopDescription = getBusStopDescription(data);
    if (!userStates[userId]) {
      userStates[userId] = {};
    }
    userStates[userId].privateChatId = userId;
    if (!userStates[userId].responses) {
      userStates[userId].responses = {};
    }
    userStates[userId].responses.selectedStop = selectedStopDescription;
    userStates[userId].responses.userName = userName;
    userStates[userId].responses.groupChatId = callbackChatId;
    saveDataToFile(userStates, () => {});
    // Next question
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "103", callback_data: "q1_103" }],
          [{ text: "Алпин", callback_data: "q1_Алпин" }],
          [{ text: "Вю", callback_data: "q1_Вю" }],
        ],
      },
    };
    bot.sendMessage(userId, "Къде?", options);
  } else if (data.startsWith("q1_")) {
    // First question answer
    const answer1 = data.replace("q1_", "");
    if (!userStates[userId]) {
      userStates[userId] = {};
    }
    if (!userStates[userId].responses) {
      userStates[userId].responses = {};
    }
    userStates[userId].responses.answer1 = answer1;
    userStates[userId].responses.userName = userName;
    saveDataToFile(userStates, () => {});
    // Next question
    const options = {
      reply_markup: {
        inline_keyboard: [
          [{ text: "15:30", callback_data: "q2_15:30" }],
          [{ text: "23:30", callback_data: "q2_23:30" }],
        ],
      },
    };
    bot.sendMessage(userId, "До кога?", options);
  } else if (data.startsWith("q2_")) {
    // Second question answer
    const answer2 = data.replace("q2_", "");
    if (!userStates[userId]) {
      userStates[userId] = {};
    }
    if (!userStates[userId].responses) {
      userStates[userId].responses = {};
    }
    userStates[userId].responses.answer2 = answer2;
    userStates[userId].responses.userName = userName;
    saveDataToFile(userStates, (err) => {
      if (!err) {
        const st = userStates[userId].responses.selectedStop;
        const a1 = userStates[userId].responses.answer1;
        bot.sendMessage(
          userId,
          `Заявихте транспорт от ${st} за ${a1} до ${answer2}.`
        );
      } else {
        bot.sendMessage(userId, "Възникна грешка, моля опитайте отново.");
      }
    });
  }
}
