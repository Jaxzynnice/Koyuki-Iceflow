const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    async function quotes() {
        try {
            const response = await axios.get("https://quotes.toscrape.com/random", {
                headers: {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36",
                },
            });

            const $ = cheerio.load(response.data);
            const quote = $(".quote .text").text().trim();
            const author = $(".quote .author").text().trim();
            const tags = $(".quote .tags .tag")
            .map((_, el) => $(el).text().trim())
            .get();

            if (!quote || !author || !tags) {
                throw new Error("Invalid response structure");
            }

            return {
                quote,
                author,
                tags
            };
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    app.get('/random/quotes', async (req, res) => {
        try {
            const msg = await quotes();
            res.status(200).json({
                status: true,
                data: msg
            });
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};