(function () {
    let nconf = require('nconf');

    nconf.argv()
        .env({whitelist: 'A'})
        .file({ file: './config.json' });

    module.exports = nconf;
})();