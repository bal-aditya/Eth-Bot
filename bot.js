require('dotenv').config();
const TelegramBot = require('node-telegram-bot-api');
const Web3 = require('web3');
const TelegramToken = require('./artifacts/contracts/TelegramToken.sol/TelegramToken.json');

// Initialize Telegram Bot
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

// Initialize Web3
const web3 = new Web3(process.env.ETHEREUM_RPC_URL);
const contract = new web3.eth.Contract(
    TelegramToken.abi,
    process.env.CONTRACT_ADDRESS
);

// Command handlers
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, 'Welcome to the Ethereum Telegram Bot! Use /help to see available commands.');
});

bot.onText(/\/help/, (msg) => {
    const chatId = msg.chat.id;
    const helpText = `
Available commands:
/balance - Check your token balance
/transfer <address> <amount> - Transfer tokens to another address
/address - Get your Ethereum address
    `;
    bot.sendMessage(chatId, helpText);
});

bot.onText(/\/balance/, async (msg) => {
    const chatId = msg.chat.id;
    try {
        const balance = await contract.methods.balanceOf(msg.from.id).call();
        bot.sendMessage(chatId, `Your balance: ${web3.utils.fromWei(balance, 'ether')} TGRAM`);
    } catch (error) {
        bot.sendMessage(chatId, 'Error fetching balance. Please try again later.');
    }
});

bot.onText(/\/transfer (.+)/, async (msg, match) => {
    const chatId = msg.chat.id;
    const params = match[1].split(' ');
    
    if (params.length !== 2) {
        return bot.sendMessage(chatId, 'Please use format: /transfer <address> <amount>');
    }

    const [toAddress, amount] = params;
    
    try {
        const tx = await contract.methods.transfer(
            toAddress,
            web3.utils.toWei(amount, 'ether')
        ).send({
            from: msg.from.id,
            gas: 200000
        });
        
        bot.sendMessage(chatId, `Transfer successful! Transaction hash: ${tx.transactionHash}`);
    } catch (error) {
        bot.sendMessage(chatId, 'Error during transfer. Please check the address and amount.');
    }
});

bot.onText(/\/address/, (msg) => {
    const chatId = msg.chat.id;
    bot.sendMessage(chatId, `Your Ethereum address: ${msg.from.id}`);
});

// Error handling
bot.on('polling_error', (error) => {
    console.log(error);
}); 