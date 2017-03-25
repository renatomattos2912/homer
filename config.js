var config = {};

config.web = {};
config.bot = {};

config.web.port = process.env.WEB_PORT || 8080;

// BOT Config
config.bot.model = process.env.model || 'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/e98524c2-1a9e-4fbb-b041-e19573c38287?subscription-key=87c29fc48d1c4a4d9ca94ba98e46f66f&verbose=true&q=';

module.exports = config;