const TelegramBot = require("node-telegram-bot-api");
const fs = require("fs");
const token = "6903011612:AAEX_0Vvv1vEgOiPZrSyEf-udZtuMzjfsy8";
const bot = new TelegramBot(token, { polling: true });

const schedule = require("node-schedule");

let lastResetDate = new Date().toLocaleDateString(); // Initialize to today's date

// Function to reset userStates and save to file
function resetUserStates() {
  userStates = {}; // Reset userStates to an empty object

  // Update and save the last reset date
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

// Schedule task to reset userStates at 23:50
schedule.scheduleJob("50 23 * * *", () => {
  console.log("Resetting userStates at 23:50...");
  resetUserStates();
});

// Schedule another task to reset userStates at 00:10
schedule.scheduleJob("10 0 * * *", () => {
  console.log("Resetting userStates at 00:10...");
  resetUserStates();
});

// The rest of your bot setup and event listeners go here...

const dataFilePath = "./userStates.json"; // File path for saving user states
let userStates = {}; // Initialize userStates

// Function to save data to file with callback
function saveDataToFile(data, callback) {
  fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error saving data to file:", err);
      callback(err);
    } else {
      console.log("Data successfully saved to file.");
      callback(null); // No error occurred, proceed with the next operation
    }
  });
}

// Function to load data from file
function loadDataFromFile(callback) {
  fs.readFile(dataFilePath, (err, data) => {
    if (err) {
      console.error("Error reading data from file:", err);
      callback(false); // Indicate failure to load data
    } else {
      try {
        userStates = JSON.parse(data);
        console.log("Data successfully loaded from file.");
        callback(true); // Indicate success
      } catch (parseError) {
        console.error("Error parsing data from file:", parseError);
        callback(false); // Indicate failure to parse
      }
    }
  });
}

// Example usage of updateUserState function
function updateUserState(userId, updateData) {
  // Ensure the user's state exists
  if (!userStates[userId]) {
    userStates[userId] = {};
  }

  // Merge updateData into the user's current state
  userStates[userId] = { ...userStates[userId], ...updateData };

  // Save the updated states to file
  saveDataToFile(userStates);
}

// Load user states from file on startup
loadDataFromFile((success) => {
  if (success) {
    console.log("User states loaded successfully. Bot is ready.");
  } else {
    console.log(
      "Failed to load user states. Bot is starting with empty states."
    );
  }

  // Now you can setup your bot event listeners
  setupBotListeners();
});
// Example setup for bot event listeners
function setupBotListeners() {
  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(
      chatId,
      "Welcome to the bot. Your data will be saved automatically."
    );
  });

  // Handle other commands and interactions
}
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
      lastResetDate = new Date().toLocaleDateString(); // Default to today if loading fails
    } else {
      lastResetDate = data;
    }
  });
}

loadLastResetDate(); // Ensure this is called when your bot starts

loadLastResetDate(); // Call this when your bot starts

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
  // Add more tips as needed
];

// Function to shuffle the tips array
function shuffle(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
}

// Shuffle the tips array
shuffle(tipsArray);

let scheduledTips = 0;
let tipsSentToday = 0;
let lastSentDay = new Date().getDate();

// Function to send a random tip
function sendRandomTip(chatId) {
  const randomTip = tipsArray[scheduledTips];
  bot.sendMessage(chatId, `Съвет за обслужване: ${randomTip}`);
  scheduledTips = (scheduledTips + 1) % tipsArray.length;
  tipsSentToday += 1;

  // Reset tips count if it's a new day
  const currentDay = new Date().getDate();
  if (currentDay !== lastSentDay) {
    tipsSentToday = 1;
    lastSentDay = currentDay;
  }
}

// Schedule random tips between 09:00 and 22:00
function scheduleRandomTips() {
  const startHour = 9;
  const endHour = 22;

  const intervalId = setInterval(() => {
    const currentHour = new Date().getHours();

    if (
      currentHour >= startHour &&
      currentHour <= endHour &&
      tipsSentToday < 5
    ) {
      const chatId = "-1002132799014"; // Replace with the actual chat ID
      sendRandomTip(chatId);
    }
  }, 3 * 60 * 60 * 1000); // Check every 3 hours
}

// Command handler for !съвет
bot.onText(/!съвет/, (msg) => {
  const chatId = msg.chat.id;
  sendRandomTip(chatId);
});

// Start scheduling random tips
scheduleRandomTips();

// Rest of your code...

