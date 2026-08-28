"use strict";

/*
  শাহমাহমুদপুর বাজার
  Step 1 — Frontend interactions

  পরবর্তী ধাপে এই UI-কে Supabase backend-এর সাথে
  connect করা হবে।
*/


document.addEventListener("DOMContentLoaded", () => {

  /* =========================
     ELEMENTS
  ========================= */

  const searchInput =
    document.getElementById("searchInput");

  const searchButton =
    document.getElementById("searchButton");

  const postAdButton =
    document.getElementById("postAdButton");

  const heroPostButton =
    document.getElementById("heroPostButton");

  const exploreButton =
    document.getElementById("exploreButton");

  const loginButton =
    document.getElementById("loginButton");

  const favoriteButton =
    document.getElementById("favoriteButton");

  const promotionButton =
    document.getElementById("promotionButton");

  const allAdsButton =
    document.getElementById("allAdsButton");

  const hijamaButton =
    document.getElementById("hijamaButton");

  const toast =
    document.getElementById("toast");


  /* =========================
     TOAST
  ========================= */

  let toastTimer = null;

  function showToast(message) {

    if (!toast) return;

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => {

      toast.classList.remove("show");

    }, 2600);
  }


  /* =========================
     SEARCH
  ========================= */

  function performSearch() {

    if (!searchInput) return;

    const query =
      searchInput.value.trim();

    if (!query) {

      showToast(
        "আপনি কী খুঁজছেন সেটি লিখুন।"
      );

      searchInput.focus();

      return;
    }

    showToast(
      `"${query}" এর বিজ্ঞাপন খোঁজা হবে।`
    );

    /*
      ভবিষ্যতে এখানে হবে:

      window.location.href =
        `search.html?q=${encodeURIComponent(query)}`;
    */
  }


  if (searchButton) {

    searchButton.addEventListener(
      "click",
      performSearch
    );

  }


  if (searchInput) {

    searchInput.addEventListener(
      "keydown",
      (event) => {

        if (event.key === "Enter") {

          event.preventDefault();

          performSearch();

        }

      }
    );

  }


  /* =========================
     POST AD
  ========================= */

  function openPostAd() {

    showToast(
      "বিজ্ঞাপন দিতে Login / Registration প্রয়োজন।"
    );

    /*
      ভবিষ্যতে:

      window.location.href = "post-ad.html";
    */
  }


  if (postAdButton) {

    postAdButton.addEventListener(
      "click",
      openPostAd
    );

  }


  if (heroPostButton) {

    heroPostButton.addEventListener(
      "click",
      openPostAd
    );

  }


  /* =========================
     LOGIN
  ========================= */

  if (loginButton) {

    loginButton.addEventListener(
      "click",
      () => {

        showToast(
          "Login / Registration page খুলবে।"
        );

        /*
          ভবিষ্যতে:

          window.location.href = "login.html";
        */

      }
    );

  }


  /* =========================
     EXPLORE ADS
  ========================= */

  if (exploreButton) {

    exploreButton.addEventListener(
      "click",
      () => {

        showToast(
          "Marketplace listing page খুলবে।"
        );

      }
    );

  }


  if (allAdsButton) {

    allAdsButton.addEventListener(
      "click",
      () => {

        showToast(
          "সব বিজ্ঞাপন দেখানো হবে।"
        );

      }
    );

  }


  /* =========================
     CATEGORY
  ========================= */

  const categoryButtons =
    document.querySelectorAll(
      ".category-card"
    );


  categoryButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        () => {

          const category =
            button.dataset.category;

          if (!category) return;

          showToast(
            `${category} category খুলবে।`
          );

          /*
            ভবিষ্যতে:

            window.location.href =
              `search.html?category=${encodeURIComponent(category)}`;
          */

        }
      );

    }
  );


  /* =========================
     FAVORITES
  ========================= */

  const favoriteButtons =
    document.querySelectorAll(
      ".favorite"
    );


  favoriteButtons.forEach(
    (button) => {

      button.addEventListener(
        "click",
        (event) => {

          event.stopPropagation();

          button.classList.toggle(
            "active"
          );

          const isActive =
            button.classList.contains(
              "active"
            );

          button.textContent =
            isActive ? "♥" : "♡";

          showToast(
            isActive
              ? "পছন্দের তালিকায় যোগ হয়েছে।"
              : "পছন্দের তালিকা থেকে সরানো হয়েছে।"
          );

        }
      );

    }
  );


  /* =========================
     HEADER FAVORITE
  ========================= */

  if (favoriteButton) {

    favoriteButton.addEventListener(
      "click",
      () => {

        showToast(
          "আপনার Favourite Ads এখানে থাকবে।"
        );

      }
    );

  }


  /* =========================
     PROMOTION
  ========================= */

  if (promotionButton) {

    promotionButton.addEventListener(
      "click",
      () => {

        showToast(
          "Featured, Top এবং Boost packages এখানে থাকবে।"
        );

      }
    );

  }


  /* =========================
     HIJAMA
  ========================= */

  if (hijamaButton) {

    hijamaButton.addEventListener(
      "click",
      () => {

        showToast(
          "Hijama appointment booking খুলবে।"
        );

        /*
          ভবিষ্যতে:

          window.location.href =
            "hijama.html";
        */

      }
    );

  }


  /* =========================
     LISTING CARD
  ========================= */

  const listingCards =
    document.querySelectorAll(
      ".listing-card"
    );


  listingCards.forEach(
    (card) => {

      card.addEventListener(
        "click",
        (event) => {

          if (
            event.target.closest(
              ".favorite"
            )
          ) {
            return;
          }

          const title =
            card.querySelector("h3");

          if (!title) return;

          showToast(
            `"${title.textContent.trim()}" এর details খুলবে।`
          );

        }
      );

    }
  );


  /* =========================
     ESCAPE KEY
  ========================= */

  document.addEventListener(
    "keydown",
    (event) => {

      if (event.key === "Escape") {

        if (
          document.activeElement ===
          searchInput
        ) {

          searchInput.blur();

        }

      }

    }
  );

});
