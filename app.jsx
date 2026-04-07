const { useState, useEffect, useRef, useCallback, useMemo } = React;

// ═══════════════════════════════════════════
// DEFAULTS
// ═══════════════════════════════════════════
const DEFAULT_EXERCISES = [
  { id: "ex1", name: "March in Place", duration: 30, type: "work", icon: "🚶", reps: null, stat: "marchSeconds", restAfter: 30 },
  { id: "ex2", name: "Push-Ups", duration: null, type: "work", icon: "💪", reps: 5, stat: "pushUps", restAfter: 30 },
  { id: "ex3", name: "Squats", duration: null, type: "work", icon: "🦵", reps: 5, stat: "squats", restAfter: 30 },
  { id: "ex4", name: "Sit-Ups", duration: null, type: "work", icon: "🔥", reps: 10, stat: "sitUps", restAfter: 0 },
];
const CONFIRM_SECONDS = 15;
const DAILY_GOAL = 10;
const ICONS = ["🚶","💪","🦵","🔥","🏋️","🧘","🤸","⚡","🎯","💥","🏃","🫁","🥊","🧗","🚴","🏊","🪢","🫀","🦾","🧠","💪","🤾"];

const TIPS = [
  "Hydrate well during your fast — water & black coffee won't break it.",
  "Last meal before fasting: protein + slow carbs like chicken & rice.",
  "Feeling dizzy? Stop, sit down, drink water. Scale down next time.",
  "Week 1–2: try 3 push-ups & 3 squats. Build to 5 by week 3.",
  "Breathe out on the effort — exhale pushing up, inhale going down.",
  "Keep your core tight during push-ups. No sagging hips.",
  "Squats: push knees out over toes, don't let them cave inward.",
  "March with high knees to boost your heart rate faster.",
  "Consistency beats intensity. Show up daily, even if it's light.",
  "Your body adapts in 2–3 weeks. Push through the early phase.",
  "Sleep is when muscles repair. Aim for 7–8 hours per night.",
  "If push-ups are too hard, start on your knees and work up.",
  "Engage your abs during sit-ups — never pull on your neck.",
  "Rest days matter. If you're very sore, take one.",
  "Track your progress — seeing numbers rise is powerful motivation.",
  "Fasting helps your body tap into fat reserves for energy.",
  "Post-workout protein within 30 min optimizes recovery.",
  "The march warms you up before the real work begins.",
  "Good form always beats high reps. Quality over quantity.",
  "Set a daily alarm to remind yourself to start your cycles.",
  "Drink 2 glasses of water before your first meal.",
  "Squats build the biggest muscles in your body — legs are king.",
  "10 cycles a day is beast mode. You can get there.",
  "Your brain quits before your body. Push through the mental wall.",
  "Celebrate small wins — every completed cycle is a victory.",
  "Miss a day? Don't stress. Just get back on track tomorrow.",
  "Sit-ups strengthen your core which supports every other exercise.",
  "Try to march faster each cycle to build cardio endurance.",
  "Avoid sugary foods as your first meal — they spike and crash you.",
  "Stretch after your last cycle to reduce next-day soreness.",
  "Progressive overload: add 1 rep per week to keep growing.",
  "Fasting can sharpen mental clarity and focus in the morning.",
  "Keep your back straight during squats — sit into an invisible chair.",
  "Building a habit takes 21 days. You're investing in future you.",
  "Cold water first thing in the morning kickstarts your metabolism.",
  "Control the negative — lower slowly on push-ups for more gains.",
  "Your rest periods are just as important as your work sets.",
  "Keep your chin tucked during sit-ups to protect your neck.",
  "Don't lock your knees at the top of squats — keep slight bend.",
  "Eating within your window? Prioritize whole foods over processed.",
  "Marching in place burns roughly 4 calories per minute.",
  "Focus on mind-muscle connection — feel each rep working.",
  "Tight schedule? Even 2 cycles is better than zero cycles.",
  "Drink water between cycles — small sips, not large gulps.",
  "Morning workouts fasted can boost fat oxidation by up to 20%.",
  "Your posture improves with every sit-up and squat you complete.",
  "Pair your workout with music — tempo drives performance.",
  "Breathe through your nose during rest to calm your heart rate.",
  "Sore muscles mean growth. Embrace the discomfort.",
  "Every rep is a vote for the person you're becoming.",
  "Black coffee before a fasted workout can improve performance.",
  "Stand tall between sets — slouching restricts your breathing.",
  "End each day reviewing your stats — awareness drives progress.",
  "If you feel nauseous during fasted training, eat a small snack.",
  "Your grip strength matters — squeeze the floor during push-ups.",
];

