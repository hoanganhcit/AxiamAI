// ---------- Helpers ----------
const enc = new TextEncoder();
const dec = new TextDecoder();

function bytesToHex(bytes) {
  return Array.from(new Uint8Array(bytes))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}
function hexToBytes(hex) {
  const len = hex.length / 2;
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) out[i] = parseInt(hex.substr(i * 2, 2), 16);
  return out.buffer;
}
function concatBuffers(...bufs) {
  const total = bufs.reduce((s, b) => s + b.byteLength, 0);
  const tmp = new Uint8Array(total);
  let off = 0;
  bufs.forEach((b) => {
    tmp.set(new Uint8Array(b), off);
    off += b.byteLength;
  });
  return tmp.buffer;
}
function fileToArrayBuffer(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsArrayBuffer(file);
  });
}
function fileToDataUrl(file) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result);
    r.onerror = rej;
    r.readAsDataURL(file);
  });
}
function randomBytes(n) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return b.buffer;
}
function prettyBytes(num) {
  if (num < 1024) return `${num} B`;
  const u = ["KB", "MB", "GB", "TB"];
  let i = -1;
  do {
    num /= 1024;
    i++;
  } while (num >= 1024 && i < u.length - 1);
  return `${num.toFixed(1)} ${u[i]}`;
}

const MAGIC = enc.encode("FLOCKv1\n"); // 8 bytes

function writeContainer(metaObj, cipherBuf) {
  const metaJson = JSON.stringify(metaObj);
  const metaBytes = enc.encode(metaJson);
  const lenBuf = new ArrayBuffer(4);
  const dv = new DataView(lenBuf);
  dv.setUint32(0, metaBytes.byteLength, false);
  return concatBuffers(MAGIC.buffer, lenBuf, metaBytes.buffer, cipherBuf);
}
function readContainer(buf) {
  const magicBytes = new Uint8Array(buf, 0, MAGIC.byteLength);
  for (let i = 0; i < MAGIC.byteLength; i++)
    if (magicBytes[i] !== MAGIC[i])
      throw new Error("Invalid container (magic)");
  const dv = new DataView(buf);
  const metaLen = dv.getUint32(MAGIC.byteLength, false);
  const metaStart = MAGIC.byteLength + 4;
  const metaBytes = new Uint8Array(buf, metaStart, metaLen);
  const meta = JSON.parse(dec.decode(metaBytes));
  const cipherStart = metaStart + metaLen;
  return { meta, cipher: buf.slice(cipherStart) };
}
async function sha256(buf) {
  return await crypto.subtle.digest("SHA-256", buf);
}
async function deriveKeyFromFace(faceBytes, saltBytes) {
  const faceHash = await sha256(faceBytes);
  const baseKey = await crypto.subtle.importKey(
    "raw",
    faceHash,
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: saltBytes, iterations: 200000, hash: "SHA-256" },
    baseKey,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}
async function aesGcmEncrypt(key, plaintextBuf) {
  const iv = new Uint8Array(randomBytes(12));
  const cipher = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv },
    key,
    plaintextBuf
  );
  return { iv: iv.buffer, cipher };
}
async function aesGcmDecrypt(key, ivBuf, cipherBuf) {
  return await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: new Uint8Array(ivBuf) },
    key,
    cipherBuf
  );
}

function setStatus(msg, type = "secondary") {
  const $s = $("#status");
  $s.removeClass("d-none").removeClass(
    "alert-secondary alert-info alert-success alert-danger"
  );
  $s.addClass("alert-" + type).text(msg);
}
function clearStatus() {
  $("#status").addClass("d-none").text("");
}

