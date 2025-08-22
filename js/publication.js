const initialPosts = [
  {
    id: "wp-001",
    title:
      "Verified Identity at the Edge: A White Paper on Passwordless Access",
    type: "whitepaper",
    authors: ["Henry Quach", "A. Sharma"],
    date: "2025-07-12",
    tags: ["identity", "passwordless", "zero trust"],
    summary:
      "A deep dive into replacing usernames, passwords, and weak MFA with verified identity at the front door. Covers threat models, architecture, and measurable risk reduction.",
    readUrl: "#",
    downloadUrl: "#",
    pinned: true,
  },
  {
    id: "ar-002",
    title: "Trends in MFA Bypass Tactics, 2023–2025",
    type: "article",
    authors: ["J. Patel"],
    date: "2025-05-28",
    tags: ["MFA", "attack techniques", "phishing"],
    summary:
      "Survey of real‑world incidents showing the evolution from phishing kits to adversary‑in‑the‑middle and prompt bombing, with mitigations that actually work.",
    readUrl: "#",
  },
  {
    id: "wp-003",
    title: "Designing a Bastion Gateway for Human‑Verified Access",
    type: "whitepaper",
    authors: ["C. Nguyen"],
    date: "2025-04-04",
    tags: ["bastion host", "infrastructure", "governance"],
    summary:
      "Reference architecture for a single secure gateway that enforces identity assurance before any network touch, including audit, HA, and rollout playbooks.",
    downloadUrl: "#",
  },
  {
    id: "ar-004",
    title: "Measuring the Real Cost of Account Takeover",
    type: "article",
    authors: ["S. Li", "R. Thompson"],
    date: "2025-03-17",
    tags: ["economics", "risk", "incident response"],
    summary:
      "A practical model to quantify downtime, recovery labor, legal exposure, and customer churn when credentials are compromised.",
    readUrl: "#",
  },
  {
    id: "wp-005",
    title: "Privacy by Design in Face-Based Sign‑In Systems",
    type: "whitepaper",
    authors: ["M. Chen"],
    date: "2025-01-09",
    tags: ["privacy", "biometrics", "compliance"],
    summary:
      "Guidance for encrypted templates, liveness, and regional compliance (PIPEDA, GDPR, CCPA) with deployment checklists.",
    readUrl: "#",
    downloadUrl: "#",
  },
];

// ------------------ State ------------------
let posts = loadPosts();
let query = "";
let activeTab = "all"; // all | whitepaper | article
let sortMode = "newest"; // newest | oldest | az
let tagFilter = "";

// ------------------ Helpers ------------------
function loadPosts() {
  try {
    const saved = localStorage.getItem("wphub.posts");
    if (saved) return JSON.parse(saved);
  } catch (e) {}
  return initialPosts;
}
function savePosts() {
  try {
    localStorage.setItem("wphub.posts", JSON.stringify(posts));
  } catch (e) {}
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
}

function getFiltered() {
  let list = posts.slice();
  if (activeTab !== "all") list = list.filter((p) => p.type === activeTab);
  if (query.trim()) {
    const q = query.toLowerCase();
    list = list.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.summary.toLowerCase().includes(q) ||
        p.authors.join(" ").toLowerCase().includes(q) ||
        p.tags.join(" ").toLowerCase().includes(q)
    );
  }
  if (tagFilter) {
    list = list.filter((p) => p.tags.includes(tagFilter));
  }
  if (sortMode === "newest")
    list.sort((a, b) => new Date(b.date) - new Date(a.date));
  else if (sortMode === "oldest")
    list.sort((a, b) => new Date(a.date) - new Date(b.date));
  else if (sortMode === "az")
    list.sort((a, b) => a.title.localeCompare(b.title));
  return list;
}

function statCount(type) {
  return posts.filter((p) => p.type === type).length;
}

