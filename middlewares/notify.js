const moment = require("moment");

const requestNotify = (req, res, next) => {
    console.log(`[${moment().format('L')}]`, req.method, '"' + req.url + '"');
    next();
}

module.exports = { requestNotify };