// ---------- UI Logic ----------
$(function () {
  const $faceEncrypt = $("#faceEncrypt");
  const $plainFile = $("#plainFile");
  const $btnEncrypt = $("#btnEncrypt");
  const $encResult = $("#encResult");
  const $encMeta = $("#encMeta");
  const $downloadEnc = $("#downloadEnc");
  const $facePreviewWrap = $("#facePreviewWrap");
  const $facePreview = $("#facePreview");

  const $encFile = $("#encFile");
  const $faceDecrypt = $("#faceDecrypt");
  const $btnDecrypt = $("#btnDecrypt");
  const $decResult = $("#decResult");
  const $decMeta = $("#decMeta");
  const $downloadDec = $("#downloadDec");

  $faceEncrypt.on("change", async function () {
    const f = this.files && this.files[0];
    if (!f) {
      $facePreviewWrap.addClass("d-none");
      return;
    }
    const url = await fileToDataUrl(f);
    $facePreview.attr("src", url);
    $facePreviewWrap.removeClass("d-none");
  });

  $btnEncrypt.on("click", async function () {
    const face = $faceEncrypt[0].files && $faceEncrypt[0].files[0];
    const plain = $plainFile[0].files && $plainFile[0].files[0];
    if (!face || !plain) {
      setStatus("Vui lòng chọn ảnh khuôn mặt và tệp cần mã hóa.", "danger");
      return;
    }
    $encResult.addClass("d-none");
    clearStatus();
    setStatus("Deriving key from face...", "info");
    try {
      const faceBuf = await fileToArrayBuffer(face);
      const salt = new Uint8Array(randomBytes(16));
      const key = await deriveKeyFromFace(faceBuf, salt);
      setStatus("Encrypting file...", "info");
      const pt = await fileToArrayBuffer(plain);
      const { iv, cipher } = await aesGcmEncrypt(key, pt);
      const meta = {
        version: 1,
        algo: "AES-GCM",
        ivHex: bytesToHex(iv),
        saltHex: bytesToHex(salt),
        mime: plain.type || "application/octet-stream",
        name: plain.name,
        size: plain.size,
        ts: Date.now(),
        note: "FaceLock demo container.",
      };
      const container = writeContainer(meta, cipher);
      const blob = new Blob([container], { type: "application/octet-stream" });
      const href = URL.createObjectURL(blob);
      $downloadEnc.attr({ href, download: `${meta.name}.facelock` });
      $encMeta.html(`
            <li><strong>Name</strong>: ${meta.name}.facelock</li>
            <li><strong>IV</strong>: ${meta.ivHex.slice(0, 16)}…</li>
            <li><strong>Salt</strong>: ${meta.saltHex.slice(0, 16)}…</li>
            <li><strong>Size</strong>: ${prettyBytes(blob.size)}</li>
          `);
      $encResult.removeClass("d-none");
      setStatus("Encrypted ✓", "success");
    } catch (e) {
      console.error(e);
      setStatus("Encrypt failed: " + e.message, "danger");
    }
  });

  $btnDecrypt.on("click", async function () {
    const encFile = $encFile[0].files && $encFile[0].files[0];
    const face = $faceDecrypt[0].files && $faceDecrypt[0].files[0];
    if (!encFile || !face) {
      setStatus("Vui lòng chọn tệp .facelock và ảnh khuôn mặt.", "danger");
      return;
    }
    $decResult.addClass("d-none");
    clearStatus();
    setStatus("Parsing container...", "info");
    try {
      const buf = await fileToArrayBuffer(encFile);
      const { meta, cipher } = readContainer(buf);
      setStatus("Deriving key from face...", "info");
      const faceBuf = await fileToArrayBuffer(face);
      const key = await deriveKeyFromFace(
        faceBuf,
        new Uint8Array(hexToBytes(meta.saltHex))
      );
      setStatus("Decrypting...", "info");
      const pt = await aesGcmDecrypt(key, hexToBytes(meta.ivHex), cipher);
      const outBlob = new Blob([pt], {
        type: meta.mime || "application/octet-stream",
      });
      const href = URL.createObjectURL(outBlob);
      const outName = meta && meta.name ? `unlocked_${meta.name}` : "unlocked";
      $downloadDec.attr({ href, download: outName });
      $decMeta.text(`Recovered file size: ${prettyBytes(outBlob.size)}`);
      $decResult.removeClass("d-none");
      setStatus("Decrypted ✓", "success");
    } catch (e) {
      console.error(e);
      setStatus(
        "Decrypt failed: " + e.message + " (Did you use the same face?)",
        "danger"
      );
    }
  });
});