// ═══════════════════════════════════════════
// SOUND
// ═══════════════════════════════════════════
function useSound() {
  const ctxRef = useRef(null);
  const gc = () => { if (!ctxRef.current || ctxRef.current.state === "closed") ctxRef.current = new (window.AudioContext || window.webkitAudioContext)(); return ctxRef.current; };
  return useCallback((type) => {
    try {
      const ctx = gc(), t = ctx.currentTime;
      const n = (f, tp, v, s, d, fe) => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; o.type = tp;
        g.gain.setValueAtTime(v, t + s); g.gain.exponentialRampToValueAtTime(0.001, t + s + d);
        if (fe) o.frequency.linearRampToValueAtTime(fe, t + s + d);
        o.start(t + s); o.stop(t + s + d);
      };
      if (type === "tick") n(600, "sine", 0.06, 0, 0.04);
      // All countdown beeps same tone
      if (type === "countdown5") { n(880, "square", 0.15, 0, 0.1); }
      if (type === "go") { n(523, "square", 0.18, 0, 0.12); n(659, "square", 0.18, 0.12, 0.12); n(784, "square", 0.22, 0.24, 0.18); n(1047, "sine", 0.15, 0.24, 0.25); }
      if (type === "step_done") { n(660, "triangle", 0.18, 0, 0.1); n(880, "triangle", 0.18, 0.08, 0.15); }
      if (type === "rest_start") { n(440, "sine", 0.12, 0, 0.25, 330); }
      if (type === "cycle_complete") { n(523, "triangle", 0.18, 0, 0.2); n(659, "triangle", 0.18, 0.12, 0.2); n(784, "triangle", 0.2, 0.24, 0.2); n(1047, "sine", 0.22, 0.36, 0.35); }
      if (type === "auto_tick") { n(880, "square", 0.06, 0, 0.05); }
    } catch (e) {}
  }, []);
}

// ═══════════════════════════════════════════
// STORAGE
// ═══════════════════════════════════════════
function todayKey() { return new Date().toISOString().slice(0, 10); }
function weekKeys() { const k = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); k.push(d.toISOString().slice(0, 10)); } return k; }
const EMPTY = { cycles: 0, pushUps: 0, squats: 0, sitUps: 0, marchSeconds: 0 };

function useStats() {
  const [data, setData] = useState({});
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { (async () => { try { const r = await window.storage.get("grind-v4"); if (r?.value) setData(JSON.parse(r.value)); } catch (e) {} setLoaded(true); })(); }, []);
  const save = useCallback(async (d) => { try { await window.storage.set("grind-v4", JSON.stringify(d)); } catch (e) {} }, []);

  const addExerciseStats = useCallback((statKey, amount) => {
    if (!statKey || !amount) return;
    setData(prev => {
      const k = todayKey(), day = { ...(prev[k] || { ...EMPTY }) };
      if (statKey === "marchSeconds") day.marchSeconds += amount;
      else if (statKey === "pushUps") day.pushUps += amount;
      else if (statKey === "squats") day.squats += amount;
      else if (statKey === "sitUps") day.sitUps += amount;
      const u = { ...prev, [k]: day }; save(u); return u;
    });
  }, [save]);

  const addCycle = useCallback(() => {
    setData(prev => {
      const k = todayKey(), day = { ...(prev[k] || { ...EMPTY }) };
      day.cycles += 1;
      const u = { ...prev, [k]: day }; save(u); return u;
    });
  }, [save]);

  const today = data[todayKey()] || { ...EMPTY };
  const weekly = weekKeys().reduce((a, k) => { const d = data[k] || EMPTY; return { cycles: a.cycles + d.cycles, pushUps: a.pushUps + d.pushUps, squats: a.squats + d.squats, sitUps: a.sitUps + d.sitUps, marchSeconds: a.marchSeconds + d.marchSeconds }; }, { ...EMPTY });
  const total = Object.values(data).reduce((a, d) => ({ cycles: a.cycles + d.cycles, pushUps: a.pushUps + d.pushUps, squats: a.squats + d.squats, sitUps: a.sitUps + d.sitUps, marchSeconds: a.marchSeconds + d.marchSeconds }), { ...EMPTY });
  const streak = (() => { let s = 0; const d = new Date(); while (true) { const k = d.toISOString().slice(0, 10); if (data[k]?.cycles > 0) { s++; d.setDate(d.getDate() - 1); } else break; } return s; })();
  const wbd = weekKeys().map(k => ({ key: k, ...(data[k] || EMPTY) }));
  return { today, weekly, total, addExerciseStats, addCycle, loaded, streak, weeklyByDay: wbd };
}

function useExercises() {
  const [ex, setEx] = useState(DEFAULT_EXERCISES);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { (async () => { try { const r = await window.storage.get("grind-exercises-v4"); if (r?.value) setEx(JSON.parse(r.value)); } catch (e) {} setLoaded(true); })(); }, []);
  const save = useCallback(async (e) => { try { await window.storage.set("grind-exercises-v4", JSON.stringify(e)); } catch (e2) {} }, []);
  const update = useCallback((newEx) => { setEx(newEx); save(newEx); }, [save]);
  return { exercises: ex, updateExercises: update, loaded };
}

function useFastConfig() {
  const [cfg, setCfg] = useState({ startHour: 22, startMin: 0, endHour: 11, endMin: 0 });
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { (async () => { try { const r = await window.storage.get("grind-fast-cfg-v4"); if (r?.value) setCfg(JSON.parse(r.value)); } catch (e) {} setLoaded(true); })(); }, []);
  const save = useCallback(async (c) => { try { await window.storage.set("grind-fast-cfg-v4", JSON.stringify(c)); } catch (e) {} }, []);
  const update = useCallback((c) => { setCfg(c); save(c); }, [save]);
  return { cfg, update, loaded };
}

