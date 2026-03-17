document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("faq-search-input");
  const tabButtons = document.querySelectorAll(".faq-tab-btn");
  const categoryBlocks = document.querySelectorAll(".faq-category-block");
  const allFaqItems = document.querySelectorAll(".full-faq-section .faq-item");
  const noResultsMsg = document.getElementById("faq-no-results");

  // --- 1. Category Tab Filtering ---
  tabButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      // Remove active class from all tabs
      tabButtons.forEach((b) => b.classList.remove("active"));
      // Add active class to clicked tab
      btn.classList.add("active");

      const targetCategory = btn.getAttribute("data-target");

      // Reset search when changing tabs
      searchInput.value = "";
      noResultsMsg.style.display = "none";

      categoryBlocks.forEach((block) => {
        // Show all questions inside the block first
        const items = block.querySelectorAll(".faq-item");
        items.forEach((item) => (item.style.display = "block"));

        // Filter logic
        if (
          targetCategory === "all" ||
          block.getAttribute("data-category") === targetCategory
        ) {
          block.style.display = "block";
        } else {
          block.style.display = "none";
        }
      });
    });
  });

  // --- 2. Live Search Filtering ---
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      const searchTerm = e.target.value.toLowerCase().trim();
      let visibleItemsCount = 0;

      // When searching, switch tab to "All" visually
      tabButtons.forEach((b) => b.classList.remove("active"));
      document
        .querySelector('.faq-tab-btn[data-target="all"]')
        .classList.add("active");

      categoryBlocks.forEach((block) => {
        let hasVisibleItemInBlock = false;
        const items = block.querySelectorAll(".faq-item");

        items.forEach((item) => {
          const questionText = item
            .querySelector(".faq-question span")
            .textContent.toLowerCase();
          const answerText = item
            .querySelector(".faq-answer-content p")
            .textContent.toLowerCase();

          // Check if search term matches question or answer
          if (
            questionText.includes(searchTerm) ||
            answerText.includes(searchTerm)
          ) {
            item.style.display = "block";
            hasVisibleItemInBlock = true;
            visibleItemsCount++;
          } else {
            item.style.display = "none";
          }
        });

        // Hide the whole category block if no items match inside it
        if (hasVisibleItemInBlock) {
          block.style.display = "block";
        } else {
          block.style.display = "none";
        }
      });

      // Show 'No Results' message if count is 0
      if (visibleItemsCount === 0 && searchTerm !== "") {
        noResultsMsg.style.display = "block";
      } else {
        noResultsMsg.style.display = "none";
      }
    });
  }
});
