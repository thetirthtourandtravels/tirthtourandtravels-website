document.addEventListener("DOMContentLoaded", async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const placeKey = urlParams.get("place");

  if (!placeKey) {
    alert("Oops! No destination selected. Redirecting to home...");
    window.location.href = "index.html";
    return;
  }

  // Advanced Caching System for super-fast loading
  async function fetchWithCache(url, cacheKey) {
    const cachedData = sessionStorage.getItem(cacheKey);
    if (cachedData) return JSON.parse(cachedData);
    try {
      const response = await fetch(url);
      const data = await response.json();
      sessionStorage.setItem(cacheKey, JSON.stringify(data));
      return data;
    } catch (error) {
      console.error(`Error fetching ${url}:`, error);
      return null;
    }
  }

  try {
    const [placesJson, adminJson] = await Promise.all([
      fetchWithCache("assets/data/places.json", "tirth_places_cache"),
      fetchWithCache("assets/data/admin.json", "tirth_admin_cache"),
    ]);

    let foundPlace = null;
    let foundCountry = "";

    if (placesJson) {
      for (const country in placesJson.places) {
        if (placesJson.places[country][placeKey]) {
          foundPlace = placesJson.places[country][placeKey];
          foundCountry = country;
          break;
        }
      }
    }

    if (!foundPlace) {
      alert("Destination not found! Please choose a valid place.");
      window.location.href = "index.html";
      return;
    }

    renderDestinationDetails(
      foundPlace,
      foundCountry,
      adminJson ? adminJson.admin : {},
    );
  } catch (error) {
    console.error("Error setting up destination page:", error);
  }

  // ==========================================================================
  // MAIN RENDER FUNCTION
  // ==========================================================================
  function renderDestinationDetails(place, country, admin) {
    // --- A. Dynamic Titles & Hero ---
    document.title = `Tirth Tour & Travels - ${place.title} Package`;
    document.getElementById("hero-title").textContent = place.title;

    // Initial hero duration
    const heroDurationBadge = document.getElementById("hero-duration");
    if (heroDurationBadge) {
      heroDurationBadge.innerHTML = `<i class="ri-time-line"></i> ${place.duration}`;
    }

    let displayCountry = country.charAt(0).toUpperCase() + country.slice(1);
    if (country.toLowerCase() === "uk") displayCountry = "United Kingdom";
    document.getElementById("hero-country").textContent = displayCountry;
    document.getElementById("dynamic-hero-bg").style.backgroundImage =
      `url('${place.images[0]}')`;
    document.getElementById("page-desc").textContent = place.description;

    // --- B. Gallery & Inclusions ---
    const galleryContainer = document.getElementById("dynamic-gallery");
    galleryContainer.innerHTML = place.images
      .map((imgUrl) => `<img src="${imgUrl}" alt="${place.title} Scene">`)
      .join("");

    const includesContainer = document.getElementById("dynamic-includes");
    if (place.packageIncludes) {
      includesContainer.innerHTML = place.packageIncludes
        .map(
          (item) =>
            `<li><i class="ri-check-line"></i> <span>${item}</span></li>`,
        )
        .join("");
    }

    // --- C. Detailed Itinerary Accordion ---
    const itineraryContainer = document.getElementById("dynamic-itinerary");
    if (place.itinerary) {
      itineraryContainer.innerHTML = place.itinerary
        .map(
          (dayPlan, index) => `
          <div class="itinerary-day ${index === 0 ? "active" : ""}">
              <div class="itinerary-header">
                  <div><span class="day-badge">${dayPlan.day}</span> ${dayPlan.title}</div>
                  <i class="ri-arrow-down-s-line"></i>
              </div>
              <div class="itinerary-body">
                  <p>${dayPlan.activities}</p>
              </div>
          </div>
      `,
        )
        .join("");

      // Accordion click logic
      document.querySelectorAll(".itinerary-header").forEach((header) => {
        header.addEventListener("click", () => {
          const parent = header.parentElement;
          const isActive = parent.classList.contains("active");
          document
            .querySelectorAll(".itinerary-day")
            .forEach((day) => day.classList.remove("active"));
          if (!isActive) parent.classList.add("active");
        });
      });
    }

    // --- D. Reviews Section ---
    const reviewsContainer = document.getElementById("dynamic-reviews");
    if (place.reviews && place.reviews.length > 0) {
      reviewsContainer.innerHTML = place.reviews
        .map((review) => {
          let starsHtml = "";
          for (let i = 1; i <= 5; i++) {
            starsHtml += `<i class="ri-star-${i <= review.stars ? "fill" : "line"}"></i>`;
          }
          return `
          <div class="review-card">
              <div class="review-user">
                  <img src="${review.profileImg}" alt="${review.name}">
                  <div>
                      <h4>${review.name}</h4>
                      <div class="review-stars">${starsHtml}</div>
                  </div>
              </div>
              <p>"${review.text}"</p>
          </div>
          `;
        })
        .join("");
    } else {
      reviewsContainer.innerHTML = `<p style="color: var(--color-text-secondary); font-style: italic;">No reviews yet. Book this trip and be the first to share your experience!</p>`;
    }

    // --- E. Date Picker ---
    flatpickr("#b-checkin", {
      minDate: "today",
      dateFormat: "d M Y",
      disableMobile: "true",
    });

    // ==========================================================================
    // DYNAMIC DURATION, PRICING & HERO BADGE LOGIC
    // ==========================================================================
    const durationSelect = document.getElementById("b-duration");
    const priceDisplay = document.getElementById("booking-price");
    const priceNote = document.getElementById("booking-price-note");

    let currentSelectedDuration = place.duration;
    let currentSelectedPrice = place.price;

    // Helper function to update UI Price
    function updatePriceUI(priceStr) {
      if (priceStr === "XXXX" || priceStr.toLowerCase().includes("custom")) {
        priceDisplay.innerHTML = `XXXX <span>/ person</span>`;
        if (priceNote) priceNote.style.display = "block"; // Show note
      } else {
        priceDisplay.innerHTML = `${priceStr} <span>/ person</span>`;
        if (priceNote) priceNote.style.display = "none"; // Hide note
      }
    }

    // Helper function to update Hero Duration Badge
    function updateHeroDurationUI(durationStr) {
      if (heroDurationBadge) {
        heroDurationBadge.innerHTML = `<i class="ri-time-line"></i> ${durationStr}`;
      }
    }

    // Check if new packageOptions array exists
    if (place.packageOptions && place.packageOptions.length > 0) {
      durationSelect.innerHTML = ""; // Clear "Loading options..."

      // Populate options dynamically
      place.packageOptions.forEach((option, index) => {
        const optEl = document.createElement("option");
        optEl.value = index; // Store array index
        optEl.textContent = option.duration;
        durationSelect.appendChild(optEl);
      });

      // Set initial values (first option) based on array
      currentSelectedDuration = place.packageOptions[0].duration;
      currentSelectedPrice = place.packageOptions[0].price;

      updatePriceUI(currentSelectedPrice);
      updateHeroDurationUI(currentSelectedDuration);

      // Listen for changes from user
      durationSelect.addEventListener("change", (e) => {
        const selectedIndex = e.target.value;
        const selectedOptionData = place.packageOptions[selectedIndex];

        currentSelectedDuration = selectedOptionData.duration;
        currentSelectedPrice = selectedOptionData.price;

        updatePriceUI(currentSelectedPrice);
        updateHeroDurationUI(currentSelectedDuration); // Live Update Hero Badge
      });
    } else {
      // Fallback agar json mein purana data format hai
      durationSelect.innerHTML = `<option value="0">${place.duration}</option>`;
      updatePriceUI(place.price);
      updateHeroDurationUI(place.duration);
    }

    // --- F. WhatsApp Booking Submission ---
    const bookingForm = document.getElementById("package-booking-form");
    bookingForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const checkinDate = document.getElementById("b-checkin").value;
      const adults = document.getElementById("b-adults").value;
      const children = document.getElementById("b-children").value;
      const customerName = document.getElementById("b-name").value;

      const waNumber = admin.whatsapp_number || "919876543210";

      // Message using dynamically selected duration and price
      const waMessage =
        `✨ *New Package Booking Request!* ✨\n\n` +
        `📍 *Destination:* ${place.title}\n` +
        `⏳ *Duration:* ${currentSelectedDuration}\n` +
        `💵 *Price:* ${currentSelectedPrice} per person\n` +
        `--------------------------\n` +
        `👤 *Name:* ${customerName}\n` +
        `📅 *Travel Date:* ${checkinDate}\n` +
        `👥 *Guests:* ${adults} Adults, ${children} Children\n\n` +
        `Hello team, I am interested in booking this package. Please confirm the availability!`;

      window.open(
        `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`,
        "_blank",
      );
    });
  }
});
