/* Vivek Chaudhari portfolio: navigation, reveal-on-scroll, and step-through demos. */
(function () {
  "use strict";

  document.documentElement.classList.remove("no-js");
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  /* ---------- Mobile navigation ---------- */
  const menuButton = document.querySelector(".menu-button");
  const navLinks = document.getElementById("nav-links");
  if (menuButton && navLinks) {
    const setOpen = (open) => {
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close menu" : "Open menu");
      navLinks.classList.toggle("open", open);
    };
    menuButton.addEventListener("click", () => setOpen(menuButton.getAttribute("aria-expanded") !== "true"));
    navLinks.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") setOpen(false); });
  }

  /* ---------- Headshot fallback ----------
     The initials sit behind the photo. If the photo is missing, drop the <img>
     so the initials show instead of a broken image. */
  document.querySelectorAll(".avatar img").forEach((img) => {
    const drop = () => img.remove();
    if (img.complete && img.naturalWidth === 0) drop();
    else img.addEventListener("error", drop, { once: true });
  });

  /* ---------- Reveal on scroll ---------- */
  const revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion.matches) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) { entry.target.classList.add("in"); io.unobserve(entry.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add("in"));
  }

  /* ---------- Demo engine ----------
     Each demo is a list of snapshots. render(snapshot) makes the stage match it,
     so jumping to any step (or replaying) is always consistent. */
  const h = (html) => { const t = document.createElement("template"); t.innerHTML = html.trim(); return t.content.firstElementChild; };
  const $ = (root, sel) => root.querySelector(sel);
  const $$ = (root, sel) => Array.from(root.querySelectorAll(sel));
  const ICON_NEXT = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const ICON_REPLAY = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8a4.5 4.5 0 1 0 1.4-3.3M3.5 2.5v2.6h2.6" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function setupDemo(root, def) {
    const stage = $(root, ".demo-stage");
    const stepsList = $(root, ".demo-steps");
    const controls = $(root, ".demo-controls");
    const last = def.steps.length - 1;
    let index = 0;
    let timer = null;
    let autoplay = !reduceMotion.matches;
    let visible = false;

    def.build(stage);

    def.steps.forEach((step, i) => {
      const li = document.createElement("li");
      const btn = document.createElement("button");
      btn.type = "button";
      btn.dataset.step = String(i);
      btn.setAttribute("aria-label", `Step ${i + 1}: ${step.label}`);
      btn.innerHTML = `<span class="n">${i + 1}</span><span><b>${step.label}</b><small>${step.detail}</small></span>`;
      btn.addEventListener("click", () => { stopAuto(); go(i); });
      li.appendChild(btn);
      stepsList.appendChild(li);
    });

    controls.innerHTML = `
      <span class="demo-caption" aria-live="polite"></span>
      <span class="demo-progress" aria-hidden="true">${def.steps.map(() => "<i></i>").join("")}</span>
      <button type="button" class="icon-btn" data-replay aria-label="Replay ${def.name} demo">${ICON_REPLAY}</button>
      <button type="button" class="icon-btn primary" data-next aria-label="Next step of ${def.name} demo">${ICON_NEXT}</button>`;
    const caption = $(controls, ".demo-caption");
    const bars = $$(controls, ".demo-progress i");
    const nextBtn = $(controls, "[data-next]");

    $(controls, "[data-replay]").addEventListener("click", () => { stopAuto(); go(0); });
    nextBtn.addEventListener("click", () => { stopAuto(); go(index >= last ? 0 : index + 1); });
    $$(root, "[data-demo-replay]").forEach((b) => b.addEventListener("click", () => { stopAuto(); go(0); nextBtn.focus(); }));

    function go(i) {
      index = i;
      const step = def.steps[i];
      root.dataset.step = String(i);
      root.dataset.end = String(i === last);
      $$(stepsList, "button").forEach((b, j) => {
        b.classList.toggle("done", j < i);
        if (j === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
      });
      bars.forEach((b, j) => b.classList.toggle("on", j <= i));
      caption.innerHTML = `<b>${String(i + 1).padStart(2, "0")} / ${String(last + 1).padStart(2, "0")}</b> · ${step.label}`;
      nextBtn.setAttribute("aria-label", i === last ? `Restart ${def.name} demo` : `Next step of ${def.name} demo`);
      const endCard = $(stage, ".demo-end");
      if (endCard) endCard.toggleAttribute("inert", i !== last);
      def.render(stage, step.state, i);
    }

    function tick() {
      if (index >= last) { stopAuto(); return; }
      go(index + 1);
    }
    function startAuto() {
      if (!autoplay || timer || index >= last) return;
      timer = window.setInterval(tick, def.interval || 3200);
    }
    function pauseAuto() { window.clearInterval(timer); timer = null; }
    function stopAuto() { autoplay = false; pauseAuto(); }

    if ("IntersectionObserver" in window) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          visible = entry.isIntersecting;
          if (visible) startAuto(); else pauseAuto();
        });
      }, { threshold: 0.45 }).observe(root);
    }
    root.addEventListener("focusin", () => { if (timer) stopAuto(); });

    go(0);
  }

  /* ---------- PagedServe ---------- */
  const PS_REQS = [
    { id: "R1", c: "var(--seq-1)" },
    { id: "R2", c: "var(--seq-2)" },
    { id: "R3", c: "var(--seq-3)" },
  ];
  const PS_COLORS = { r1: "var(--seq-1)", r2: "var(--seq-2)", r3: "var(--seq-3)" };
  const POOL = 8;

  const pagedServe = {
    name: "PagedServe",
    steps: [
      {
        label: "Requests arrive",
        detail: "Two prompts enter the queue. Every KV block starts free.",
        state: { req: { R1: "waiting", R2: "waiting", R3: "hidden" }, pool: {}, tables: {},
          note: "R1 and R2 arrive. GPU memory is split into fixed-size KV blocks, and all 8 are free." },
      },
      {
        label: "Allocate KV blocks",
        detail: "Blocks come from a free pool into a per-sequence block table.",
        state: { req: { R1: "running", R2: "waiting", R3: "hidden" }, pool: { 0: ["r1"], 1: ["r1"], 2: ["r1"] }, tables: { R1: [0, 1, 2] },
          note: "R1 gets 3 blocks as its tokens need them, not one contiguous slab sized for the max length." },
      },
      {
        label: "Share a prefix block",
        detail: "Same system prompt, same block. Refcount goes to 2.",
        state: { req: { R1: "running", R2: "running", R3: "waiting" }, pool: { 0: ["shared", 2], 1: ["r1"], 2: ["r1"], 3: ["r2"], 4: ["r2"], 5: ["r2"] }, tables: { R1: [0, 1, 2], R2: ["0*", 3, 4, 5] },
          note: "R2 starts with the same prefix, so its table points at block 0 too. R3 arrives, but needs 3 blocks and only 2 are free." },
      },
      {
        label: "Finish and free",
        detail: "R1 completes. Its private blocks return to the pool.",
        state: { req: { R1: "done", R2: "running", R3: "waiting" }, pool: { 0: ["r2", 1], 3: ["r2"], 4: ["r2"], 5: ["r2"] }, tables: { R1: "gone", R2: ["0*", 3, 4, 5] },
          note: "R1 finishes. Blocks 1 and 2 go back to the free pool. Block 0 stays alive because R2 still holds a reference." },
      },
      {
        label: "Admit mid-batch",
        detail: "The scheduler adds R3 on the next decode step. No drain.",
        state: { req: { R1: "done", R2: "running", R3: "running" }, pool: { 0: ["r2", 1], 1: ["r3"], 2: ["r3"], 3: ["r2"], 4: ["r2"], 5: ["r2"], 6: ["r3"] }, tables: { R1: "gone", R2: ["0*", 3, 4, 5], R3: [1, 2, 6] },
          note: "On the very next decode step the scheduler admits R3 into the freed blocks while R2 keeps generating." },
      },
      {
        label: "Measured results",
        detail: "Benchmarked against HuggingFace generate().",
        state: { req: { R1: "done", R2: "running", R3: "running" }, pool: { 0: ["r2", 1], 1: ["r3"], 2: ["r3"], 3: ["r2"], 4: ["r2"], 5: ["r2"], 6: ["r3"] }, tables: { R1: "gone", R2: ["0*", 3, 4, 5], R3: [1, 2, 6] }, note: "" },
      },
    ],
    build(stage) {
      const ui = h(`<div class="ps">
        <span class="stage-tag">Illustrative walkthrough</span>
        <div class="ps-grid">
          <div class="panel ps-queue"><div class="panel-h">Request queue</div><ul>
            ${PS_REQS.map((r) => `<li class="req" data-id="${r.id}" style="--c:${r.c}"><span style="display:flex;gap:7px;align-items:center"><i class="sw"></i>${r.id}</span><span class="st"></span></li>`).join("")}
          </ul></div>
          <div class="panel ps-pool"><div class="panel-h"><span>KV block pool</span><span data-free></span></div>
            <div class="blocks">${Array.from({ length: POOL }, (_, i) => `<div class="blk" data-i="${i}">${i}<span class="rc"></span></div>`).join("")}</div>
            <div class="pool-legend"><span><i></i>free</span><span><i style="background:repeating-linear-gradient(135deg,var(--seq-1) 0 4px,var(--seq-2) 4px 8px);border:0"></i>shared prefix</span><span><b style="font-weight:500;color:var(--ink)">n</b> refcount</span></div>
          </div>
          <div class="panel ps-tables"><div class="panel-h">Block tables</div>
            <div class="rows">${PS_REQS.map((r) => `<div class="trow" data-id="${r.id}" style="--c:${r.c}" hidden><span class="lbl">${r.id}</span><span class="cells"></span></div>`).join("")}</div>
            <div class="batch">batch <span data-batch style="display:inline-flex;gap:5px;flex-wrap:wrap"></span></div>
          </div>
        </div>
        <p class="stage-note" data-note></p>
      </div>`);
      stage.prepend(ui);
    },
    render(stage, s) {
      $$(stage, ".req").forEach((el) => {
        const st = s.req[el.dataset.id];
        el.dataset.status = st;
        $(el, ".st").textContent = st === "hidden" ? "" : st;
      });
      let free = 0;
      $$(stage, ".blk").forEach((el) => {
        const i = Number(el.dataset.i);
        const entry = s.pool[i];
        const prev = el.dataset.owner || "";
        const rc = $(el, ".rc");
        if (entry) {
          el.dataset.owner = entry[0];
          el.style.setProperty("--c", PS_COLORS[entry[0]] || "transparent");
          rc.textContent = entry[1] ? String(entry[1]) : "";
          rc.classList.toggle("on", Boolean(entry[1]));
        } else {
          free += 1;
          delete el.dataset.owner;
          el.style.removeProperty("--c");
          rc.classList.remove("on");
        }
        if (prev !== (el.dataset.owner || "")) {
          el.classList.add("pop");
          window.setTimeout(() => el.classList.remove("pop"), 380);
        }
      });
      $(stage, "[data-free]").textContent = `${free} free`;
      $$(stage, ".trow").forEach((row) => {
        const t = s.tables[row.dataset.id];
        const cells = $(row, ".cells");
        const key = JSON.stringify(t || null);
        row.hidden = !t;
        row.classList.toggle("gone", t === "gone");
        if (row.dataset.key === key) return;
        row.dataset.key = key;
        if (Array.isArray(t)) {
          cells.innerHTML = t.map((b) => {
            const shared = String(b).endsWith("*");
            return `<span class="cell${shared ? " sh" : ""}" title="${shared ? "shared block" : "block"}">b${String(b).replace("*", "")}</span>`;
          }).join("");
        } else if (t === "gone") {
          cells.innerHTML = '<span class="pill">finished, table released</span>';
        }
      });
      const running = PS_REQS.filter((r) => s.req[r.id] === "running");
      $(stage, "[data-batch]").innerHTML = running.length
        ? running.map((r) => `<span class="pill" style="color:${r.c};border-color:${r.c}">${r.id}</span>`).join("")
        : '<span class="pill">empty</span>';
      if (s.note) $(stage, "[data-note]").textContent = s.note;
    },
  };

  /* ---------- GRPO-Zero ---------- */
  const GR_SAMPLES = [
    { ans: "17", ok: 1, fmt: 1 },
    { ans: "23", ok: 0, fmt: 1 },
    { ans: "17", ok: 1, fmt: 0 },
    { ans: "12", ok: 0, fmt: 0 },
    { ans: "17", ok: 1, fmt: 1 },
    { ans: "11", ok: 0, fmt: 1 },
    { ans: "17", ok: 1, fmt: 1 },
    { ans: "13", ok: 0, fmt: 0 },
  ];
  const W_OK = 1.0;
  const W_FMT = 0.2;
  const rewards = GR_SAMPLES.map((s) => s.ok * W_OK + s.fmt * W_FMT);
  const mean = rewards.reduce((a, b) => a + b, 0) / rewards.length;
  const std = Math.sqrt(rewards.reduce((a, r) => a + (r - mean) ** 2, 0) / rewards.length);
  const advs = rewards.map((r) => (r - mean) / std);
  const maxAdv = Math.max(...advs.map(Math.abs));
  const f2 = (n) => (n >= 0 ? "+" : "−") + Math.abs(n).toFixed(2);

  const grpo = {
    name: "GRPO-Zero",
    steps: [
      { label: "One GSM8K prompt", detail: "A grade-school math problem with a checkable answer.", state: { rows: 0, side: "setup",
        note: "Start from one math word problem. The final answer can be verified by a program, so no learned reward model is needed." } },
      { label: "Sample a group of 8", detail: "The current policy writes 8 independent solutions.", state: { rows: 8, side: "setup",
        note: "The policy samples a group of 8 completions for the same prompt. Some reach 17, some don't." } },
      { label: "Score each completion", detail: "Reward = correctness + format shaping.", state: { rows: 8, score: true, side: "reward",
        note: "Each completion gets a composite reward: 1.0 for the correct final answer, plus 0.2 for following the answer format." } },
      { label: "Group-relative advantage", detail: "Normalize by the group's mean and std. No critic.", state: { rows: 8, score: true, adv: true, side: "norm",
        note: "Advantages are relative to the group: above-mean completions get positive credit, below-mean ones negative." } },
      { label: "Policy update with KL", detail: "Push toward above-mean answers, stay near the reference.", state: { rows: 8, score: true, adv: true, side: "update",
        note: "The gradient step raises the likelihood of positive-advantage completions, with a KL penalty keeping the policy close to the reference model." } },
      { label: "Loop", detail: "Next batch of prompts, same recipe.", state: { rows: 8, score: true, adv: true, side: "loop",
        note: "Repeat over the training set. Smoke-test and overfit presets gate every run, and reward curves are watched for reward hacking." } },
      { label: "Measured result", detail: "Pass@1 on 500 held-out GSM8K problems.", state: { rows: 8, score: true, adv: true, side: "loop", note: "" } },
    ],
    build(stage) {
      const ui = h(`<div class="gr">
        <span class="stage-tag">Illustrative values</span>
        <div class="panel gr-prompt">
          <div class="panel-h"><span>Prompt</span><span>GSM8K-style</span></div>
          <p>Maya has 18 stickers. She gives a third of them to her brother, then buys 5 more. How many stickers does she have now?</p>
          <p class="gold">verifier: final answer == 17</p>
        </div>
        <div class="gr-main">
          <div class="gr-table">
            <div class="gr-row head"><span>#</span><span><span class="long">answer</span><span class="short">ans</span></span><span><span class="long">correct</span><span class="short">ok</span></span><span><span class="long">format</span><span class="short">fmt</span></span><span>r</span><span><span class="long">advantage</span><span class="short">A</span></span></div>
            ${GR_SAMPLES.map((s, i) => `<div class="gr-row body off" data-r="${i}">
              <span>o${i + 1}</span><span>${s.ans}</span>
              <span class="c" data-score>${s.ok ? '<span class="pill ok">1.0</span>' : '<span class="pill bad">0</span>'}</span>
              <span class="c" data-score>${s.fmt ? '<span class="pill ok">0.2</span>' : '<span class="pill">0</span>'}</span>
              <span class="c" data-score>${rewards[i].toFixed(1)}</span>
              <span class="adv"><i class="${advs[i] >= 0 ? "pos" : "neg"}"></i><em></em></span>
            </div>`).join("")}
          </div>
          <div class="panel gr-side" data-side></div>
        </div>
        <p class="stage-note" data-note></p>
      </div>`);
      stage.prepend(ui);
    },
    sides: {
      setup: `<div class="panel-h">Setup</div><div class="gr-stats">
        <div class="kv"><span>policy</span><b>Qwen2.5-0.5B-Instruct</b></div>
        <div class="kv"><span>reference</span><b>frozen copy</b></div>
        <div class="kv"><span>group G</span><b>8</b></div>
        <div class="kv"><span>adapter</span><b>LoRA</b></div></div>`,
      reward: `<div class="panel-h">Reward</div><div class="gr-stats">
        <p class="eq">r<sub>i</sub> = r<sub>correct</sub> + r<sub>format</sub></p>
        <div class="kv"><span>correct</span><b>1.0</b></div>
        <div class="kv"><span>format</span><b>0.2</b></div>
        <p class="eq">Deterministic checks. Nothing to learn, nothing to fool except the format.</p></div>`,
      norm: `<div class="panel-h">Normalize</div><div class="gr-stats">
        <div class="kv"><span>mean μ</span><b>${mean.toFixed(3)}</b></div>
        <div class="kv"><span>std σ</span><b>${std.toFixed(3)}</b></div>
        <p class="eq">A<sub>i</sub> = (r<sub>i</sub> − μ) / σ</p>
        <p class="eq">The group mean is the baseline, so there is no value network.</p></div>`,
      update: `<div class="panel-h">Update</div><div class="gr-stats">
        <p class="eq">max Σ A<sub>i</sub> log π<sub>θ</sub>(o<sub>i</sub>) − β KL(π<sub>θ</sub> ‖ π<sub>ref</sub>)</p>
        <div><div class="meter-row">raise: ${advs.filter((a) => a > 0).length} above mean</div><div class="meter"><i style="background:var(--ok)" data-w="100"></i></div></div>
        <div><div class="meter-row">lower: ${advs.filter((a) => a < 0).length} below mean</div><div class="meter"><i style="background:var(--bad)" data-w="100"></i></div></div>
        <div><div class="meter-row">KL to reference (kept small)</div><div class="meter"><i data-w="18"></i></div></div></div>`,
      loop: `<div class="panel-h">Loop</div><div class="gr-stats">
        <p class="gr-loop spin"><svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13 8a5 5 0 1 1-1.5-3.6M13 2.5v2.5h-2.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>next prompt batch</p>
        <div class="kv"><span>guard</span><b>smoke test</b></div>
        <div class="kv"><span>guard</span><b>overfit preset</b></div>
        <div class="kv"><span>watch</span><b>reward hacking</b></div></div>`,
    },
    render(stage, s) {
      $$(stage, ".gr-row.body").forEach((row, i) => {
        row.classList.toggle("off", i >= s.rows);
        row.style.transitionDelay = s.rows && !reduceMotion.matches ? `${i * 60}ms` : "0ms";
        $$(row, "[data-score]").forEach((c) => c.classList.toggle("on", Boolean(s.score)));
        row.classList.toggle("up", s.side === "update" && advs[i] > 0);
        row.classList.toggle("down", s.side === "update" && advs[i] < 0);
        const bar = $(row, ".adv i");
        const label = $(row, ".adv em");
        const a = advs[i];
        const w = s.adv ? (Math.abs(a) / maxAdv) * 50 : 0;
        bar.style.width = `${w}%`;
        if (a < 0) bar.style.left = `${50 - w}%`;
        label.textContent = s.adv ? f2(a) : "";
        label.style.left = a >= 0 ? "4px" : "";
        label.style.right = a < 0 ? "4px" : "";
      });
      const side = $(stage, "[data-side]");
      if (side.dataset.key !== s.side) {
        side.dataset.key = s.side;
        side.innerHTML = grpo.sides[s.side];
        requestAnimationFrame(() => $$(side, ".meter i").forEach((m) => { m.style.width = `${m.dataset.w}%`; }));
      }
      side.classList.toggle("live", s.side === "update" || s.side === "norm");
      if (s.note) $(stage, "[data-note]").textContent = s.note;
    },
  };

  /* ---------- Blastr AI ---------- */
  const BL_NODES = ["Sequence", "Voice call", "Intent", "WhatsApp", "CRM"];
  const BL_LINES = [
    { ai: true, t: "Hi, this is the voice assistant from the sales team. You asked about bulk pricing. Is now a good time?" },
    { ai: false, t: "Haan, boliye. 50 units ka rate kya hoga?" },
    { ai: true, t: "50 units par volume pricing milegi. Exact link abhi WhatsApp par bhej doon?" },
    { ai: false, t: "Yes, send it. I'll place the order today." },
  ];
  const blastr = {
    name: "Blastr AI",
    interval: 3600,
    steps: [
      { label: "Lead enters sequence", detail: "Email and LinkedIn touches go out on schedule.", state: { node: 0, lines: 0, intent: 0, wa: false, crm: false,
        note: "A new lead enters the outbound sequence. Email and LinkedIn touches run automatically until the lead engages." } },
      { label: "AI voice call", detail: "Streaming voice with interruption-aware turn-taking.", state: { node: 1, lines: 3, intent: 0, wa: false, crm: false,
        note: "The agent calls. The lead answers in Hindi and the agent follows, switching language mid-call without a restart." } },
      { label: "Live intent classification", detail: "The planner reads buyer intent while the call is still going.", state: { node: 2, lines: 4, intent: 1, wa: false, crm: false,
        note: "The lead switches to English and asks for the link. Intent is classified live as purchase-ready, so no human rep is needed." } },
      { label: "WhatsApp handoff", detail: "Warm lead gets the exact purchase link.", state: { node: 3, lines: 4, intent: 1, wa: true, crm: false,
        note: "The execution agent hands the warm lead to WhatsApp with the exact purchase link for what they asked about." } },
      { label: "CRM updated", detail: "Every outcome is written back automatically.", state: { node: 4, lines: 4, intent: 1, wa: true, crm: true,
        note: "Stage, intent, language, and next step are written back to the CRM, so the funnel stays accurate without manual entry." } },
      { label: "Measured results", detail: "From paying enterprise clients in production.", state: { node: 5, lines: 4, intent: 1, wa: true, crm: true, note: "" } },
    ],
    build(stage) {
      const ui = h(`<div class="bl">
        <span class="stage-tag">Illustrative walkthrough</span>
        <div class="bl-flow" aria-hidden="true">${BL_NODES.map((n, i) => `${i ? '<span class="bl-sep"></span>' : ""}<span class="bl-node" data-n="${i}">${n}</span>`).join("")}</div>
        <div class="bl-grid">
          <div style="display:grid;gap:12px;align-content:start">
            <div class="panel bl-lead" data-p="0">
              <div class="panel-h"><span>Lead</span><span class="pill acc">in sequence</span></div>
              <div class="who"><span class="av">WB</span><span><b>Wholesale buyer</b><small>Inbound pricing request</small></span></div>
              <div class="touches"><span class="pill ok">email 1 sent</span><span class="pill ok">LinkedIn connect</span><span class="pill ok">email 2 opened</span></div>
            </div>
            <div class="panel bl-call" data-p="1">
              <div class="panel-h"><span>Voice call</span><span class="pill" data-lang>HI</span></div>
              <div class="wave" aria-hidden="true">${"<i></i>".repeat(34)}</div>
              <div class="transcript">${BL_LINES.map((l) => `<p class="line off${l.ai ? " ai" : ""}"><b>${l.ai ? "agent" : "lead"}</b>${l.t}</p>`).join("")}</div>
            </div>
          </div>
          <div style="display:grid;gap:12px;align-content:start">
            <div class="panel" data-p="2">
              <div class="panel-h"><span>Intent, live</span><span class="pill" data-intent>listening</span></div>
              <div class="bars">
                <div class="bar" data-b="browsing">browsing<div class="track"><i></i></div></div>
                <div class="bar" data-b="objection">objection<div class="track"><i></i></div></div>
                <div class="bar" data-b="ready">purchase-ready<div class="track"><i></i></div></div>
              </div>
            </div>
            <div class="panel" data-p="3">
              <div class="panel-h"><span>WhatsApp</span><span class="pill" data-wa>idle</span></div>
              <div class="wa-bubble" data-bubble style="opacity:0">Here is your order link for 50 units, priced at the volume tier.<br><span class="buy">Complete purchase</span></div>
            </div>
            <div class="panel" data-p="4">
              <div class="panel-h"><span>CRM record</span><span class="pill" data-sync>pending</span></div>
              <div class="crm">
                <div><span>stage</span><b data-f="stage">Contacted</b></div>
                <div><span>intent</span><b data-f="intent">Unknown</b></div>
                <div><span>language</span><b data-f="lang">Not set</b></div>
                <div><span>next step</span><b data-f="next">Follow up</b></div>
              </div>
            </div>
          </div>
        </div>
        <p class="stage-note" data-note></p>
      </div>`);
      stage.prepend(ui);
    },
    render(stage, s) {
      $$(stage, ".bl-node").forEach((n, i) => {
        n.classList.toggle("on", i === s.node);
        n.classList.toggle("done", i < s.node);
      });
      $$(stage, "[data-p]").forEach((p) => {
        const i = Number(p.dataset.p);
        p.classList.toggle("dim", i > s.node);
        p.classList.toggle("live", i === s.node);
      });
      $$(stage, ".line").forEach((l, i) => l.classList.toggle("off", i >= s.lines));
      $(stage, "[data-lang]").textContent = s.lines >= 4 ? "HI → EN" : "HI";
      const widths = s.intent ? { browsing: 22, objection: 14, ready: 86 } : { browsing: 0, objection: 0, ready: 0 };
      $$(stage, ".bar").forEach((b) => {
        $(b, "i").style.width = `${widths[b.dataset.b]}%`;
        b.classList.toggle("win", Boolean(s.intent) && b.dataset.b === "ready");
      });
      const intentPill = $(stage, "[data-intent]");
      intentPill.textContent = s.intent ? "purchase-ready" : "listening";
      intentPill.className = `pill${s.intent ? " ok" : ""}`;
      $(stage, "[data-bubble]").style.opacity = s.wa ? "1" : "0";
      const waPill = $(stage, "[data-wa]");
      waPill.textContent = s.wa ? "link sent" : "idle";
      waPill.className = `pill${s.wa ? " ok" : ""}`;
      const fields = s.crm
        ? { stage: "Warm, link sent", intent: "Purchase-ready", lang: "Hindi, English", next: "Order on WhatsApp" }
        : { stage: "Contacted", intent: "Unknown", lang: "Not set", next: "Follow up" };
      Object.entries(fields).forEach(([k, v]) => {
        const el = $(stage, `[data-f="${k}"]`);
        el.textContent = v;
        el.classList.toggle("new", Boolean(s.crm));
      });
      const sync = $(stage, "[data-sync]");
      sync.textContent = s.crm ? "synced" : "pending";
      sync.className = `pill${s.crm ? " ok" : ""}`;
      if (s.note) $(stage, "[data-note]").textContent = s.note;
    },
  };

  const DEMOS = { pagedserve: pagedServe, grpo: grpo, blastr: blastr };
  document.querySelectorAll("[data-demo]").forEach((root) => {
    const def = DEMOS[root.dataset.demo];
    if (def) setupDemo(root, def);
  });
})();
