(function () {
    let nconf = require('nconf');

    nconf.argv()
        .env()
        .file({ file: './config.json' });

    module.exports = nconf;
})();