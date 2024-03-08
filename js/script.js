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
        }),
        e.fn.owlCarousel)
    ) {
        var a = e(".welcome_slides");
        a.owlCarousel({ items: 1, loop: !0, autoplay: !0, smartSpeed: 1500, nav: !0, navText: ["<i class='ti-angle-left'</i>", "<i class='ti-angle-right'</i>"], dots: !0, animateIn: "fadeIn", animateOut: "fadeOut" }),
            a.on("translate.owl.carousel", function () {
                e("[data-animation]").each(function () {
                    var t = e(this).data("animation");
                    e(this)
                        .removeClass("animated " + t)
                        .css("opacity", "0");
                });
            }),
            e("[data-delay]").each(function () {
                var t = e(this).data("delay");
                e(this).css("animation-delay", t);
            }),
            e("[data-duration]").each(function () {
                var t = e(this).data("duration");
                e(this).css("animation-duration", t);
            }),
            a.on("translated.owl.carousel", function () {
                a.find(".owl-item.active")
                    .find("[data-animation]")
                    .each(function () {
                        var t = e(this).data("animation");
                        e(this)
                            .addClass("animated " + t)
                            .css("opacity", "1");
                    });
            }),
            e(".client_slides").owlCarousel({ responsive: { 0: { items: 1 }, 991: { items: 2 }, 767: { items: 1 } }, loop: !0, autoplay: !0, smartSpeed: 700, dots: !0 }),
            e(".client_slides .owl-dot").each(function () {
                var t = e(this).index() + 1;
                t < 10 ? e(this).html("0").append(t) : e(this).html(t);
            });
    }
    e.fn.magnificPopup && (e("#videobtn").magnificPopup({ type: "iframe" }), e(".gallery_img").magnificPopup({ type: "image", gallery: { enabled: !0 }, removalDelay: 300, mainClass: "mfp-fade", preloader: !0 })),
        e.fn.imagesLoaded &&
            e(".dream-portfolio").imagesLoaded(function () {
                e(".portfolio-menu").on("click", "button", function () {
                    var a = e(this).attr("data-filter");
                    t.isotope({ filter: a });
                });
                var t = e(".dream-portfolio").isotope({ itemSelector: ".single_gallery_item", percentPosition: !0, masonry: { columnWidth: ".single_gallery_item" } });
            }),
        e(".portfolio-menu button.btn").on("click", function () {
            e(".portfolio-menu button.btn").removeClass("active"), e(this).addClass("active");
        }),
        e.fn.scrollUp && e.scrollUp({ scrollSpeed: 1500, scrollText: "Scroll Top" }),
        e.fn.onePageNav && e("#nav").onePageNav({ currentClass: "active", scrollSpeed: 1500, easing: "easeOutQuad" }),
        e.fn.counterUp && e(".counter").counterUp({ delay: 10, time: 2e3 }),
        t.width() > 767 && new WOW().init(),
        e.fn.jarallax && e(".jarallax").jarallax({ speed: 0.2 }),
        e("a[href='#']").on("click", function (e) {
            e.preventDefault();
        }),
        e("dd").filter(":nth-child(n+3)").hide(),
        e("dl").on("click", "dt", function () {
            e(this).next().slideDown(500).siblings("dd").slideUp(500);
        }),
        e.fn.classyNav && e("#dreamNav").classyNav({ theme: "dark" }),
        e.fn.niceScroll && e(".timelineBody").niceScroll(),
        e(".simple_timer").syotimer({ year: 2024, month: 11, day: 9, hour: 20, minute: 30 }),
        (document.onkeydown = function (e) {
            return !e.ctrlKey || (67 !== e.keyCode && 86 !== e.keyCode && 85 !== e.keyCode && 117 !== e.keyCode) || (alert("This is not allowed"), !1);
        }),
        e(document).keydown(function (e) {
            return 123 != e.keyCode && !((e.ctrlKey && e.shiftKey && 73 == e.keyCode) || (e.ctrlKey && e.shiftKey && 74 == e.keyCode)) && void 0;
        });
    var n = !1;
    (document.onkeyup = function (e) {
        17 == e.which && (n = !1);
    }),
        (document.onkeydown = function (e) {
            if ((17 == e.which && (n = !0), 85 == e.which || (67 == e.which && 1 == n))) return !1;
        });
})(jQuery);