bot.onText(/!ид/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  bot.sendMessage(chatId, `Your user ID is: ${userId}`);
});
bot.onText(/!дота/, (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;
  bot.sendMessage(
    chatId,
    `Най-яката игра.Жалко, че само Митко и Иван могат да я играят и носят Сашо на гръб.`
  );
});

//const userStates = {};

bot.onText(/!бус/, (msg) => {
  const currentDate = new Date().toLocaleDateString();

  // Check if it's the first time the command is executed today
  if (currentDate !== lastResetDate) {
    console.log("Resetting userStates for the first time today...");
    resetUserStates(); // Reset the user states
    lastResetDate = currentDate; // Update the last reset date to today
    saveLastResetDate(); // Persist the last reset date change
  }

  const chatId = msg.chat.id;
  // Define or reference your busStopsKeyboard here. For demonstration, a simplified version is shown.
  const busStopsKeyboard = [
    [{ text: "06:10 Спортна зала", callback_data: "stop_0610Спортна зала" }],
    [{ text: "06:20 Спирка Марек", callback_data: "stop_0620Спирка Марек" }],
    [{ text: "06:25 Овчарци", callback_data: "stop_0625Овчарци" }],
    [{ text: "06:30 103", callback_data: "stop_0630103" }],
    [
      {
        text: "06:40 Сапарево кръговото",
        callback_data: "stop_0640Сапарево кръговото",
      },
    ],
    [{ text: "07:00 Вю", callback_data: "stop_0700Вю" }],
    [{ text: "09:10 Спортна зала", callback_data: "stop_0910Спортна зала" }],
    [{ text: "09:20 Спирка Марек", callback_data: "stop_0920Спирка Марек" }],
    [{ text: "09:25 Овчарци", callback_data: "stop_0925Овчарци" }],
    [{ text: "09:30 103", callback_data: "stop_0930103" }],
    [{ text: "10:00 Вю", callback_data: "stop_1000Вю" }],
    [{ text: "14:10 Спортна зала", callback_data: "stop_1410Спортна зала" }],
    [{ text: "14:20 Спирка Марек", callback_data: "stop_1420Спирка Марек" }],
    [{ text: "14:25 Овчарци", callback_data: "stop_1425Овчарци" }],
    [{ text: "14:30 103", callback_data: "stop_1430103" }],
    [{ text: "15:00 Вю", callback_data: "stop_1500Вю" }],
    [{ text: "Моят заявен транспорт", callback_data: "my_transport" }],
    [{ text: "Отказ от транспорта", callback_data: "cancel_transport" }],
  ];

  bot.sendMessage(chatId, "Изберете спирка:", {
    reply_markup: { inline_keyboard: busStopsKeyboard },
  });
});

bot.on("callback_query", (callbackQuery) => {
  const userId = callbackQuery.from.id; // User's unique identifier
  const data = callbackQuery.data;
  const chatId = callbackQuery.message.chat.id; // Chat ID of the message origin (group or private chat)
  const userChatId = callbackQuery.from.id; // Use this for sending private messages

  if (data === "cancel_transport") {
    // Handle cancel_transport action
    if (userStates[userId]) {
      delete userStates[userId];
      saveDataToFile(userStates, (err) => {
        if (!err) {
          // Send a private message to the user
          bot.sendMessage(
            userChatId,
            "Вашият избор за транспорт беше отменен."
          );
        } else {
          // Handle error scenario, still in private
          bot.sendMessage(userChatId, "Възникна грешка, моля опитайте отново.");
        }
      });
    }
  } else if (data === "my_transport") {
    // Handle "Моят заявен транспорт" action
    if (userStates[userId] && userStates[userId].responses) {
      const { selectedStop, answer1, answer2 } = userStates[userId].responses;
      if (selectedStop && answer1 && answer2) {
        // Send a private message to the user
        bot.sendMessage(
          userChatId,
          `Вашият заявен транспорт е от ${selectedStop} за ${answer1} до ${answer2}.`
        );
      } else {
        // If the process is not complete, inform the user in private
        bot.sendMessage(
          userChatId,
          "Не сте завършили процеса на заявка за транспорт."
        );
      }
    }
  } else if (data.startsWith("stop_")) {
    // Handling bus stop selection
    const selectedStopDescription = getBusStopDescription(data);
    userStates[userId] = {
      chatId: chatId,
      responses: { selectedStop: selectedStopDescription },
    };

    // Save state and proceed without waiting for confirmation
    saveDataToFile(userStates, () => {});
    askFirstQuestion(userId);
  } else if (data.startsWith("q1_")) {
    // Handling the first question (e.g., selecting destination)
    const answer1 = data.replace("q1_", "");
    if (userStates[userId]) {
      userStates[userId].responses.answer1 = answer1;

      // Save state and proceed without waiting for confirmation
      saveDataToFile(userStates, () => {});
      askSecondQuestion(userId);
    }
  } else if (data.startsWith("q2_")) {
    // Handling the second question (e.g., selecting time)
    const answer2 = data.replace("q2_", "");
    if (userStates[userId] && userStates[userId].responses) {
      userStates[userId].responses.answer2 = answer2;

      // Now, save the updated userStates and wait for the operation to complete
      saveDataToFile(userStates, (err) => {
        if (!err) {
          // Send confirmation message after successful save
          bot.sendMessage(
            chatId,
            `Заявихте транспорт от ${userStates[userId].responses.selectedStop} за ${userStates[userId].responses.answer1} до ${answer2}.`
          );
        } else {
          // Handle error scenario
          bot.sendMessage(chatId, "Възникна грешка, моля опитайте отново.");
        }
      });
    }
  }
  // Continue with other callback query handling...
});

