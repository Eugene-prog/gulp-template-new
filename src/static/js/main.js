(function () {
  const swiper = new Swiper(".main-slider", {
    slidesPerView: 1,
    loop: true,

    pagination: {
      el: ".swiper-pagination",
      type: "bullets",
      clickable: true,
    },

    // Navigation arrows
    navigation: {
      nextEl: ".swiper-button-next",
      prevEl: ".swiper-button-prev",
    },

    // And if we need scrollbar
    // scrollbar: {
    //   el: ".swiper-scrollbar",
    // },
  });
  console.log(swiper, "test");
})();
