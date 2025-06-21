const fetch = require('node-fetch');

module.exports = function(app) {
    async function qc(pp, nick, teks) {
        try {
            const response = await fetch('https://bot.lyo.su/quote/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    "type": "quote",
                    "format": "png",
                    "backgroundColor": "#ffffff",
                    "width": 512,
                    "height": 768,
                    "scale": 2,
                    "messages": [{
                        "entities": [],
                        "avatar": true,
                        "from": {
                            "id": 1,
                            "name": nick,
                            "photo": {
                                "url": pp
                            }
                        },
                        "text": teks,
                        "replyMessage": {}
                    }]
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(`HTTP error! status: ${response.status}, message: ${JSON.stringify(errorData)}`);
            }

            return response.buffer();
        } catch (error) {
            console.error("Error in qc function:", error);
            throw new Error(error.message);
        }
    }

    app.get('/maker/qc', async (req, res) => {
        try {
            const { url, name, text } = req.query;
            if (!url || !name || !text) {
                return res.status(400).json({
                    status: false,
                    message: 'Missing Input Parameters'
                });
            }
            const img = await qc(ava, name, text);
            res.writeHead(200, {
                'Content-Type': 'image/png',
                'Content-Length': img.length
            });
            res.end(img);
        } catch (error) {
            console.error("Error in /maker/qc route:", error);
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};