document.addEventListener("DOMContentLoaded", function () {
  initLeadForm();
});

function initLeadForm() {
  const form = document.getElementById("nursing-lead-form");
  if (!form) return;

  const messageEl = document.getElementById("cf-form-message");
  const submitBtn = form.querySelector(".cf-btn");
  const defaultBtnText = submitBtn ? submitBtn.textContent : "Request Free Counseling";

  form.addEventListener("submit", function (event) {
    event.preventDefault();
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const payload = {
      name: String(formData.get("name") || "").trim(),
      phone: String(formData.get("phone") || "").trim(),
      course: "B.Sc Nursing",
      source: "nursing_landing",
    };

    const email = String(formData.get("email") || "").trim();
    const city = String(formData.get("city") || "").trim();
    if (email) payload.email = email;
    if (city) payload.city = city;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = "Submitting...";
    }
    setFormMessage(messageEl, "", "");

    try {
      fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then(async (response) => {
          if (!response.ok) {
            let detail = "Something went wrong. Please call +91-7055547000.";
            try {
              const data = await response.json();
              if (data && data.detail) {
                detail = typeof data.detail === "string" ? data.detail : detail;
              }
            } catch (_) { }
            throw new Error(detail);
          }
        })
        .catch((err) => {
          console.error("Background API Error:", err);
        });

      setTimeout(() => {
        form.reset();
        window.location.href = "./thankyou.html";
      }, 100);
    } catch (error) {
      setFormMessage(messageEl, "error", error.message || "Unable to submit. Please try again.");
    } finally {
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = defaultBtnText;
      }
    }
  });
}

function setFormMessage(element, type, text) {
  if (!element) return;
  element.hidden = !text;
  element.textContent = text;
  element.classList.remove("cf-form-message--success", "cf-form-message--error");
  if (type === "success") element.classList.add("cf-form-message--success");
  if (type === "error") element.classList.add("cf-form-message--error");
}
