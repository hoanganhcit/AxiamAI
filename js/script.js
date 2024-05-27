!(function (e) {
    "use strict";
    var t = e(window);
    if (
        (t.on("load", function () {
            e("#preloader").fadeOut("1000", function () {
                e(this).remove();
            });
        }),
        t.on("scroll", function () {
            t.scrollTop() > 0 ? e(".header-area").addClass("sticky") : e(".header-area").removeClass("sticky");
        }))
    );
})(jQuery);