// ------------------ Rendering ------------------
function render() {
  // Stats
  $("#stat-total").text(posts.length);
  $("#stat-whitepapers").text(statCount("whitepaper"));
  $("#stat-articles").text(statCount("article"));

  // Pinned
  const pinned = posts.find((p) => p.pinned);
  if (pinned) {
    $("#pinnedWrapper").removeClass("d-none");
    $("#pinnedTitle").text(pinned.title);
    $("#pinnedSummary").text(pinned.summary || "");
    $("#pinnedMeta").html(`
          <span class="d-inline-flex align-items-center gap-1"><i class="bi bi-person"></i> ${pinned.authors.join(
            ", "
          )}</span>
          <span class="d-inline-flex align-items-center gap-1"><i class="bi bi-calendar"></i> ${formatDate(
            pinned.date
          )}</span>
        `);
    const tagsHtml = pinned.tags
      .map(
        (t) =>
          `<span class="badge text-secondary-foreground bg-secondary rounded-full border-transparent tag-badge" data-tag="${t}"><i class="bi bi-tag me-1"></i>${t}</span>`
      )
      .join(" ");
    $("#pinnedTags").html(tagsHtml);
    let actions = "";
    if (pinned.readUrl)
      actions += `<a href="${pinned.readUrl}" target="_blank" class="btn btn-primary small d-inline-flex rounded-md align-items-center gap-2"><i class="bi bi-eye"></i> Read online</a>`;
    if (pinned.downloadUrl)
      actions += `<a href="${pinned.downloadUrl}" class="btn btn-outline-secondary  small rounded-md d-inline-flex align-items-center gap-2"><i class="bi bi-download"></i> Download PDF</a>`;
    $("#pinnedActions").html(actions);
  } else {
    $("#pinnedWrapper").addClass("d-none");
  }

  // Clear tag button state
  if (tagFilter) {
    $("#activeTagText").text(tagFilter);
    $("#clearTagBtn").removeClass("d-none");
  } else {
    $("#clearTagBtn").addClass("d-none");
  }

  // Grids
  const filtered = getFiltered();
  const buckets = {
    all: filtered,
    whitepaper: filtered.filter((p) => p.type === "whitepaper"),
    article: filtered.filter((p) => p.type === "article"),
  };

  for (const key of ["all", "whitepaper", "article"]) {
    const grid = $(`#grid-${key}`);
    grid.empty();
    buckets[key].forEach((p) => grid.append(renderCard(p)));
    const empty = $(`#empty-${key}`);
    if (buckets[key].length === 0) {
      empty.removeClass("d-none");
    } else {
      empty.addClass("d-none");
    }
  }

  // wire tag clicks (delegated too but ensure pinned area works)
  $("[data-tag]")
    .off("click")
    .on("click", function () {
      tagFilter = $(this).data("tag");
      render();
    });
}

