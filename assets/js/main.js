document.addEventListener("DOMContentLoaded", async () => {
  // ==========================================================================
  // 1. GLOBAL VARIABLES
  // ==========================================================================
  let locationsData = [];
  let adminData = {};
  let testimonialsData = [];

  // ==========================================================================
  // 2. PRELOADER OPTIMIZATION (Instant Hide)
  // ==========================================================================
  const preloader = document.getElementById("preloader");
  const hidePreloader = () => {
    if (preloader) preloader.classList.add("hidden");
  };

  if (preloader) {
    // Show preloader immediately on link click for smooth transition
    const navLinks = document.querySelectorAll(
      'a[href]:not([href^="#"]):not([target="_blank"])',
    );
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        if (
          link.href.startsWith("mailto:") ||
          link.href.startsWith("tel:") ||
          link.href.includes("#")
        )
          return;
        if (!e.defaultPrevented && link.href !== window.location.href) {
          preloader.classList.remove("hidden");
        }
      });
    });
  }

  // ==========================================================================
  // 3. ADVANCED CACHING & FETCH DATA (Makes pages load instantly)
  // ==========================================================================
  async function fetchWithCache(url, cacheKey) {
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) {
      return JSON.parse(cachedData); // Agar data pehle se hai toh instantly return karo
    }
    try {
      const response = await fetch(url);
      const data = await response.json();
      sessionStorage.setItem(cacheKey, JSON.stringify(data)); // Data save kar lo
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }

  try {
    const [placesJson, testimonialsJson, adminJson] = await Promise.all([
      fetchWithCache("assets/data/places.json", "tirth_places_cache"),
      fetchWithCache("assets/data/testimonials.json", "tirth_testi_cache"),
      fetchWithCache("assets/data/admin.json", "tirth_admin_cache"),
    ]);

    if (adminJson) adminData = adminJson.admin;
    if (testimonialsJson)
      testimonialsData = testimonialsJson.testimonials || [];
    const allPlaces = placesJson ? placesJson.places : {};

    const popularGrid = document.getElementById("dynamic-popular-grid");
    const placesGrid = document.getElementById("dynamic-places-grid");
    const filterButtonsContainer = document.getElementById(
      "dynamic-filter-buttons",
    );

    // Format and Inject Places Data
    for (const countryKey in allPlaces) {
      let displayCountryName =
        countryKey.charAt(0).toUpperCase() + countryKey.slice(1);
      if (countryKey.toLowerCase() === "uk")
        displayCountryName = "United Kingdom";

      if (filterButtonsContainer) {
        const btn = document.createElement("button");
        btn.className = "filter-btn";
        btn.dataset.filter = countryKey;
        btn.textContent = displayCountryName;
        filterButtonsContainer.appendChild(btn);
      }

      const countryPlaces = allPlaces[countryKey];
      for (const placeKey in countryPlaces) {
        const place = countryPlaces[placeKey];

        locationsData.push({
          id: placeKey,
          title: place.title,
          image: place.images[0],
        });

        if (place.popular === true && popularGrid) {
          const pCard = document.createElement("a");
          pCard.href = `destination.html?place=${placeKey}`;
          pCard.className = "popular-card";
          pCard.style.backgroundImage = `url('${place.images[0]}')`;
          pCard.innerHTML = `
            <div class="popular-card-arrow"><i class="ri-arrow-right-up-line"></i></div>
            <div class="popular-card-content">
                <h3>${place.title}</h3>
                <p>${place.description || "Discover this beautiful place."}</p>
            </div>
          `;
          popularGrid.appendChild(pCard);
        }

        if (placesGrid) {
          const placeCard = document.createElement("a");
          placeCard.href = `destination.html?place=${placeKey}`;
          placeCard.className = "place-card animate-in";
          placeCard.dataset.category = countryKey;
          placeCard.style.backgroundImage = `url('${place.images[0]}')`;
          placeCard.innerHTML = `
            <div class="place-card-arrow"><i class="ri-arrow-right-up-line"></i></div>
            <div class="place-card-content">
                <span>${displayCountryName}</span>
                <h3>${place.title}</h3>
            </div>
          `;
          placesGrid.appendChild(placeCard);
        }
      }
    }

    // Initialize all components
    initDynamicFooter();
    initHeroBookingForm();
    initPlacesFilterAndSearch();
    initTestimonialSection();

    // Data load hote hi Preloader instantly hata do (no waiting for videos)
    setTimeout(hidePreloader, 150);
  } catch (error) {
    console.error("Critical Error fetching JSON data:", error);
    setTimeout(hidePreloader, 150); // Error case mein bhi preloader hata do
  }

  // ==========================================================================
  // 4. COMPONENT FUNCTIONS
  // ==========================================================================

  function initDynamicFooter() {
    const footerDestList = document.getElementById("footer-destinations");
    if (footerDestList && locationsData.length > 0) {
      footerDestList.innerHTML = locationsData
        .slice(0, 5)
        .map(
          (place) =>
            `<li><a href="destination.html?place=${place.id}">${place.title}</a></li>`,
        )
        .join("");
    }

    if (adminData && Object.keys(adminData).length > 0) {
      const fAddress = document.querySelector("#footer-address span");
      const fEmail = document.querySelector("#footer-email span");
      const fWhatsapp = document.querySelector("#footer-whatsapp span");
      const fCopyright = document.getElementById("footer-copyright");
      const socialContainer = document.getElementById("footer-social-links");

      if (fAddress) fAddress.textContent = adminData.address;
      if (fEmail) fEmail.textContent = adminData.email;
      if (fWhatsapp) fWhatsapp.textContent = adminData.whatsapp_number;

      if (fCopyright && adminData.name) {
        fCopyright.innerHTML = `&copy; ${new Date().getFullYear()} ${adminData.name}. All rights reserved.`;
      }

      if (socialContainer && adminData.social) {
        socialContainer.innerHTML = adminData.social
          .map(
            (item) => `
                <li>
                    <a href="${item.link}" target="_blank" class="social-link-item">
                        <i class="${item.icon}"></i>
                        <span>${item.platform}</span>
                    </a>
                </li>
            `,
          )
          .join("");
      }
    }
  }

  function initHeroBookingForm() {
    const locationInput = document.getElementById("location");
    const locationDropdown = document.getElementById("location-dropdown");
    const checkInInput = document.getElementById("check-in");
    const checkOutInput = document.getElementById("check-out");
    const bookingForm = document.querySelector(".booking-form");

    function renderDropdown(items) {
      if (!locationDropdown) return;
      locationDropdown.innerHTML = "";
      if (items.length === 0) {
        locationDropdown.innerHTML = `<div class="dropdown-item-empty"><span>No places found</span></div>`;
        return;
      }
      items.forEach((item) => {
        const div = document.createElement("div");
        div.classList.add("dropdown-item");
        div.innerHTML = `<img src="${item.image}" alt="${item.title}"><span>${item.title}</span>`;
        div.addEventListener("click", () => {
          locationInput.value = item.title;
          locationDropdown.classList.remove("active");
        });
        locationDropdown.appendChild(div);
      });
    }

    if (locationInput && locationDropdown) {
      locationInput.addEventListener("focus", () => {
        const term = locationInput.value.toLowerCase().trim();
        const filtered = locationsData.filter((loc) =>
          loc.title.toLowerCase().includes(term),
        );
        renderDropdown(filtered);
        locationDropdown.classList.add("active");
      });
      locationInput.addEventListener("input", (e) => {
        const term = e.target.value.toLowerCase().trim();
        const filtered = locationsData.filter((loc) =>
          loc.title.toLowerCase().includes(term),
        );
        renderDropdown(filtered);
        locationDropdown.classList.add("active");
      });
      document.addEventListener("click", (e) => {
        if (
          !locationInput.contains(e.target) &&
          !locationDropdown.contains(e.target)
        ) {
          locationDropdown.classList.remove("active");
        }
      });
    }

    if (checkInInput && checkOutInput) {
      const checkOutPicker = flatpickr(checkOutInput, {
        dateFormat: "d M Y",
        minDate: "today",
        disableMobile: "true",
      });

      flatpickr(checkInInput, {
        dateFormat: "d M Y",
        defaultDate: "today",
        minDate: "today",
        disableMobile: "true",
        onChange: function (selectedDates, dateStr, instance) {
          checkOutPicker.set("minDate", dateStr);
        },
      });
    }

    if (bookingForm) {
      bookingForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const locValue = locationInput.value || "Not specified";
        const checkInValue = checkInInput.value || "Not specified";
        const checkOutValue = checkOutInput.value || "Not specified";
        const travelerValue =
          document.getElementById("traveler").value || "Not specified";
        const waNumber = adminData.whatsapp_number || "919876543210";
        const textMessage = `Hello ${adminData.name || "Team"},\n\nI want to get a quote for a trip!\n\n📍 *Destination:* ${locValue}\n📅 *Travel Date:* ${checkInValue}\n📅 *Return Date:* ${checkOutValue}\n👥 *Guests:* ${travelerValue}`;
        window.open(
          `https://wa.me/${waNumber}?text=${encodeURIComponent(textMessage)}`,
          "_blank",
        );
      });
    }
  }

  function initPlacesFilterAndSearch() {
    const filterContainer = document.getElementById("dynamic-filter-buttons");
    const searchInput = document.getElementById("places-search-input");
    const noResultsMsg = document.getElementById("no-results-message");

    function applyFilter() {
      const dynamicPlaceCards = document.querySelectorAll(
        "#dynamic-places-grid .place-card",
      );
      if (dynamicPlaceCards.length === 0) return;
      const activeBtn = filterContainer.querySelector(".filter-btn.active");
      const filterVal = activeBtn ? activeBtn.dataset.filter : "all";
      const searchVal = searchInput
        ? searchInput.value.toLowerCase().trim()
        : "";
      let visibleCount = 0;

      dynamicPlaceCards.forEach((card) => {
        const cat = card.dataset.category || "";
        const text = card.textContent.toLowerCase();
        const matchFilter = filterVal === "all" || filterVal === cat;
        const matchSearch = searchVal === "" || text.includes(searchVal);
        if (matchFilter && matchSearch) {
          card.classList.remove("place-card-hidden");
          visibleCount++;
        } else {
          card.classList.add("place-card-hidden");
        }
      });
      if (noResultsMsg)
        noResultsMsg.style.display = visibleCount === 0 ? "block" : "none";
    }

    if (filterContainer) {
      filterContainer.addEventListener("click", (e) => {
        if (e.target.classList.contains("filter-btn")) {
          filterContainer
            .querySelectorAll(".filter-btn")
            .forEach((b) => b.classList.remove("active"));
          e.target.classList.add("active");
          applyFilter();
        }
      });
    }
    if (searchInput) searchInput.addEventListener("input", applyFilter);

    const popShowMoreBtn = document.getElementById("show-more-btn");
    const popularGrid = document.getElementById("dynamic-popular-grid");
    if (popShowMoreBtn && popularGrid) {
      popShowMoreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        popularGrid.classList.toggle("collapsed");
        popShowMoreBtn.textContent = popularGrid.classList.contains("collapsed")
          ? "Explore More Places"
          : "Show Less";
      });
    }

    const placesViewMoreBtn = document.getElementById("places-view-more-btn");
    const placesGrid = document.getElementById("dynamic-places-grid");
    if (
      placesViewMoreBtn &&
      placesGrid &&
      !placesViewMoreBtn.href.includes("all-destinations.html")
    ) {
      placesViewMoreBtn.addEventListener("click", (e) => {
        e.preventDefault();
        placesGrid.classList.remove("collapsed");
        if (placesViewMoreBtn.parentElement)
          placesViewMoreBtn.parentElement.classList.add("hidden");
      });
    }
  }

  function initTestimonialSection() {
    const testWrapper = document.getElementById("testimonial-dynamic-wrapper");
    if (!testWrapper || testimonialsData.length === 0) return;

    const tPlaceImg = document.getElementById("dyn-test-place-img");
    const tProfileImg = document.getElementById("dyn-test-profile-img");
    const tReviewText = document.getElementById("dyn-test-review-text");
    const tClientName = document.getElementById("dyn-test-client-name");
    const tClientLoc = document.getElementById("dyn-test-client-loc");
    const tStarsContainer = document.getElementById("dyn-test-stars");

    let currentTestIndex = 0;

    function updateTestimonialUI(data) {
      if (tPlaceImg) tPlaceImg.src = data.placeImg;
      if (tProfileImg) tProfileImg.src = data.profileImg;
      if (tReviewText) tReviewText.textContent = `"${data.review}"`;
      if (tClientName) tClientName.textContent = data.clientName;
      if (tClientLoc) tClientLoc.textContent = data.location;
      if (tStarsContainer) {
        tStarsContainer.innerHTML = "";
        for (let i = 1; i <= 5; i++) {
          tStarsContainer.innerHTML += `<i class="ri-star-${i <= data.stars ? "fill" : "line"}"></i>`;
        }
      }
    }

    updateTestimonialUI(testimonialsData[0]);

    setInterval(() => {
      testWrapper.classList.add("testimonial-fade-out");
      setTimeout(() => {
        currentTestIndex = (currentTestIndex + 1) % testimonialsData.length;
        updateTestimonialUI(testimonialsData[currentTestIndex]);
        testWrapper.classList.remove("testimonial-fade-out");
        testWrapper.classList.add("testimonial-fade-in");
        setTimeout(
          () => testWrapper.classList.remove("testimonial-fade-in"),
          500,
        );
      }, 500);
    }, 5000);

    const openModalBtn = document.getElementById("open-review-modal-btn");
    const closeModalBtn = document.getElementById("close-review-modal");
    const reviewModal = document.getElementById("review-modal");
    const reviewForm = document.getElementById("write-review-form");
    const starIcons = document.querySelectorAll("#star-rating-input i");
    const starInputHidden = document.getElementById("review-stars-val");

    if (openModalBtn && reviewModal) {
      openModalBtn.addEventListener("click", (e) => {
        e.preventDefault();
        reviewModal.classList.add("active");
      });
    }

    if (closeModalBtn && reviewModal) {
      closeModalBtn.addEventListener("click", () =>
        reviewModal.classList.remove("active"),
      );
      reviewModal.addEventListener("click", (e) => {
        if (e.target === reviewModal) reviewModal.classList.remove("active");
      });
    }

    if (starIcons.length > 0) {
      starIcons.forEach((star) => {
        star.addEventListener("click", (e) => {
          const ratingValue = parseInt(e.target.getAttribute("data-value"));
          starInputHidden.value = ratingValue;
          starIcons.forEach(
            (s) =>
              (s.className =
                parseInt(s.getAttribute("data-value")) <= ratingValue
                  ? "ri-star-fill"
                  : "ri-star-line"),
          );
        });
      });
    }

    if (reviewForm) {
      reviewForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const rName = document.getElementById("review-name").value;
        const rLoc = document.getElementById("review-location").value;
        const rStars = starInputHidden.value;
        const rText = document.getElementById("review-text-input").value;
        const waNumber = adminData.whatsapp_number || "919876543210";
        const waMessage = `Hello Team,\n\nI want to share my travel experience!\n\n👤 *Name:* ${rName}\n📍 *Destination:* ${rLoc}\n⭐ *Rating:* ${rStars}/5 Stars\n📝 *Review:* "${rText}"`;
        window.open(
          `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`,
          "_blank",
        );

        reviewForm.reset();
        if (starInputHidden) starInputHidden.value = 5;
        starIcons.forEach((s) => (s.className = "ri-star-fill"));
        reviewModal.classList.remove("active");
      });
    }
  }

  // ==========================================================================
  // 5. GENERAL UI LOGIC (Navbar Scroll, Mobile Menu)
  // ==========================================================================

  const hamburger = document.querySelector(".hamburger");
  const navMenu = document.querySelector(".nav-menu-mobile");
  const closeMenuIcon = document.querySelector(".close-menu-icon");
  const mobileNavLinks = document.querySelectorAll(
    ".nav-menu-mobile .nav-link",
  );

  if (hamburger && navMenu && closeMenuIcon) {
    hamburger.addEventListener("click", () => navMenu.classList.add("active"));
    closeMenuIcon.addEventListener("click", () =>
      navMenu.classList.remove("active"),
    );
  }

  if (mobileNavLinks.length > 0) {
    mobileNavLinks.forEach((link) => {
      link.addEventListener("click", () => {
        if (navMenu) navMenu.classList.remove("active");
      });
    });
  }

  const navbar = document.querySelector(".navbar");
  const heroSection = document.querySelector(".hero-section, .faq-page-hero");

  if (heroSection && navbar) {
    const handleScroll = () => {
      if (window.scrollY > 50) navbar.classList.add("navbar-scrolled");
      else navbar.classList.remove("navbar-scrolled");
    };
    window.addEventListener("scroll", handleScroll);
    handleScroll();
  }

  const faqItems = document.querySelectorAll(".faq-item");
  if (faqItems.length > 0) {
    faqItems.forEach((item) => {
      const question = item.querySelector(".faq-question");
      if (question) {
        question.addEventListener("click", () => {
          const isActive = item.classList.contains("active");
          faqItems.forEach((otherItem) => otherItem.classList.remove("active"));
          if (!isActive) item.classList.add("active");
        });
      }
    });
  }
});
