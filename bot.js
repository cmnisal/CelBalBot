const TelegramBot = require('node-telegram-bot-api');
var columnify = require('columnify')

// replace the value below with the Telegram token you receive from @BotFather
const token = '1558004589:AAGCiy4IXgXNDlS0dWsYHQjpVFCvgi04p-w';

//CEL

const {
    Celsius,
    AUTH_METHODS,
    ENVIRONMENT
} = require('celsius-sdk')
const partnerKey = process.env.PARTNER_TOKEN
const fs = require('fs');


/**
 * Runs the functions from the Celsius API
 */
function init() {
    readKeys();
    // runCelsius('balance');
    // runCelsius("interest");
    // runCelsius('stats');
    // runCelsius('pagination');
}

init();
/**
 * Reads in the partner key and API key.
 */
function readKeys() {
    var content = fs.readFileSync("credentials.json");
    var json = JSON.parse(content);
    process.env.PARTNER_TOKEN = json['partnerKey'];
    process.env.APP_KEY = json['appKey'];
}


// Create a bot that uses 'polling' to fetch new updates
const bot = new TelegramBot(token, { polling: true });

// Matches "/echo [whatever]"
bot.onText(/\/echo (.+)/, (msg, match) => {
    // 'msg' is the received Message from Telegram
    // 'match' is the result of executing the regexp above on the text content
    // of the message

    const chatId = msg.chat.id;
    const resp = match[1]; // the captured "whatever"

    // send back the matched "whatever" to the chat
    bot.sendMessage(chatId, resp);
});

// Listen for any kind of message. There are different kinds of
// messages.
bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    // print(msg.text)
    process.env.APP_KEY = msg.text;
    // send a message to the chat acknowledging receipt of their message
    runCelsius('balance', chatId)
});



function runCelsius(call, chatId) {
    Celsius({
        authMethod: AUTH_METHODS.API_KEY,
        partnerKey: process.env.PARTNER_TOKEN
    }).then((celsius) => {
        console.warn("successfully connected");
        switch (call) {
            case "balance":
                celsius.getBalanceSummary(process.env.APP_KEY).then((balanceSummary) => {
                        console.log(balanceSummary)
                        text = "*🔶 Your #Celsius Balance* \n";
                        objBal = balanceSummary.balance;
                        console.log(objBal);
                        for (coin in objBal) {
                            if (objBal[coin] > 0) {
                                text += "`\n$" + coin.toUpperCase().split(" ")[0].padEnd(4, " ") + "   `: " + objBal[coin] + "";
                            } else { delete objBal[coin]; }
                        }
                        // text += "\n``` " + (columnify(objBal, { columns: ['COIN', 'AMOUNT'] })).toUpperCase() + "```";

                        bot.sendMessage(chatId, text, { "parse_mode": 'Markdown' });

                    })
                    .catch((error) => {
                        console.error(error)
                    })
                break;
            case 'interest':
                celsius.getInterestSummary(process.env.APP_KEY).then((interestSummary) => {
                        console.log(interestSummary)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                break;
            case 'stats':
                celsius.getStatistics(process.env.APP_KEY).then((statistics) => {
                    console.log(statistics);
                }).catch((error) => {
                    console.log(error);
                })
                break;
            case 'pagination':
                const pagination = {
                    page: 1,
                    perPage: 1
                }

                celsius.getTransactionSummary(pagination, process.env.APP_KEY).then((transactions) => {
                        console.log(transactions)
                    })
                    .catch((error) => {
                        console.log(error)
                    })
                break;
            default:
                console.log("invalid selection");
                break;
        }
    })
}