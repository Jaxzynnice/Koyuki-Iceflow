const axios = require('axios');
const cheerio = require('cheerio');
const FormData = require('form-data');

module.exports = function(app) {
    async function getmyfb(urlFb) {
      try {
        const form = new FormData();
        form.append('id', urlFb);
        form.append('locale', 'id');
 
        const response = await axios.post('https://getmyfb.com/process', form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
 
        if (response.status === 200) {
          const $ = cheerio.load(response.data);
          const title = $('.results-item-text').text().trim();
          const thumbnail = $('.results-item-image').attr('src');
          const urlDownloads = {};
          const urlHd = $('.results-list li:nth-child(1) a').attr('href');
          const urlSd = $('.results-list li:nth-child(2) a').attr('href');
          return {
              title: title,
              thumb: thumbnail,
              video: {
                  hd: urlHd,
                  sd: urlSd,
              }
          }
        } else {
          return response.status;
        }
      } catch (error) {
        console.error(error);
        throw new Error(error.message);
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
            const vid = await getmyfb(url);
            res.writeHead(200, {
                'Content-Type': 'image/webp',
                'Content-Length': vid.length
            });
            res.end(vid);
        } catch (error) {
            res.status(500).json({
                status: false,
                message: error.message
            });
        }
    });
};