// ═══════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════
function fmt(t) { const h = Math.floor(t / 3600), m = Math.floor((t % 3600) / 60), s = Math.floor(t % 60); return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`; }
function fmtS(t) { const m = Math.floor(t / 60), s = Math.floor(t % 60); return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`; }
function fmtM(sec) { if (sec < 60) return `${sec}s`; const m = Math.floor(sec / 60), s = sec % 60; return s ? `${m}m${s}s` : `${m}m`; }
function to12(h, m) { const ampm = h >= 12 ? "PM" : "AM"; const h12 = h % 12 || 12; return `${h12}:${String(m).padStart(2, "0")} ${ampm}`; }

function getFast(cfg) {
  const startSec = cfg.startHour * 3600 + cfg.startMin * 60;
  const endSec = cfg.endHour * 3600 + cfg.endMin * 60;
  let dur = endSec - startSec; if (dur <= 0) dur += 86400;
  const now = new Date(), ns = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
  let el = ns - startSec; if (el < 0) el += 86400;
  const on = el < dur;
  const rem = on ? dur - el : 0;
  const prog = on ? Math.min(1, el / dur) : 0;
  let next = on ? rem : startSec - ns; if (next < 0) next += 86400;
  const eatDur = 86400 - dur;
  let eatEl = on ? 0 : ns - endSec; if (eatEl < 0) eatEl += 86400;
  const eatProg = on ? 0 : Math.min(1, eatEl / eatDur);
  return { on, rem, prog, next, dur, eatProg };
}

function buildSteps(exercises) {
  const steps = [];
  exercises.forEach((ex, i) => {
    steps.push({ ...ex, _type: "exercise", _exIdx: i });
    if (ex.restAfter > 0 && i < exercises.length - 1) {
      steps.push({ id: `rest_${ex.id}`, name: "Rest", duration: ex.restAfter, type: "rest", icon: "💨", reps: null, stat: null, _type: "rest" });
    }
  });
  return steps;
}

// Day label helper — unique labels for each day
function dayLabel(dateStr) {
  const d = new Date(dateStr + "T12:00:00");
  return ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][d.getDay()];
}

// ═══════════════════════════════════════════
// COMPONENTS
// ═══════════════════════════════════════════
function Ring({ p, size = 170, stroke = 6, color = "#F59E0B", children }) {
  const r = (size - stroke) / 2, c = 2 * Math.PI * r;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.04)" strokeWidth={stroke} />
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c * (1 - p)}
          style={{ transition: "stroke-dashoffset 0.3s ease" }} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>{children}</div>
    </div>
  );
}

function Tag({ label, color = "#F59E0B" }) {
  return <span style={{ fontSize: 9, padding: "2px 8px", borderRadius: 20, letterSpacing: 1.5, fontWeight: 700, background: `${color}18`, color }}>{label}</span>;
}