function saveDataToFile(data, callback) {
  fs.writeFile(dataFilePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error saving data to file:", err);
      callback(err);
    } else {
      console.log("Data successfully saved to file.");
      callback(null); // No error occurred
    }
  });
}

function getBusStopDescription(data) {
  // Your function to translate callback data to a human-readable stop description
  // For simplicity, this is just a placeholder
  return "Some Bus Stop Description";
}

function askFirstQuestion(userId) {
  // Implementation of asking the first question
  // This is a placeholder
  console.log(`Asking first question to user ${userId}`);
}

function askSecondQuestion(userId) {
  // Implementation of asking the second question
  // This is a placeholder
  console.log(`Asking second question to user ${userId}`);
}

// Handle other cases

function getBusStopDescription(callbackData) {
  const mapping = {
    "stop_0610Спортна зала": "06:10 Спортна зала",
    "stop_0620Спирка Марек": "06:20 Спирка Марек",
    stop_0625Овчарци: "06:25 Овчарци",
    stop_0630103: "06:30 103",
    "stop_0640Сапарево кръговото": "06:40 Сапарево кръговото",
    stop_0700Вю: "07:00 Вю",
    "stop_0910Спортна зала": "09:10 Спортна зала",
    "stop_0920Спирка Марек": "09:20 Спирка Марек",
    stop_0925Овчарци: "09:25 Овчарци",
    stop_0930103: "09:30 103",
    stop_1000Вю: "10:00 Вю",
    "stop_1410Спортна зала": "14:10 Спортна зала",
    "stop_1420Спирка Марек": "14:20 Спирка Марек",
    stop_1425Овчарци: "14:25 Овчарци",
    stop_1430103: "14:30 103",
    stop_1500Вю: "15:00 Вю",
  };

  return mapping[callbackData] || "Unknown Stop";
}

function askFirstQuestion(userId) {
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "103", callback_data: "q1_103" }],
        [{ text: "Алпин", callback_data: "q1_Алпин" }],
        [{ text: "Вю", callback_data: "q1_Вю" }],
      ],
    }),
  };
  bot.sendMessage(userId, "Къде?", options);
}

function askSecondQuestion(userId) {
  const options = {
    reply_markup: JSON.stringify({
      inline_keyboard: [
        [{ text: "15:30", callback_data: "q2_15:30" }],
        [{ text: "23:30", callback_data: "q2_23:30" }],
      ],
    }),
  };
  bot.sendMessage(userId, "До кога?", options);
}

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
      bot.sendMessage(
        msg.chat.id,
        "Не сте завършили процеса на заявка за транспорт."
      );
    }
  } else {
    bot.sendMessage(
      msg.chat.id,
      "Няма активна заявка за транспорт от ваша страна."
    );
  }
});

