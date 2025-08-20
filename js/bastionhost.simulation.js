$(document).ready(function () {
  const steps = [
    {
      id: "capture",
      title: "User Device",
      icon: "bi-camera",
    },
    {
      id: "liveness",
      title: "Liveness",
      icon: "bi-activity",
    },
    {
      id: "match",
      title: "Face Match",
      icon: "bi-fingerprint",
    },
    {
      id: "issue",
      title: "Token Issuer (IdP)",
      icon: "bi-key",
    },
    {
      id: "connect",
      title: "Bastion Gateway",
      icon: "bi-shield-lock",
    },
    {
      id: "server",
      title: "Target Server(s)",
      icon: "bi-hdd-network",
    },
  ];

  const $diagram = $("#diagram");
  $diagram.empty();

  steps.forEach((s) => {
    $diagram.append(`
                <div class="node diagram-step card text-center" id="node-${s.id}">
                <div class="card-body">
                    <i class="bi ${s.icon} fs-25  mb-3"></i>
                    <h6 class="card-title">${s.title}</h6>
                    <div class="text-success mt-2">
                    <i class="bi bi-check-circle-fill"></i> OK
                    </div>
                </div>
                </div>
            `);
  });
  const timelineSteps = [
    {
      id: "capture",
      title: "Capture Face",
      desc: "Camera capture with secure enclave.",
      duration: 1200,
    },
    {
      id: "liveness",
      title: "Active Liveness",
      desc: "Blink/turn challenge to defeat deepfake.",
      duration: 1600,
    },
    {
      id: "match",
      title: "Face Template Match",
      desc: "Compare encrypted template.",
      duration: 1400,
    },
    {
      id: "issue",
      title: "Issue Short-Lived Token",
      desc: "mTLS bound token.",
      duration: 1100,
    },
    {
      id: "connect",
      title: "Connect via Bastion",
      desc: "Client connects, policy eval.",
      duration: 1300,
    },
    {
      id: "authorize",
      title: "Authorize Session",
      desc: "RBAC, posture, risk, etc.",
      duration: 1000,
    },
    {
      id: "establish",
      title: "Establish Session",
      desc: "Ephemeral creds tunneled.",
      duration: 1200,
    },
  ];

  const attacks = {
    phishing: [],
    mitm: ["connect", "authorize", "establish"],
    replay: ["liveness", "match"],
    deepfake: ["liveness"],
  };

  let cursor = -1,
    status = "idle",
    speed = 1,
    timer = null;
  const $timeline = $("#timeline");
  const $eventLog = $("#eventLog");
  const $status = $("#runStatus");
  const $statusDesc = $("#statusDesc");

  timelineSteps.forEach((s) => {
    $timeline.append(`<li class="list-group-item" data-id="${s.id}">
          <div class="fw-bold">${s.title}</div>
          <div class="small text-muted">${s.desc} (~${s.duration}ms)</div>
        </li>`);
  });

  function updateUI() {
    $timeline.find("li").removeClass("active done");
    $(".node").removeClass("active done");
    timelineSteps.forEach((s, i) => {
      if (i < cursor) {
        $timeline.find(`[data-id=${s.id}]`).addClass("done");
        $(`#node-${s.id}`).addClass("done");
      } else if (i === cursor) {
        $timeline.find(`[data-id=${s.id}]`).addClass("active");
        $(`#node-${s.id}`).addClass("active");
      }
    });
    $status.text(status);
    $statusDesc.text(
      status === "failed" ? "Flow blocked by attack." : "Running simulation."
    );
  }

  function logEvent(ok, text, meta) {
    const cssClass = ok ? "log-ok" : "log-fail";
    $eventLog.append(
      `<div class="log-line ${cssClass}"><div class="fw-bold">${text}</div><div class="small">${meta}</div></div>`
    );
  }

  function reset() {
    cursor = -1;
    status = "idle";
    $eventLog.html('<div class="text-muted">No events yet. Press Start.</div>');
    $(".node").removeClass("active done");
    updateUI();
    clearTimeout(timer);
  }

  function runStep() {
    if (cursor >= timelineSteps.length || status !== "running") return;
    const step = timelineSteps[cursor];
    const duration = Math.max(400, step.duration / speed);
    const activeAttacks = [];
    if ($("#attackPhishing").is(":checked")) activeAttacks.push("phishing");
    if ($("#attackMitm").is(":checked")) activeAttacks.push("mitm");
    if ($("#attackReplay").is(":checked")) activeAttacks.push("replay");
    if ($("#attackDeepfake").is(":checked")) activeAttacks.push("deepfake");
    const blocked = activeAttacks.some((atk) => attacks[atk].includes(step.id));

    timer = setTimeout(() => {
      if (blocked) {
        status = "failed";
        logEvent(false, `Blocked: ${step.title}`, "Attack prevented.");
        updateUI();
        return;
      }
      logEvent(true, step.title, step.desc);
      if (cursor === timelineSteps.length - 1) {
        status = "done";
        logEvent(true, "Access Granted", "Session established.");
      } else {
        cursor++;
        runStep();
      }
      updateUI();
    }, duration);
  }

  $("#startBtn").click(function () {
    if (status === "idle" || status === "done" || status === "failed") {
      reset();
      status = "running";
      cursor = 0;
      $eventLog.empty();
      runStep();
    } else if (status === "paused") {
      status = "running";
      runStep();
    }
    updateUI();
    $("#pauseBtn").prop("disabled", false);
    $("#resetBtn").prop("disabled", false);
  });

  $("#pauseBtn").click(function () {
    if (status === "running") {
      status = "paused";
      clearTimeout(timer);
    }
    updateUI();
  });

  $("#resetBtn").click(function () {
    reset();
    $(this).prop("disabled", true);
    $("#pauseBtn").prop("disabled", true);
  });

  $("#speedRange").on("input", function () {
    speed = parseFloat($(this).val());
    $("#speedValue").text(speed.toFixed(2) + "x");
  });

  reset();
});
