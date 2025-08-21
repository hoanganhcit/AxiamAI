// -------------------- State --------------------
const state = {
  stream: null,
  enrolledHashHex: "",
  saveLocal: false,
  prompt: "",
  promptDone: false,
  threshold: 85,
  demoPrompts: [
    "Turn your head left",
    "Turn your head right",
    "Smile briefly",
    "Blink twice",
    "Look up",
    "Look down",
  ],
};

// Load cached hash
const cached = localStorage.getItem("demo_face_hash");
if (cached) state.enrolledHashHex = cached;

// Reflect cached
$(function () {
  if (state.enrolledHashHex) {
    showEnrollStatus(
      "Face enrolled (cached). You can now run liveness and sign in.",
      true
    );
    showHashInfo(state.enrolledHashHex);
  }
});

// -------------------- UI helpers --------------------
function setStatus($el, type, text) {
  $el.removeClass("d-none");
  $el
    .attr("class", "")
    .addClass(
      `status rounded-2xl p-2 d-flex align-items-center gap-2 ${type || ""}`
    )
    .html(
      `<i class="icon ${
        type === "ok"
          ? "bi bi-check2-circle"
          : type === "err"
          ? "bi bi-x-circle"
          : "bi bi-arrow-clockwise"
      }"></i><span>${text}</span>`
    );
}
function showEnrollStatus(text, ok) {
  setStatus($("#enrollStatus"), ok ? "ok" : "info", text);
}
function showSigninStatus(text, ok) {
  setStatus($("#signinStatus"), ok ? "ok" : "err", text);
}
function showLivenessInfo(kind, text) {
  const type = kind === "ok" ? "ok" : kind === "warn" ? "warn" : "info";
  setStatus($("#livenessStatus"), type, text);
}
function showHashInfo(hex) {
  $("#hashInfo")
    .removeClass("d-none")
    .text(`Demo Hash: ${hex.slice(0, 64)}…`);
}

// -------------------- Camera --------------------
async function startCamera() {
  if (state.stream) return;
  try {
    const s = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });
    state.stream = s;
    const video = document.getElementById("video");
    video.srcObject = s;
    await video.play();
  } catch (e) {
    alert("Camera error: " + e.message);
  }
}
function stopCamera() {
  if (state.stream) {
    state.stream.getTracks().forEach((t) => t.stop());
    state.stream = null;
  }
  const video = document.getElementById("video");
  video.srcObject = null;
}

function snapshotToImageEl() {
  const video = document.getElementById("video");
  if (!video) return null;
  const c = document.createElement("canvas");
  c.width = video.videoWidth || 640;
  c.height = video.videoHeight || 480;
  const ctx = c.getContext("2d");
  ctx.drawImage(video, 0, 0, c.width, c.height);
  const img = new Image();
  img.src = c.toDataURL("image/jpeg", 0.8);
  return img;
}

function fileToImageEl(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = r.result;
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });
}

// -------------------- aHash & utils --------------------
function drawToCanvas(img, w = 16, h = 16) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d");
  ctx.drawImage(img, 0, 0, w, h);
  return { canvas: c, ctx };
}
function toGray(data) {
  const out = new Float32Array(data.length / 4);
  for (let i = 0, j = 0; i < data.length; i += 4, j++) {
    const r = data[i],
      g = data[i + 1],
      b = data[i + 2];
    out[j] = 0.299 * r + 0.587 * g + 0.114 * b;
  }
  return out;
}
function ahashFromImageElement(img, size = 16) {
  const { canvas, ctx } = drawToCanvas(img, size, size);
  const { data } = ctx.getImageData(0, 0, size, size);
  const gray = toGray(data);
  let sum = 0;
  for (let i = 0; i < gray.length; i++) sum += gray[i];
  const mean = sum / gray.length;
  const bits = new Uint8Array(gray.length);
  for (let i = 0; i < gray.length; i++) bits[i] = gray[i] >= mean ? 1 : 0;
  return bits;
}
function hammingDistance(a, b) {
  if (!a || !b || a.length !== b.length) return Infinity;
  let d = 0;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) d++;
  return d;
}
function bitsToHex(bits) {
  let hex = "";
  for (let i = 0; i < bits.length; i += 4) {
    const n =
      (bits[i] << 3) |
      (bits[i + 1] << 2) |
      (bits[i + 2] << 1) |
      (bits[i + 3] << 0);
    hex += n.toString(16);
  }
  return hex;
}
function hexToBits(hex) {
  const bits = new Uint8Array(hex.length * 4);
  for (let i = 0; i < hex.length; i++) {
    const n = parseInt(hex[i], 16);
    bits[i * 4 + 0] = (n >> 3) & 1;
    bits[i * 4 + 1] = (n >> 2) & 1;
    bits[i * 4 + 2] = (n >> 1) & 1;
    bits[i * 4 + 3] = n & 1;
  }
  return bits;
}

