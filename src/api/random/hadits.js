const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    async function hadits() {
        try {
            const {
                data
            } = await axios.get('https://api.myquran.com/v2/hadits/arbain/semua');
            const datanya = data.data;
            const randomData = datanya[Math.floor(Math.random() * datanya.length)];

            return {
                index: randomData.no,
                title: randomData.judul,
                arabic: randomData.arab,
                indonesian: randomData.indo
            };
        } catch (error) {
            console.error(error);
            throw new Error(error.message);
        }
    }

    app.get('/random/hadits', async (req, res) => {
        try {
            const msg = await hadist();
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