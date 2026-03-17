document.addEventListener("DOMContentLoaded", async () => {
  let pageAdminData = {};

  // 1. Fetch JSON and Populate Contact Info
  try {
    const response = await fetch("assets/data/admin.json");
    const data = await response.json();
    pageAdminData = data.admin;

    // Populate Info Cards
    const addrEl = document.getElementById("page-contact-address");
    const emailEl = document.getElementById("page-contact-email");
    const phoneEl = document.getElementById("page-contact-phone");

    if (addrEl) addrEl.textContent = pageAdminData.address;
    if (emailEl) emailEl.textContent = pageAdminData.email;
    if (phoneEl) phoneEl.textContent = pageAdminData.whatsapp_number;

    // Populate Social Icons specific to Contact Page
    const socialWrapper = document.getElementById("page-contact-socials");
    if (socialWrapper && pageAdminData.social) {
      socialWrapper.innerHTML = pageAdminData.social
        .map(
          (item) => `
                  <a href="${item.link}" target="_blank" class="contact-social-circle" aria-label="${item.platform}">
                      <i class="${item.icon}"></i>
                  </a>
              `,
        )
        .join("");
    }
  } catch (error) {
    console.error("Error fetching contact data:", error);
  }

  // 2. WhatsApp Form Submission Logic
  const contactForm = document.getElementById("whatsapp-contact-form");

  if (contactForm) {
    contactForm.addEventListener("submit", (e) => {
      e.preventDefault();

      // Get Field Values
      const cName = document.getElementById("c-name").value.trim();
      const cEmail = document.getElementById("c-email").value.trim();
      const cSubject = document.getElementById("c-subject").value.trim();
      const cMessage = document.getElementById("c-message").value.trim();

      // Admin Number Fallback
      const waNumber = pageAdminData.whatsapp_number || "919876543210";

      // Format the message nicely for WhatsApp
      const waMessage =
        `🚀 *New Website Inquiry!*\n\n` +
        `👤 *Name:* ${cName}\n` +
        `📧 *Email:* ${cEmail}\n` +
        `📌 *Subject:* ${cSubject}\n\n` +
        `💬 *Message:*\n"${cMessage}"`;

      // Create URL and open in new tab
      const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(waMessage)}`;
      window.open(waUrl, "_blank");

      // Reset form and show a small fun alert
      contactForm.reset();
      alert(
        "Message sent to WhatsApp! Our carrier pigeons are on their way. 🐦",
      );
    });
  }
});
