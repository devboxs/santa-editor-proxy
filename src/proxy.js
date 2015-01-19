/**
 * Created by Dan_Shappir on 1/19/15.
 */
/*eslint global-strict:0*/
'use strict';

var promise = require("bluebird");
var rp = require('request-promise');

var DEFAULT_SITE = 'www.mattihemmings.com';

module.exports = function proxy(app, site) {
    app.use(function (req, res, next) {
        res.setHeader('Access-Control-Allow-Origin', '*');
        next();
    });

    var info;
    app.get('/sites/def', function(req, res) {
        info = siteInfo(req.query.site || site || DEFAULT_SITE);

        var urlPromise = rp(info.url + '?ds=true&debug=all');

        var siteAsJsonPromise = urlPromise
            .then(fetchSiteAsJson)
            .then(JSON.stringify);

        promise
            .join(urlPromise, siteAsJsonPromise,
                promise.resolve(info.match), promise.resolve(req.headers.host), insertSiteAsJson)
            .then(function (result) {
                res.send(result);
            });
    });

    app.get('/*', function(req, res) {
        rp(info.url + req.originalUrl)
            .then(function (result) {
                res.send(result);
            });
    });
};

function siteInfo(site) {
    var url;
    var host;
    if (site.indexOf(':') === -1) {
        host = site;
        url = 'http://' + site;
    } else {
        url = site;
        host = site.replace(/^.+:\/\/(.+)$/, '$1');
    }
    return {
        url: url,
        host: host,
        match: new RegExp(host.replace(/[./]/g, '\\$&'), 'g')
    };
}

function fetchPageJson(jsonUrl) {
    return rp(jsonUrl)
        .then(JSON.parse);
}

function fetchPageJsonFallback(jsonUrls) {
    return fetchPageJson(jsonUrls[0])
        .catch(function () {
            return jsonUrls.length > 1 ? fetchPageJsonFallback(jsonUrls.slice(1)) : null;
        });
}

function fetchSiteAsJson(source) {
    var publicModelMatch = source.match(/publicModel\s=\s({.+);$/m);
    if (!publicModelMatch) {
        return null;
    }

    var publicModel = JSON.parse(publicModelMatch[1]);
    var pageList = publicModel.pageList;

    var siteAsJsonPromise = {
        masterPage: fetchPageJson(pageList.masterPage[0]),
        pages: promise.all(pageList.pages.map(function (page) {
            return page.urls;
        }).map(fetchPageJsonFallback))
    };
    return promise.props(siteAsJsonPromise);
}

function insertSiteAsJson(source, siteAsJson, orig, host) {
    var i = source.indexOf('</script>');
    var result = source.substring(0, i) +
        '</script>\n<script>\nvar siteAsJson = ' + siteAsJson + ';\n'
        + source.substring(i);
    return result.replace(orig, host);
}
