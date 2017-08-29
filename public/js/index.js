$(window).on('load', function () {

    $('#extractNormalizedDataBtn').click(function () {
        var request = $.ajax({
            url: "/api/write-csv",
            method: "GET",
            contentType: "application/json"
        }).done(function (msg) {
        }).fail(function (jqXHR, textStatus) {
        });
    });

    $('#updateSoDumpBtn').click(function () {
        var request = $.ajax({
            url: "/api/update-dump",
            method: "GET",
            contentType: "application/json"
        }).done(function (msg) {
        }).fail(function (jqXHR, textStatus) {
        });
    });
});