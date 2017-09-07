$(window).on('load', function () {

    let toggleButtons = function () {
        $('#extractNormalizedDataBtn').prop('disabled', !$('#extractNormalizedDataBtn').prop('disabled'));
        $('#updateSoDumpBtn').prop('disabled', !$('#updateSoDumpBtn').prop('disabled'));
        $('#updateSoUserDumpBtn').prop('disabled', !$('#updateSoUserDumpBtn').prop('disabled'));
    }

    let startProcess = function () {
        toggleButtons();
        NProgress.start();
    }

    let endProcess = function () {
        toggleButtons();
        NProgress.done();
    }

    $('#extractNormalizedDataBtn').click(function () {
        startProcess();
        $.ajax({
            url: "/api/write-csv",
            method: "GET",
            contentType: "application/json"
        }).done(function (msg) {
            endProcess();
            new Noty({
                text: msg
            }).show();
        }).fail(function (jqXHR, textStatus) {
            endProcess();
            new Noty({
                type: 'error',
                text: JSON.stringify(jqXHR) + '' + textStatus
            }).show();
        });
    });

    $('#updateSoDumpBtn').click(function () {
        startProcess();
        $.ajax({
            url: "/api/update-dump",
            method: "GET",
            contentType: "application/json"
        }).done(function (msg) {
            endProcess();
            new Noty({
                text: msg
            }).show();
        }).fail(function (jqXHR, textStatus) {
            endProcess();
            new Noty({
                type: 'error',
                text: JSON.stringify(jqXHR) + '' + textStatus
            }).show();
        });
    });

    $('#updateSoUserDumpBtn').click(function () {
        startProcess();
        $.ajax({
            url: "/api/users/update",
            method: "GET",
            contentType: "application/json"
        }).done(function (msg) {
            endProcess();
            new Noty({
                text: msg
            }).show();
        }).fail(function (jqXHR, textStatus) {
            endProcess();
            new Noty({
                type: 'error',
                text: JSON.stringify(jqXHR) + '' + textStatus
            }).show();
        });
    });

    let getInstalledDumpInfo = function () {
        $.ajax({
            url: "/api/dump/installed",
            method: "GET",
            contentType: "application/json"
        }).done(function (msg) {

            var date = moment(msg.mtime);
            var dateComponent = date.utc().format('YYYY-MM-DD HH:mm:ss');

            $('#dumpModificationDateInfoDiv').text(dateComponent);
            $('#dumpSizeDiv').text(msg.size + ' bytes');
        }).fail(function (jqXHR, textStatus) {
            new Noty({
                type: 'error',
                text: JSON.stringify(jqXHR) + '' + textStatus
            }).show();
        });
    }

    let getConfig = function () {
        $.ajax({
            url: "/api/config",
            method: "GET",
            contentType: "application/json"
        }).done(function (response) {
            let config = JSON.stringify(response, null, 2);
            $('#configDiv').text(config);
        }).fail(function (jqXHR, textStatus) {
            new Noty({
                type: 'error',
                text: JSON.stringify(jqXHR) + '' + textStatus
            }).show();
        });
    }

    getInstalledDumpInfo();

    getConfig();

});