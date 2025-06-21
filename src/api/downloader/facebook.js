const axios = require('axios');
const cheerio = require('cheerio');

module.exports = function(app) {
    async function yt5sIo(url) {
        try {
            const form = new URLSearchParams();
            form.append("q", decodeURIComponent(url));
            form.append("vt", "home");
 
            const response = await axios.post('https://yt5s.io/api/ajaxSearch', form, {
                headers: {
                    "Accept": "application/json",
                    "X-Requested-With": "XMLHttpRequest",
                    "Content-Type": "application/x-www-form-urlencoded",
                },
            });
 
            if (response.data.status === "ok") {
                const $ = cheerio.load(response.data.data);
                
                const thumbnailUrl = $('img').attr("src");
                const videoQualities = [];
                $('table tbody tr').each((index, element) => {
                    const quality = $(element).find('.video-quality').text().trim();
                    const downloadLink = $(element).find('a.download-link-fb').attr("href");
                    if (quality && downloadLink) {
                        videoQualities.push({ quality, downloadLink });
                    }
                });
 
                return {
                    thumbnailUrl,
                    videoQualities
                };
            } else {
                throw new Error("Failed to fetch video: " + response.data.message);
            }
        } catch (error) {
            throw error;
        }
    }

    app.get('/downloader/facebook', async (req, res) => {
        try {
            const {
                url
            } = req.query;
            if (!url) {
                return res.status(400).json({
                    status: false,
                    message: 'URL Required'
                });
            }
            const request = await yt5sIo(url);
            const response = await axios.get(request.videoQualities[0].downloadLink, {
                responseType: 'arraybuffer'
            });
            const buffer = await Buffer.from(response.data);
            res.writeHead(200, {
                'Content-Type': 'video/mp4',
                'Content-Length': buffer.length
            });
            res.end(buffer);
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};