function renderCard(p) {
  const tagBadges = p.tags
    .map(
      (t) =>
        `<span class="badge text-secondary-foreground bg-secondary rounded-full border-transparent border tag-badge" data-tag="${t}"><i class="bi bi-tag me-1"></i>${t}</span>`
    )
    .join(" ");
  const readBtn = p.readUrl
    ? `<a href="${p.readUrl}" target="_blank" class="btn btn-primary"><i class="bi bi-eye me-1"></i> Details</a>`
    : `<button class="btn btn-primary btn-details" data-id="${p.id}"><i class="bi bi-eye me-1"></i> Details</button>`;
  return `
        <div class="col-12 col-md-6 col-xl-4">
          <div class="card card-hover h-100 rounded-2xl" style="border:1px solid #e5e7eb">
            <div class="card-body d-flex flex-column">
              <div class="d-flex align-items-center justify-content-between small text-secondary mb-2">
                <span class="badge py-0\.5 px-2\.5 rounded-2xl ${
                  p.type === "whitepaper"
                    ? "text-bg-primary"
                    : "text-secondary-foreground bg-secondary"
                }">${p.type === "whitepaper" ? "White paper" : "Article"}</span>
                <span><i class="bi bi-calendar me-1"></i>${formatDate(
                  p.date
                )}</span>
              </div>
              <h6 class="mb-1">${p.title}</h6>
              <div class="small text-muted mb-2"><i class="bi bi-person me-1"></i>${p.authors.join(
                ", "
              )}</div>
              <p class="text-secondary small mb-3 line-clamp-3">${
                p.summary || ""
              }</p>
              <div class="d-flex flex-wrap gap-2 mb-3">${tagBadges}</div>
              <div class="mt-auto d-flex gap-2">
                <button class="btn btn-primary small rounded-md btn-details" data-id="${
                  p.id
                }"><i class="bi bi-eye me-1"></i> Details</button>
                ${
                  p.downloadUrl
                    ? `<a class="btn btn-outline-secondary small rounded-md" href="${p.downloadUrl}"><i class=\"bi bi-download me-1\"></i> Download</a>`
                    : ""
                }
              </div>
            </div>
          </div>
        </div>`;
}

// ------------------ Details Modal Control ------------------
function openDetails(id) {
  const p = posts.find((x) => x.id === id);
  if (!p) return;
  $("#detailsTitle").text(p.title);
  $("#detailsSummary").text(p.summary || "");
  $("#detailsMeta").html(`
        <span class="d-inline-flex align-items-center gap-1"><i class="bi bi-person"></i> ${p.authors.join(
          ", "
        )}</span>
        <span class="d-inline-flex align-items-center gap-1"><i class="bi bi-calendar"></i> ${formatDate(
          p.date
        )}</span>
      `);
  $("#detailsTags").html(
    p.tags
      .map((t) => `<span class="badge rounded-full border-transparent text-bg-light border">${t}</span>`)
      .join(" ")
  );
  let actions = "";
  if (p.readUrl)
    actions += `<a href="${p.readUrl}" target="_blank" class="btn btn-primary d-inline-flex align-items-center gap-2"><i class="bi bi-box-arrow-up-right"></i> Read online</a>`;
  if (p.downloadUrl)
    actions += `<a href="${p.downloadUrl}" class="btn btn-outline-secondary d-inline-flex align-items-center gap-2"><i class="bi bi-download"></i> Download PDF</a>`;
  $("#detailsActions").html(
    actions || '<span class="text-secondary small">No external links.</span>'
  );
  const modal = new bootstrap.Modal(document.getElementById("detailsModal"));
  modal.show();
}

// ------------------ Events ------------------
$(document).on("input", "#searchInput", function () {
  query = $(this).val();
  render();
});
$(document).on("click", ".sort-option", function (e) {
  e.preventDefault();
  sortMode = $(this).data("sort");
  render();
});
$(document).on(
  "shown.bs.tab",
  '#typeTabs button[data-bs-toggle="tab"]',
  function (e) {
    const target = $(e.target).attr("data-bs-target");
    activeTab = target.replace("#pane-", "");
    render();
  }
);
$(document).on("click", "#btn-clear-filters", function () {
  query = "";
  tagFilter = "";
  $("#searchInput").val("");
  render();
});
$(document).on("click", "#clearTagBtn", function () {
  tagFilter = "";
  render();
});
$(document).on("click", ".btn-details", function () {
  const id = $(this).data("id");
  openDetails(id);
});

// Tag clicks are delegated via data-tag in render()

// Bulk import JSON
$("#btn-bulk").on("click", () => $("#bulkFile").trigger("click"));
$("#bulkFile").on("change", function () {
  const file = this.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const arr = JSON.parse(reader.result);
      if (Array.isArray(arr)) {
        // naive validation
        arr.forEach((item) => {
          if (!item.id)
            item.id = `${item.type || "wp"}-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 6)}`;
        });
        posts = arr.concat(posts);
        savePosts();
        render();
      } else {
        alert("JSON must be an array of posts.");
      }
    } catch (err) {
      alert("Invalid JSON file.");
    }
  };
  reader.readAsText(file);
  $(this).val("");
});

// New Post
function resetNewPost() {
  $("#newPostForm")[0].reset();
  $("#np-date").val(new Date().toISOString().slice(0, 10));
}
$("#newPostModal").on("shown.bs.modal", resetNewPost);
$("#np-submit").on("click", function () {
  const title = $("#np-title").val().toString().trim();
  if (!title) {
    $("#np-title")[0].reportValidity();
    return;
  }
  const type = $("#np-type").val();
  const date = $("#np-date").val() || new Date().toISOString().slice(0, 10);
  const authors = $("#np-authors")
    .val()
    .toString()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const tags = $("#np-tags")
    .val()
    .toString()
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  const summary = $("#np-summary").val().toString().trim();
  const readUrl = $("#np-read").val().toString().trim();
  const downloadUrl = $("#np-download").val().toString().trim();
  const pinned = $("#np-pinned").is(":checked");

  if (pinned) {
    posts.forEach((p) => delete p.pinned);
  }

  const post = {
    id: `${type}-${Date.now()}`,
    title,
    type,
    authors,
    date,
    tags,
    summary,
  };
  if (readUrl) post.readUrl = readUrl;
  if (downloadUrl) post.downloadUrl = downloadUrl;
  if (pinned) post.pinned = true;
  posts = [post, ...posts];
  savePosts();
  render();
  const modalEl = document.getElementById("newPostModal");
  bootstrap.Modal.getInstance(modalEl).hide();
});

// Footer year
$("#copyrightYear").text(new Date().getFullYear());

// Initial date value
$("#np-date").val(new Date().toISOString().slice(0, 10));

// First render
render();
