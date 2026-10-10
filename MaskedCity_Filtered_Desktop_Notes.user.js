// ==UserScript==
// @name         Masked City Notification Filtering
// @namespace    https://maskedcity.com/
// @version      0.2.0
// @description  Adds local category filtering for MaskedCity event notifications while a game tab is open.
// @author       lvl11evelyn
// @match        https://maskedcity.com/*
// @match        https://www.maskedcity.com/*
// @homepageURL  https://github.com/lvl11evelyn/mc-note-filters/blob/main/README.md
// @supportURL   https://github.com/lvl11evelyn/mc-note-filters/issues
// @updateURL    https://github.com/lvl11evelyn/mc-note-filters/raw/refs/heads/main/MaskedCity_Filtered_Desktop_Notes.user.js
// @downloadURL  https://github.com/lvl11evelyn/mc-note-filters/raw/refs/heads/main/MaskedCity_Filtered_Desktop_Notes.user.js
// @run-at       document-idle
// @grant        GM_notification
// ==/UserScript==

(() => {
  "use strict";

  const SETTINGS_PATH = "/settings";

  const storageKeys = {
    enabled: "mcFilteredNotes.enabled",
    allowed: "mcFilteredNotes.allowedCategories"
  };

  const categories = [
    ["combat", "Combat"],
    ["watchtower", "Watchtower"],
    ["wire", "The Wire"],
    ["mirage", "The Mirage"],
    ["mcc", "MCC"],
    ["street", "Street"],
    ["pets", "Pets"],
    ["transfers", "Transfers"],
    ["achievements", "Achievements"],
    ["levelup", "Level Up"],
    ["donator", "Donator"],
    ["social", "Social"],
    ["other", "Other"]
  ];

  const defaultAllowed = [
    "combat",
    "watchtower",
    "transfers",
    "achievements",
    "levelup",
    "social"
  ];

  function getEnabled() {
    return localStorage.getItem(storageKeys.enabled) === "1";
  }

  function setEnabled(value) {
    localStorage.setItem(storageKeys.enabled, value ? "1" : "0");
  }

  function getAllowed() {
    try {
      const saved = JSON.parse(localStorage.getItem(storageKeys.allowed) || "null");
      if (Array.isArray(saved)) return new Set(saved);
    } catch {}

    return new Set(defaultAllowed);
  }

  function saveAllowed(allowed) {
    localStorage.setItem(storageKeys.allowed, JSON.stringify([...allowed]));
  }

  async function showLocalNotification(event) {
    if (typeof GM_notification === "function") {
      GM_notification({
        title: `MaskedCity: ${event.categoryTitle}`,
        text: event.message,
        tag: event.id,
        timeout: 8000,
        onclick: () => {
          window.focus();
          location.href = event.url;
        }
      });
      return;
    }

    if (Notification.permission === "default") {
      await Notification.requestPermission();
    }

    if (Notification.permission !== "granted") return;

    const notification = new Notification(`MaskedCity: ${event.categoryTitle}`, {
      body: event.message,
      tag: event.id,
      data: { url: event.url }
    });

    notification.onclick = () => {
      window.focus();
      location.href = event.url;
      notification.close();
    };
  }

  function injectStyles() {
    if (document.getElementById("mc-filtered-notes-style")) return;

    const style = document.createElement("style");
    style.id = "mc-filtered-notes-style";
    style.textContent = `
      .mc-filtered-notes-controls {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: var(--s3, 12px);
        flex-wrap: wrap;
        position: relative;
      }

      .mc-filtered-notes-wrap {
        position: relative;
      }

      .mc-filtered-notes-panel-open {
        position: relative;
        z-index: 2000;
      }

      .mc-filtered-notes-popover {
        display: none;
        position: fixed;
        z-index: 2147483647;
        top: -9999px;
        left: -9999px;
        min-width: 260px;
        max-width: min(360px, calc(100vw - 32px));
        padding: 12px;
        border: 1px solid var(--border, rgba(255, 255, 255, .16));
        border-radius: 8px;
        background: var(--panel, var(--bg-panel, #111));
        color: var(--text-primary, inherit);
        box-shadow: 0 12px 30px rgba(0, 0, 0, .25);
        transition: all 0s;
      }

      .mc-filtered-notes-popover.is-open {
        display: block;
      }

      .mc-filtered-notes-head {
        display: block;
        margin-bottom: 10px;
      }

      .mc-filtered-notes-title {
        display: flex;
        align-items: center;
        gap: 9px;
        font-family: var(--font-display, inherit);
        font-size: 14px;
        font-weight: 700;
        line-height: 1.25;
      }

      .mc-filtered-notes-grid {
        display: grid;
        gap: 7px;
        margin: 10px 0;
        padding-left: 24px;
      }

      .mc-filtered-notes-category {
        display: grid;
        grid-template-columns: max-content 1fr;
        align-items: center;
        gap: 9px;
      }

      .mc-filtered-notes-category .mc-filtered-notes-choice {
        border-left: 2px solid #33333399;
        padding-left: 9px;
      }

      .mc-filtered-notes-test {
        min-width: 42px;
        padding: 2px 6px;
        border: 1px solid currentColor;
        background: transparent;
        color: var(--text-dim, #666);
        cursor: pointer;
        font: inherit;
        font-size: 11px;
        line-height: 1.2;
        text-transform: uppercase;
        transition: all 0s;
      }

      .mc-filtered-notes-test:hover,
      .mc-filtered-notes-test:focus-visible {
        color: var(--text-primary, currentColor);
      }

      .mc-filtered-notes-choice {
        display: flex;
        align-items: center;
        gap: 9px;
        line-height: 1.25;
      }

      .mc-filtered-notes-choice input {
        flex: 0 0 auto;
      }

      .mc-filtered-notes-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 10px;
      }

      .mc-filtered-notes-desc {
        display: block;
        margin-top: 6px;
      }
    `;
    document.head.appendChild(style);
  }

  function injectSettingsPanel() {
    const url = new URL(location.href);
    if (url.pathname !== SETTINGS_PATH || url.searchParams.get("section") !== "preferences") {
      return;
    }

    const nativeButton = document.getElementById("pushToggleBtn");
    if (!nativeButton || document.getElementById("mcFilteredNotesBtn")) return;
    const nativePanel = nativeButton.closest(".panel");

    injectStyles();

    const controls = document.createElement("div");
    controls.className = "mc-filtered-notes-controls";
    controls.style.cssText = "display:flex;align-items:center;justify-content:flex-start;gap:var(--s3, 12px);flex-wrap:wrap;";

    const wrapper = document.createElement("span");
    wrapper.className = "mc-filtered-notes-wrap";

    const button = document.createElement("button");
    button.type = "button";
    button.id = "mcFilteredNotesBtn";
    button.className = "train-btn train-btn-blue train-btn-md";
    button.textContent = "Filter Notifications ⋮≡";

    const popover = document.createElement("div");
    popover.id = "mcFilteredNotesPopover";
    popover.className = "mc-filtered-notes-popover";
    popover.setAttribute("role", "dialog");
    popover.setAttribute("aria-labelledby", "mcFilteredNotesTitle");

    const allowed = getAllowed();
    const enabled = getEnabled();

    popover.innerHTML = `
      <div class="mc-filtered-notes-head">
        <label id="mcFilteredNotesTitle" class="mc-filtered-notes-title">
          <input type="checkbox" data-mc-master ${enabled ? "checked" : ""}>
          <span>Enabled</span>
        </label>
      </div>

      <div class="mc-filtered-notes-grid">
        ${categories.map(([slug, label]) => `
          <div class="mc-filtered-notes-category">
            <button type="button" class="mc-filtered-notes-test" data-mc-test="${slug}" data-mc-test-label="${label}" aria-label="Test ${label} notification">Test</button>
            <label class="mc-filtered-notes-choice">
              <input type="checkbox" value="${slug}" data-mc-category ${allowed.has(slug) ? "checked" : ""}>
              <span>${label}</span>
            </label>
          </div>
        `).join("")}
      </div>

      <div class="mc-filtered-notes-actions">
        <button type="button" class="train-btn train-btn-blue train-btn-sm" data-mc-save>Save</button>
        <button type="button" class="train-btn train-btn-sm" data-mc-all>All</button>
        <button type="button" class="train-btn train-btn-sm" data-mc-none>None</button>
      </div>
    `;

    const pushDesc = document.getElementById("pushDesc");
    if (pushDesc && !document.getElementById("mcFilteredNotesDesc")) {
      const desc = document.createElement("span");
      desc.id = "mcFilteredNotesDesc";
      desc.className = "mc-filtered-notes-desc";
      desc.textContent = "To filter notifications, disable this domain in the browser's settings, then enable Filter Notifications here. This setting only affects the browser profile currently logged in. Filter Notifications observes in-page notification banners only; it does not fetch the event archive.";
      pushDesc.append(desc);
    }

    nativeButton.insertAdjacentElement("beforebegin", controls);
    controls.append(nativeButton, wrapper);
    wrapper.append(button);
    document.body.append(popover);

    const closePopover = () => {
      popover.classList.remove("is-open");
      popover.style.top = "-9999px";
      popover.style.left = "-9999px";
      nativePanel?.classList.remove("mc-filtered-notes-panel-open");
    };

    const positionPopover = () => {
      const rect = button.getBoundingClientRect();
      const gap = 8;
      const viewportPadding = 16;
      popover.style.maxWidth = `min(360px, ${Math.max(260, window.innerWidth - viewportPadding * 2)}px)`;
      popover.style.display = "block";
      const popoverRect = popover.getBoundingClientRect();
      popover.style.display = "";

      const preferredLeft = rect.right + gap;
      const preferredTop = rect.top + (rect.height / 2) - (popoverRect.height / 2);
      const left = Math.min(
        Math.max(viewportPadding, preferredLeft),
        Math.max(viewportPadding, window.innerWidth - popoverRect.width - viewportPadding)
      );
      const top = Math.min(
        Math.max(viewportPadding, preferredTop),
        Math.max(viewportPadding, window.innerHeight - popoverRect.height - viewportPadding)
      );

      popover.style.left = `${left}px`;
      popover.style.top = `${top}px`;
    };

    button.addEventListener("click", () => {
      if (popover.classList.contains("is-open")) {
        closePopover();
        return;
      }

      positionPopover();
      popover.classList.add("is-open");
      nativePanel?.classList.add("mc-filtered-notes-panel-open");
    });

    document.addEventListener("click", (event) => {
      if (!wrapper.contains(event.target) && !popover.contains(event.target)) {
        closePopover();
      }
    });

    window.addEventListener("resize", () => {
      if (popover.classList.contains("is-open")) positionPopover();
    });

    window.addEventListener("scroll", () => {
      if (popover.classList.contains("is-open")) positionPopover();
    }, true);

    popover.querySelector("[data-mc-all]").addEventListener("click", () => {
      popover.querySelectorAll("[data-mc-category]").forEach((input) => {
        input.checked = true;
      });
    });

    popover.querySelector("[data-mc-none]").addEventListener("click", () => {
      popover.querySelectorAll("[data-mc-category]").forEach((input) => {
        input.checked = false;
      });
    });

    popover.querySelectorAll("[data-mc-test]").forEach((testButton) => {
      testButton.addEventListener("click", () => {
        const category = testButton.dataset.mcTest || "other";
        const categoryTitle = testButton.dataset.mcTestLabel || "Other";
        showLocalNotification({
          id: `test-${category}-${Date.now()}`,
          category,
          categoryTitle,
          message: `Test notification for ${categoryTitle}.`,
          url: location.href
        });
      });
    });

    popover.querySelector("[data-mc-save]").addEventListener("click", () => {
      const nextAllowed = new Set(
        [...popover.querySelectorAll("[data-mc-category]:checked")].map((input) => input.value)
      );

      saveAllowed(nextAllowed);
      setEnabled(popover.querySelector("[data-mc-master]").checked);
      closePopover();
    });
  }

  injectSettingsPanel();
})();