// -------------------- Enroll & Signin --------------------
async function enrollFromCurrentFrame() {
  showEnrollStatus("Capturing frame…");
  const img = snapshotToImageEl();
  if (!img) return showEnrollStatus("No video frame available.");
  await new Promise((res) => (img.onload = res));
  const bits = ahashFromImageElement(img, 16);
  const hex = bitsToHex(bits);
  state.enrolledHashHex = hex;
  showEnrollStatus(
    "Face enrolled (demo hash saved). You can now run liveness and sign in.",
    true
  );
  showHashInfo(hex);
  if (state.saveLocal) localStorage.setItem("demo_face_hash", hex);
}
async function enrollFromUpload(file) {
  showEnrollStatus("Processing photo…");
  try {
    const img = await fileToImageEl(file);
    const bits = ahashFromImageElement(img, 16);
    const hex = bitsToHex(bits);
    state.enrolledHashHex = hex;
    showEnrollStatus("Face enrolled from photo (demo).", true);
    showHashInfo(hex);
    if (state.saveLocal) localStorage.setItem("demo_face_hash", hex);
  } catch (e) {
    showEnrollStatus("Failed to read image: " + e.message);
  }
}

async function attemptSignin() {
  if (!state.enrolledHashHex)
    return showSigninStatus("No enrolled face. Please enroll first.", false);
  showSigninStatus("Capturing…", false);
  const img = snapshotToImageEl();
  if (!img) return showSigninStatus("No video frame available.", false);
  await new Promise((res) => (img.onload = res));
  const probe = ahashFromImageElement(img, 16);
  const ref = hexToBits(state.enrolledHashHex);
  const d = hammingDistance(probe, ref);
  const ok = d <= state.threshold && state.promptDone;
  showSigninStatus(
    ok ? `Match ✓ (distance ${d})` : `Denied ✗ (distance ${d})`,
    ok
  );
}

function randomizePrompt() {
  state.prompt =
    state.demoPrompts[Math.floor(Math.random() * state.demoPrompts.length)];
  state.promptDone = false;
  $("#btnDid").prop("disabled", false);
  showLivenessInfo("warn", `Do this: ${state.prompt}`);
}

// -------------------- Events --------------------
$("#btnStart").on("click", startCamera);
$("#btnStop").on("click", stopCamera);
$("#btnEnrollFrame").on("click", enrollFromCurrentFrame);
$("#fileInput").on("change", (e) => {
  if (e.target.files?.[0]) enrollFromUpload(e.target.files[0]);
});
$("#btnSignin").on("click", attemptSignin);
$("#btnPrompt").on("click", randomizePrompt);
$("#btnDid").on("click", function () {
  if (!state.prompt) return;
  state.promptDone = true;
  showLivenessInfo("ok", `Completed: ${state.prompt}`);
});
$("#saveLocal").on("change", function () {
  state.saveLocal = this.checked;
  if (!state.saveLocal) localStorage.removeItem("demo_face_hash");
  if (state.saveLocal && state.enrolledHashHex)
    localStorage.setItem("demo_face_hash", state.enrolledHashHex);
});
$("#threshold").on("input", function () {
  state.threshold = parseInt(this.value, 10);
  $("#thresholdVal").text(state.threshold);
});
