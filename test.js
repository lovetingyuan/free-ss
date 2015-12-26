function download(url, callback) {
    var http = require("https");
    http.get(url, function(res) {
        var data = "";
        res.on('data', function(chunk) {
            data += chunk;
        });
        res.on("end", function() {
            callback(data);
        });
    }).on("error", function() {
        callback(null);
    });
}
download("https://github.com/shadowsocks/shadowsocks-windows/releases/", function(data) {
    var cheerio = require("cheerio");
    if (data) {
        var $ = cheerio.load(data, {
            decodeEntities: false
        });

        var releaseTitle = $(".release-header");
        var releaseDownload = $(".release-downloads");
        console.log("num:" + releaseTitle.length + "  last version:" + releaseTitle.first().find('a').first().text());
        console.log("downloadlink:" + releaseDownload.first().find('a').first().attr('href'));
    }
});