// ── FASTING ──
function FastingPanel({ cfg, onEdit }) {
  const [s, setS] = useState(() => getFast(cfg));
  const [editing, setEditing] = useState(false);
  const [eStart, setEStart] = useState(`${String(cfg.startHour).padStart(2, "0")}:${String(cfg.startMin).padStart(2, "0")}`);
  const [eEnd, setEEnd] = useState(`${String(cfg.endHour).padStart(2, "0")}:${String(cfg.endMin).padStart(2, "0")}`);

  useEffect(() => { const id = setInterval(() => setS(getFast(cfg)), 1000); return () => clearInterval(id); }, [cfg]);
  useEffect(() => {
    setEStart(`${String(cfg.startHour).padStart(2, "0")}:${String(cfg.startMin).padStart(2, "0")}`);
    setEEnd(`${String(cfg.endHour).padStart(2, "0")}:${String(cfg.endMin).padStart(2, "0")}`);
  }, [cfg]);

  const saveTimes = () => {
    const [sh, sm] = eStart.split(":").map(Number);
    const [eh, em] = eEnd.split(":").map(Number);
    if (!isNaN(sh) && !isNaN(sm) && !isNaN(eh) && !isNaN(em)) onEdit({ startHour: sh, startMin: sm, endHour: eh, endMin: em });
    setEditing(false);
  };

  const col = s.on ? "#EF4444" : "#4ADE80";
  return (
    <div style={S.panel}>
      <div style={S.ph}>
        <span style={S.pt}>Fasting</span>
        <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
          <Tag label={s.on ? "FASTING" : "EATING"} color={col} />
          <button onClick={() => setEditing(!editing)} style={S.editBtn}>{editing ? "Close" : "Edit"}</button>
        </div>
      </div>
      {editing ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 10, padding: "6px 0" }}>
          {[["Start", eStart, setEStart], ["End", eEnd, setEEnd]].map(([l, v, set]) => (
            <div key={l} style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", width: 40 }}>{l}</span>
              <input value={v} onChange={e => set(e.target.value)} type="time" style={S.timeInput} />
            </div>
          ))}
          <button onClick={saveTimes} style={{ ...S.btn, padding: "9px", fontSize: 12 }}>Save Times</button>
        </div>
      ) : (
        <>
          <div style={{ display: "flex", justifyContent: "center", margin: "12px 0" }}>
            <Ring p={s.on ? s.prog : s.eatProg} size={155} color={col}>
              <span style={{ ...S.m, fontSize: 25 }}>{fmt(s.on ? s.rem : s.next)}</span>
              <span style={{ fontSize: 9, color: "rgba(255,255,255,0.28)", marginTop: 3, letterSpacing: 2 }}>{s.on ? "REMAINING" : "UNTIL FAST"}</span>
            </Ring>
          </div>
          <div style={{ display: "flex", justifyContent: "center", gap: 28 }}>
            {[["START", to12(cfg.startHour, cfg.startMin)], ["BREAK", to12(cfg.endHour, cfg.endMin)]].map(([l, t]) => (
              <div key={l} style={{ textAlign: "center" }}>
                <div style={{ fontSize: 9, color: "rgba(255,255,255,0.22)", letterSpacing: 1 }}>{l}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#fff", marginTop: 2 }}>{t}</div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── DAILY GOAL ──
function DailyGoal({ cycles }) {
  const pct = Math.min(1, cycles / DAILY_GOAL);
  const col = cycles >= DAILY_GOAL ? "#4ADE80" : "#F59E0B";
  return (
    <div style={S.panel}>
      <div style={S.ph}><span style={S.pt}>Daily Cycles</span><Tag label={cycles >= DAILY_GOAL ? "COMPLETE" : `${cycles}/${DAILY_GOAL}`} color={col} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
        <Ring p={pct} size={85} stroke={6} color={col}>
          <span style={{ fontSize: 22, fontWeight: 800, color: "#fff" }}>{cycles}</span>
        </Ring>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 4, flex: 1 }}>
          {Array.from({ length: DAILY_GOAL }).map((_, i) => (
            <div key={i} style={{ width: 12, height: 12, borderRadius: 3, transition: "all 0.3s",
              background: i < cycles ? col : "rgba(255,255,255,0.04)", border: i < cycles ? "none" : "1px solid rgba(255,255,255,0.06)" }} />
          ))}
        </div>
      </div>
      <div style={{ marginTop: 12 }}><TipBar /></div>
    </div>
  );
}

// ── EXERCISE CONFIG ──
function ExerciseConfig({ exercises, onSave, onClose }) {
  const [ex, setEx] = useState(JSON.parse(JSON.stringify(exercises)));

  const upd = (i, field, val) => { const n = [...ex]; n[i] = { ...n[i], [field]: val }; setEx(n); };
  const addEx = () => { setEx([...ex, { id: `ex_${Date.now()}`, name: "New Exercise", duration: null, type: "work", icon: "💥", reps: 10, stat: null, restAfter: 30 }]); };
  const removeEx = (i) => { if (ex.length <= 1) return; setEx(ex.filter((_, idx) => idx !== i)); };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginTop: 6 }}>
      {ex.map((e, i) => (
        <div key={e.id} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 10, padding: "12px", border: "1px solid rgba(255,255,255,0.04)" }}>
          <div style={{ display: "flex", gap: 6, marginBottom: 8, alignItems: "center" }}>
            <select value={e.icon} onChange={ev => upd(i, "icon", ev.target.value)} style={{ ...S.selInput, width: 44, textAlign: "center" }}>
              {ICONS.map((ic, idx) => <option key={ic + idx} value={ic}>{ic}</option>)}
            </select>
            <input value={e.name} onChange={ev => upd(i, "name", ev.target.value)} style={{ ...S.textInput, flex: 1 }} placeholder="Name" />
            {ex.length > 1 && <button onClick={() => removeEx(i)} style={{ ...S.tinyBtn, color: "#EF4444", fontSize: 14 }}>×</button>}
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <div style={{ flex: 1 }}>
              <div style={S.fieldLabel}>Type</div>
              <select value={e.duration != null ? "timed" : "reps"} onChange={ev => {
                if (ev.target.value === "timed") { const n = [...ex]; n[i] = { ...n[i], duration: 30, reps: null }; setEx(n); }
                else { const n = [...ex]; n[i] = { ...n[i], duration: null, reps: 10 }; setEx(n); }
              }} style={S.selInput}>
                <option value="timed">Timed</option>
                <option value="reps">Reps</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div style={S.fieldLabel}>{e.duration != null ? "Seconds" : "Reps"}</div>
              <input type="number" value={e.duration != null ? e.duration : e.reps} onChange={ev => {
                const v = parseInt(ev.target.value) || 0;
                if (e.duration != null) upd(i, "duration", v); else upd(i, "reps", v);
              }} style={S.textInput} min={1} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={S.fieldLabel}>Rest (s)</div>
              <input type="number" value={e.restAfter} onChange={ev => upd(i, "restAfter", parseInt(ev.target.value) || 0)} style={S.textInput} min={0} />
            </div>
          </div>
        </div>
      ))}
      <div style={{ display: "flex", gap: 8 }}>
        <button onClick={addEx} style={{ ...S.ghost, flex: 1, marginTop: 0, textAlign: "center" }}>+ Add Exercise</button>
        <button onClick={() => { onSave(ex); onClose(); }} style={{ ...S.btn, flex: 1, padding: "10px" }}>Save</button>
      </div>
    </div>
  );
}