bot.onText(/!транспорт/, (msg) => {
  const chatId = msg.chat.id; // Keep chatId as a number
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formattedDate = tomorrow.toLocaleDateString("bg-BG", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  let finalMessage = `${formattedDate} Транспорт за двете посоки:\n`;
  let hasResponses = false; // Initialize a flag to track if there are valid responses

  // Initialize localAggregation outside of any specific condition
  const localAggregation = {};

  Object.values(userStates).forEach((state) => {
    if (
      state.chatId === chatId &&
      state.responses.selectedStop &&
      state.responses.answer1 &&
      state.responses.answer2
    ) {
      const key = `${state.responses.selectedStop}:${state.responses.answer1}:${state.responses.answer2}`;
      if (!localAggregation[key]) {
        localAggregation[key] = { count: 1, ...state.responses };
      } else {
        localAggregation[key].count += 1;
      }
      hasResponses = true; // Set flag to true as there is at least one valid response
    }
  });

  // Construct the final message based on aggregated data
  if (hasResponses) {
    Object.entries(localAggregation).forEach(([_, value]) => {
      const { count, selectedStop, answer1, answer2 } = value;
      finalMessage += `${selectedStop}: ${count} за ${answer1} до ${answer2}\n`;
    });
  } else {
    finalMessage = `Няма запитвания за транспорт за ${formattedDate}.`;
  }

  bot.sendMessage(chatId, finalMessage);
});

bot.onText(/!шофьори/, (msg) => {
  const chatId = msg.chat.id;
  bot.sendMessage(
    chatId,
    "Методи 0892745105\nГеорги 0893486002\nДани 0894447940\nНики 0897414777"
  );
});
// Command handler for !кой
const outcome1Days = [
  1, 2, 5, 6, 9, 10, 13, 14, 17, 18, 21, 22, 25, 26, 29, 30,
];
const outcome2Days = [3, 4, 7, 8, 11, 12, 15, 16, 19, 20, 23, 24, 27, 28, 31];

// Command handler for !кой
bot.onText(/!кой(.*)/, async (msg, match) => {
  const chatId = msg.chat.id;
  const requestedDate = match[1] ? match[1].trim() : null;

  let currentDate;

  if (requestedDate) {
    // Assuming DD format, use current month and year
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    currentDate = new Date(
      `${currentYear}-${currentMonth + 1}-${requestedDate}`
    );
  } else {
    currentDate = new Date();
  }

  if (isNaN(currentDate.getDate())) {
    bot.sendMessage(chatId, "Невалидна дата. Моля, въведете валидна дата.");
    return;
  }

  const currentDay = currentDate.getDate();

  console.log(`Current Day: ${currentDay}`);

  let outcomeMessage = "";
  const isSpecificDate = requestedDate !== null;

  if (isSpecificDate) {
    if (outcome1Days.includes(currentDay)) {
      outcomeMessage = `На ${currentDay} по график са Методи (0892745105) и Дани (0894447940)`;
      console.log("Outcome 1");
    } else if (outcome2Days.includes(currentDay)) {
      outcomeMessage = `На ${currentDay} по график са Ники (0897414777) и Георги (0893486002)`;
      console.log("Outcome 2");
    } else {
      outcomeMessage = `На ${currentDay} няма определен шофьор по график.`;
      console.log("No Outcome");
    }
  } else {
    if (outcome1Days.includes(currentDay)) {
      outcomeMessage =
        "Днес по график са Методи (0892745105) и Дани (0894447940)";
      console.log("Outcome 1");
    } else if (outcome2Days.includes(currentDay)) {
      outcomeMessage =
        "Днес по график са Ники (0897414777) и Георги (0893486002)";
      console.log("Outcome 2");
    } else {
      outcomeMessage = "Днес няма определен шофьор по график.";
      console.log("No Outcome");
    }
  }

  bot.sendMessage(chatId, outcomeMessage);
});

// Command handler for !група
bot.onText(/!група/, (msg) => {
  const chatId = msg.chat.id; // Extracting the chat ID from the message object
  // Respond with the chat ID. Ensure to convert chatId to a string if necessary.
  bot.sendMessage(chatId, `Group ID: ${chatId.toString()}`);
});
// Command handler for !график
bot.onText(/!график/, (msg) => {
  const chatId = msg.chat.id;
  const graphImage = "gr.jpg"; // Assuming the image file is in the same directory

  // Read the image file and send it
  fs.readFile(graphImage, (err, data) => {
    if (err) {
      console.error(err);
      bot.sendMessage(chatId, "Грешка при зареждане на графика.");
    } else {
      bot.sendPhoto(chatId, data, { caption: "График на седмицата" });
    }
  });
});

bot.onText(/!моля/, (msg) => {
  const chatId = msg.chat.id;
  const gifImage = "molq.gif"; // Assuming the gif file is in the same directory

  fs.readFile(gifImage, (err, data) => {
    if (err) {
      console.error(err);
      bot.sendMessage(chatId, "Грешка при зареждане на гифа.");
    } else {
      bot.sendDocument(chatId, data);
    }
  });
});

// Add this message event listener for greeting new chat members
bot.on("message", (msg) => {
  // Check if the message has new chat members
  if (msg.new_chat_members && msg.new_chat_members.length > 0) {
    const chatId = msg.chat.id;
    // Send a greeting message to the chat
    bot.sendMessage(chatId, "Добре дошли!");
  }
});
// ... (Rest of your code)