// ── WORKOUT ──
function WorkoutPanel({ exercises, stats, onEditExercises }) {
  const steps = useMemo(() => buildSteps(exercises), [exercises]);
  const [phase, setPhase] = useState("idle"); // idle | config | countdown | active | paused | confirm | done
  const [si, setSi] = useState(0);
  const [timer, setTimer] = useState(0);
  const [cdVal, setCdVal] = useState(3);
  const [confirmTimer, setConfirmTimer] = useState(CONFIRM_SECONDS);
  const [editVal, setEditVal] = useState(null);
  const [showEdit, setShowEdit] = useState(false);
  const [confirmDuration, setConfirmDuration] = useState(CONFIRM_SECONDS);
  const [editingDuration, setEditingDuration] = useState(false);
  const [draftDuration, setDraftDuration] = useState(CONFIRM_SECONDS);
  const iRef = useRef(null);
  const snd = useSound();

  const step = steps[si];
  const timed = step?.duration != null;
  const clr = () => { clearInterval(iRef.current); iRef.current = null; };

  const logCurrentExercise = useCallback((override) => {
    if (!step || step.type === "rest") return;
    const statKey = step.stat;
    if (!statKey) return;
    const amt = override != null ? override : (step.duration != null ? step.duration : step.reps);
    stats.addExerciseStats(statKey, amt);
  }, [step, stats]);

  const goToNext = useCallback(() => {
    clr();
    if (si + 1 >= steps.length) {
      snd("cycle_complete");
      stats.addCycle();
      setPhase("done");
    } else {
      const nx = steps[si + 1];
      snd(nx.type === "rest" ? "rest_start" : "step_done");
      setSi(s => s + 1);
      setTimer(nx.duration ?? 0);
      setPhase("active");
    }
  }, [si, steps, snd, stats]);

  const enterConfirm = useCallback(() => {
    clr();
    setConfirmTimer(confirmDuration);
    setShowEdit(false);
    setEditVal(step?.reps ?? step?.duration ?? 0);
    setPhase("confirm");
  }, [step, confirmDuration]);

  // 3-2-1 countdown
  useEffect(() => {
    if (phase !== "countdown") return; clr(); setCdVal(3); let c = 3; snd("countdown5");
    iRef.current = setInterval(() => {
      c--;
      if (c <= 0) { clr(); snd("go"); setPhase("active"); setSi(0); setTimer(steps[0].duration ?? 0); }
      else { snd("countdown5"); setCdVal(c); }
    }, 1000);
    return clr;
  }, [phase === "countdown"]);

  // Active timer
  useEffect(() => {
    if (phase !== "active" || !timed) return; clr();
    iRef.current = setInterval(() => {
      setTimer(t => {
        if (t <= 6 && t > 1) snd("countdown5");
        if (t <= 1) {
          clr();
          if (step.type === "work") enterConfirm();
          else goToNext();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return clr;
  }, [phase, si, timed, goToNext, enterConfirm, snd, step]);

  // Confirm timer
  useEffect(() => {
    if (phase !== "confirm") return; clr();
    let c = confirmDuration;
    iRef.current = setInterval(() => {
      c--;
      snd("auto_tick");
      if (c <= 0) { clr(); logCurrentExercise(); goToNext(); }
      else setConfirmTimer(c);
    }, 1000);
    return clr;
  }, [phase, confirmDuration]);

  // Rep exercises → confirm
  useEffect(() => {
    if (phase === "active" && step && !timed && step.type === "work") {
      const t = setTimeout(() => enterConfirm(), 300);
      return () => clearTimeout(t);
    }
  }, [phase, si, timed]);

  const start = () => setPhase("countdown");
  const pause = () => { clr(); setPhase("paused"); };
  const resume = () => setPhase("active");
  const stop = () => { clr(); setPhase("idle"); setSi(0); setTimer(0); };
  const confirmComplete = () => { clr(); logCurrentExercise(); goToNext(); };
  const confirmEditSave = () => { clr(); logCurrentExercise(parseInt(editVal) || 0); goToNext(); };
  const reset = () => { setPhase("idle"); setSi(0); setTimer(0); };

  // ── CONFIG ──
  if (phase === "config") return (
    <div style={S.panel}>
      <div style={S.ph}><span style={S.pt}>Edit Exercises</span><button onClick={() => setPhase("idle")} style={S.editBtn}>Close</button></div>
      <ExerciseConfig exercises={exercises} onSave={onEditExercises} onClose={() => setPhase("idle")} />
    </div>
  );

  // ── COUNTDOWN ──
  if (phase === "countdown") return (
    <div style={S.panel}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "30px 0" }}>
        <span style={{ fontSize: 60, fontWeight: 800, color: "#F59E0B" }}>{cdVal}</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", letterSpacing: 3, marginTop: 6 }}>GET READY</span>
      </div>
    </div>
  );

  // ── IDLE ──
  if (phase === "idle") return (
    <div style={S.panel}>
      <div style={S.ph}>
        <span style={S.pt}>Workout</span>
        <button onClick={() => setPhase("config")} style={S.editBtn}>Edit</button>
      </div>
      <button onClick={start} style={{ ...S.btn, marginBottom: 12 }}>▶ Start Workout</button>
      <div style={{ padding: "2px 0 0" }}>
        {steps.map((s, i) => (
          <div key={s.id + i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "7px 0",
            borderBottom: i < steps.length - 1 ? "1px solid rgba(255,255,255,0.03)" : "none" }}>
            <span style={{ fontSize: 16, width: 24, textAlign: "center" }}>{s.icon}</span>
            <span style={{ flex: 1, fontSize: 12, color: s.type === "rest" ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.65)" }}>{s.name}</span>
            <span style={{ ...S.m, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{s.reps ? `×${s.reps}` : `${s.duration}s`}</span>
          </div>
        ))}
      </div>
    </div>
  );

  // ── DONE ──
  if (phase === "done") return (
    <div style={S.panel}>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "24px 0" }}>
        <span style={{ fontSize: 44 }}>🔥</span>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginTop: 8 }}>Cycle Complete!</span>
        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.28)", marginTop: 4 }}>Keep stacking cycles.</span>
        <div style={{ display: "flex", gap: 8, marginTop: 18 }}>
          <button onClick={start} style={{ ...S.btn, padding: "10px 22px", width: "auto" }}>▶ Next Cycle</button>
          <button onClick={reset} style={{ ...S.ghost, marginTop: 0, padding: "10px 16px" }}>Done</button>
        </div>
      </div>
    </div>
  );

  // ── CONFIRM / EDIT ──
  if (phase === "confirm") {
    const pct = confirmTimer / confirmDuration;
    const saveNewDuration = () => {
      const parsed = parseInt(draftDuration, 10);
      const newDur = Math.max(5, isNaN(parsed) ? CONFIRM_SECONDS : parsed);
      setConfirmDuration(newDur);
      setConfirmTimer(newDur);
      setEditingDuration(false);
    };
    return (
      <div style={S.panel}>
        <div style={S.ph}>
          <span style={S.pt}>Exercise Done?</span>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <div style={{ width: 50, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
              <div style={{ width: `${pct * 100}%`, height: "100%", background: confirmTimer <= 4 ? "#EF4444" : "#F59E0B", transition: "width 0.3s", borderRadius: 2 }} />
            </div>
            {editingDuration ? (
              <input
                type="number"
                value={draftDuration}
                onChange={e => setDraftDuration(e.target.value)}
                onBlur={saveNewDuration}
                onKeyDown={e => { if (e.key === "Enter") saveNewDuration(); if (e.key === "Escape") { setDraftDuration(confirmDuration); setEditingDuration(false); } }}
                style={{ ...S.m, fontSize: 13, width: 44, background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.2)", borderRadius: 4, color: "#F59E0B", outline: "none", textAlign: "center", padding: "1px 3px" }}
                autoFocus
                min={5}
              />
            ) : (
              <span
                onClick={() => { setDraftDuration(confirmDuration); setEditingDuration(true); }}
                style={{ ...S.m, fontSize: 13, color: confirmTimer <= 4 ? "#EF4444" : "#F59E0B", cursor: "pointer", textDecoration: "underline dotted" }}
                title="Click to edit duration"
              >{confirmTimer}s</span>
            )}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: "6px 0" }}>
          <span style={{ fontSize: 34 }}>{step.icon}</span>
          <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginTop: 6 }}>{step.name}</span>
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
            {step.reps ? `${step.reps} reps` : `${step.duration}s`}
          </span>

          {showEdit ? (
            <div style={{ display: "flex", gap: 8, marginTop: 14, alignItems: "center" }}>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Actual:</span>
              <input type="number" value={editVal} onChange={e => setEditVal(e.target.value)}
                style={{ ...S.textInput, width: 60, textAlign: "center", fontSize: 16, fontWeight: 700 }} min={0} />
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)" }}>{step.reps ? "reps" : "sec"}</span>
              <button onClick={confirmEditSave} style={{ ...S.btn, width: "auto", padding: "8px 16px", fontSize: 12 }}>Save</button>
            </div>
          ) : (
            <div style={{ display: "flex", gap: 8, marginTop: 14, width: "100%" }}>
              <button onClick={confirmComplete} style={{ ...S.btn, flex: 1 }}>✓ Complete</button>
              <button onClick={() => { clr(); setShowEdit(true); }} style={{ ...S.btn2, flex: 1 }}>✏ Edit</button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── ACTIVE / PAUSED ──
  const rc = step.type === "rest" ? "#818CF8" : "#F59E0B";
  const rp = timed && step.duration ? (step.duration - timer) / step.duration : 0;
  const nextStep = steps[si + 1];
  return (
    <div style={S.panel}>
      <div style={S.ph}><span style={S.pt}>Workout</span><span style={{ ...S.m, fontSize: 10, color: "rgba(255,255,255,0.2)" }}>{si + 1}/{steps.length}</span></div>
      <div style={{ display: "flex", gap: 2, marginBottom: 16 }}>
        {steps.map((_, i) => (
          <div key={i} style={{ flex: 1, height: 3, borderRadius: 2, background: i < si ? rc : i === si ? `${rc}55` : "rgba(255,255,255,0.04)" }} />
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <Ring p={rp} size={150} color={rc}>
          <span style={{ fontSize: 28 }}>{step.icon}</span>
          <span style={{ ...S.m, fontSize: 26, color: "#fff", marginTop: 2 }}>{fmtS(timer)}</span>
        </Ring>
        <span style={{ fontSize: 15, fontWeight: 600, color: "#fff", marginTop: 10 }}>{step.name}</span>
        <Tag label={step.type === "rest" ? "REST" : "WORK"} color={rc} />
        {step.type === "rest" && nextStep && (
          <div style={{ marginTop: 10, padding: "8px 14px", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", letterSpacing: 1, textTransform: "uppercase" }}>Up next</span>
            <span style={{ fontSize: 14 }}>{nextStep.icon}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", fontWeight: 600 }}>{nextStep.name}</span>
            <span style={{ ...S.m, fontSize: 10, color: "rgba(255,255,255,0.25)" }}>{nextStep.reps ? `×${nextStep.reps}` : `${nextStep.duration}s`}</span>
          </div>
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 14, width: "100%" }}>
          {phase === "active" && <button onClick={pause} style={{ ...S.btn2, flex: 1 }}>⏸ Pause</button>}
          {phase === "paused" && <button onClick={resume} style={{ ...S.btn, flex: 1 }}>▶ Resume</button>}
          {step.type === "rest" && <button onClick={goToNext} style={{ ...S.btn, flex: 1 }}>⏭ Skip Rest</button>}
          <button onClick={stop} style={{ ...S.ghost, flex: 0, marginTop: 0, padding: "10px 14px" }}>⏹</button>
        </div>
      </div>
    </div>
  );
}

// ── STAT ROW ──
function StatRow({ label, data, exercises, color = "#F59E0B" }) {
  const statItems = useMemo(() => {
    const items = [{ icon: "🔁", val: data.cycles, lab: "Cycles" }];
    const seen = new Set();
    exercises.forEach(ex => {
      if (!ex.stat || seen.has(ex.stat)) return;
      seen.add(ex.stat);
      if (ex.stat === "marchSeconds") items.push({ icon: ex.icon, val: fmtM(data.marchSeconds), lab: ex.name });
      else if (ex.stat === "pushUps") items.push({ icon: ex.icon, val: data.pushUps, lab: ex.name });
      else if (ex.stat === "squats") items.push({ icon: ex.icon, val: data.squats, lab: ex.name });
      else if (ex.stat === "sitUps") items.push({ icon: ex.icon, val: data.sitUps, lab: ex.name });
    });
    return items;
  }, [data, exercises]);

  return (
    <div>
      <div style={{ fontSize: 10, letterSpacing: 1.5, color, fontWeight: 700, marginBottom: 6, textTransform: "uppercase" }}>{label}</div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${Math.min(statItems.length, 5)}, 1fr)`, gap: 4 }}>
        {statItems.map((s, i) => (
          <div key={i} style={{ background: "rgba(255,255,255,0.02)", borderRadius: 6, padding: "8px 4px", textAlign: "center" }}>
            <div style={{ fontSize: 14 }}>{s.icon}</div>
            <div style={{ ...S.m, fontSize: 13, color: "#fff", marginTop: 2 }}>{s.val}</div>
            <div style={{ fontSize: 7, color: "rgba(255,255,255,0.22)", letterSpacing: 0.5, marginTop: 1, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{s.lab}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WeekChart({ wbd }) {
  const mx = Math.max(1, ...wbd.map(d => d.cycles));
  return (
    <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 4, height: 52, marginTop: 8 }}>
      {wbd.map(d => {
        const h = Math.max(3, (d.cycles / mx) * 38);
        const it = d.key === todayKey();
        const lbl = dayLabel(d.key);
        return (
          <div key={d.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: 1 }}>
            <span style={{ ...S.m, fontSize: 7, color: "rgba(255,255,255,0.2)", marginBottom: 2 }}>{d.cycles || ""}</span>
            <div style={{ width: "100%", maxWidth: 18, height: h, borderRadius: 3, background: it ? "#F59E0B" : d.cycles > 0 ? "rgba(245,158,11,0.25)" : "rgba(255,255,255,0.02)" }} />
            <span style={{ fontSize: 8, color: it ? "#F59E0B" : "rgba(255,255,255,0.18)", marginTop: 2, fontWeight: it ? 700 : 400 }}>{lbl}</span>
          </div>
        );
      })}
    </div>
  );
}

function AllStats({ stats, exercises }) {
  return (
    <div style={S.panel}>
      <div style={S.ph}><span style={S.pt}>Progress</span><span style={{ ...S.m, fontSize: 10, color: "#F59E0B" }}>{stats.streak}d streak</span></div>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <StatRow label="Today" data={stats.today} exercises={exercises} color="#F59E0B" />
        <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
        <StatRow label="This Week" data={stats.weekly} exercises={exercises} color="#818CF8" />
        <WeekChart wbd={stats.weeklyByDay} />
        <div style={{ height: 1, background: "rgba(255,255,255,0.04)" }} />
        <StatRow label="All Time" data={stats.total} exercises={exercises} color="#4ADE80" />
      </div>
    </div>
  );
}

// ── TIPS ──
function TipBar() {
  const [i, setI] = useState(() => Math.floor(Math.random() * TIPS.length));
  useEffect(() => { const id = setInterval(() => setI(x => (x + 1) % TIPS.length), 7000); return () => clearInterval(id); }, []);
  return (
    <div style={{ background: "rgba(245,158,11,0.03)", border: "1px solid rgba(245,158,11,0.07)", borderRadius: 10, padding: "10px 14px", display: "flex", gap: 8 }}>
      <span style={{ fontSize: 13, flexShrink: 0 }}>💡</span>
      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: 0, lineHeight: 1.45 }}>{TIPS[i]}</p>
    </div>
  );
}

// ═══════════════════════════════════════════
// APP
// ═══════════════════════════════════════════
function App() {
  const stats = useStats();
  const { exercises, updateExercises, loaded: exLoaded } = useExercises();
  const { cfg, update: updateCfg, loaded: cfgLoaded } = useFastConfig();

  if (!stats.loaded || !exLoaded || !cfgLoaded) return (
    <div style={{ ...S.app, display: "flex", alignItems: "center", justifyContent: "center", minHeight: "100vh" }}>
      <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 13 }}>Loading...</span>
    </div>
  );

  return (
    <div style={S.app}>
      <link href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;600;700&family=Outfit:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
      <div style={S.wrap}>
        <header style={{ textAlign: "center", padding: "2px 0 4px" }}>
          <div style={{ fontSize: 22, fontWeight: 800, color: "#fff", letterSpacing: -0.5 }}>🔥 GRIND</div>
          <div style={{ fontSize: 8, color: "rgba(255,255,255,0.15)", letterSpacing: 3, marginTop: 1 }}>FAST · TRAIN · REPEAT</div>
        </header>
        <FastingPanel cfg={cfg} onEdit={updateCfg} />
        <DailyGoal cycles={stats.today.cycles} />
        <WorkoutPanel exercises={exercises} stats={stats} onEditExercises={updateExercises} />
        <AllStats stats={stats} exercises={exercises} />
      </div>
      <style>{`*{box-sizing:border-box;margin:0}button:active{transform:scale(0.97)}input[type=time]::-webkit-calendar-picker-indicator{filter:invert(0.6)}select,select option{background:#1a1a1c!important;color:#fff!important}select option:checked{background:#2a2a2e!important}`}</style>
    </div>
  );
}

const S = {
  app: { minHeight: "100vh", background: "#0A0A0B", fontFamily: "'Outfit',sans-serif", color: "#fff", colorScheme: "dark" },
  wrap: { maxWidth: 420, margin: "0 auto", padding: "16px 12px 40px", display: "flex", flexDirection: "column", gap: 12 },
  panel: { background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.04)", borderRadius: 12, padding: "14px 16px 16px" },
  ph: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  pt: { fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", fontWeight: 600, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "4px 10px", background: "rgba(255,255,255,0.03)" },
  m: { fontFamily: "'JetBrains Mono',monospace", fontWeight: 600 },
  btn: { width: "100%", padding: "11px", border: "none", borderRadius: 8, background: "linear-gradient(135deg,#F59E0B,#D97706)", color: "#000", fontSize: 13, fontWeight: 700, fontFamily: "'Outfit',sans-serif", cursor: "pointer", letterSpacing: 0.5 },
  btn2: { width: "100%", padding: "11px", border: "1px solid rgba(129,140,248,0.15)", borderRadius: 8, background: "rgba(129,140,248,0.06)", color: "#818CF8", fontSize: 13, fontWeight: 600, fontFamily: "'Outfit',sans-serif", cursor: "pointer" },
  ghost: { padding: "9px 12px", border: "1px solid rgba(255,255,255,0.05)", borderRadius: 7, background: "transparent", color: "rgba(255,255,255,0.25)", fontSize: 11, fontFamily: "'Outfit',sans-serif", cursor: "pointer", marginTop: 8 },
  editBtn: { background: "rgba(245,158,11,0.1)", border: "1px solid rgba(245,158,11,0.25)", borderRadius: 6, padding: "3px 10px", fontSize: 10, color: "#F59E0B", cursor: "pointer", fontFamily: "'Outfit',sans-serif", letterSpacing: 0.5, fontWeight: 600 },
  tinyBtn: { background: "none", border: "none", fontSize: 14, cursor: "pointer", color: "rgba(255,255,255,0.4)", padding: "4px" },
  textInput: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "7px 8px", color: "#fff", fontSize: 12, fontFamily: "'Outfit',sans-serif", outline: "none", width: "100%" },
  selInput: { background: "#1a1a1c", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "7px 6px", color: "#fff", fontSize: 12, fontFamily: "'Outfit',sans-serif", outline: "none", colorScheme: "dark" },
  timeInput: { background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 6, padding: "7px 10px", color: "#fff", fontSize: 13, fontFamily: "'JetBrains Mono',monospace", outline: "none", flex: 1 },
  fieldLabel: { fontSize: 9, color: "rgba(255,255,255,0.25)", letterSpacing: 1, marginBottom: 3, textTransform: "uppercase" },
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
