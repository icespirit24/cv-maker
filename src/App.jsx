import { useState, useEffect, useRef, useCallback } from "react";
import { Plus, Trash2, ChevronUp, ChevronDown, Printer, RotateCcw } from "lucide-react";

const STORAGE_KEY = "cv-maker-data-v1";
const uid = () => Math.random().toString(36).slice(2, 10);

const TEMPLATES = [
  { id: "classic", label: "Classic" },
  { id: "modern", label: "Modern" },
  { id: "minimal", label: "Minimal" },
];

const SECTION_KINDS = [
  { kind: "summary", label: "Summary" },
  { kind: "experience", label: "Experience" },
  { kind: "education", label: "Education" },
  { kind: "skills", label: "Skills" },
  { kind: "custom", label: "Custom section" },
];

function defaultDataForKind(kind) {
  switch (kind) {
    case "summary":
      return { text: "" };
    case "experience":
      return { entries: [emptyExperienceEntry()] };
    case "education":
      return { entries: [emptyEducationEntry()] };
    case "skills":
      return { text: "" };
    case "custom":
    default:
      return { text: "" };
  }
}

function emptyExperienceEntry() {
  return { id: uid(), role: "", company: "", location: "", dates: "", bullets: "" };
}
function emptyEducationEntry() {
  return { id: uid(), school: "", degree: "", location: "", dates: "", details: "" };
}

function sampleData() {
  return {
    templateId: "classic",
    contact: {
      name: "Alex Rivera",
      title: "Product Designer",
      email: "alex.rivera@email.com",
      phone: "(555) 012-3456",
      location: "Portland, OR",
      links: "alexrivera.design",
    },
    sections: [
      {
        id: uid(),
        kind: "summary",
        title: "Summary",
        data: {
          text: "Product designer with 6 years of experience shipping consumer apps used by millions. I focus on turning ambiguous problems into clear, testable design decisions.",
        },
      },
      {
        id: uid(),
        kind: "experience",
        title: "Experience",
        data: {
          entries: [
            {
              id: uid(),
              role: "Senior Product Designer",
              company: "Northwind Software",
              location: "Portland, OR",
              dates: "2022 — Present",
              bullets:
                "Led redesign of the onboarding flow, reducing drop-off by 24%\nPartnered with engineering to ship a design system used across 5 product teams\nMentored two junior designers through their first ship cycles",
            },
            {
              id: uid(),
              role: "Product Designer",
              company: "Fielder Labs",
              location: "Seattle, WA",
              dates: "2019 — 2022",
              bullets:
                "Designed and shipped the mobile checkout flow, cutting cart abandonment by 15%\nRan quarterly usability studies with 40+ participants",
            },
          ],
        },
      },
      {
        id: uid(),
        kind: "education",
        title: "Education",
        data: {
          entries: [
            {
              id: uid(),
              school: "University of Washington",
              degree: "B.A. in Human-Centered Design",
              location: "Seattle, WA",
              dates: "2015 — 2019",
              details: "",
            },
          ],
        },
      },
      {
        id: uid(),
        kind: "skills",
        title: "Skills",
        data: { text: "Figma, Prototyping, Design Systems, User Research, HTML/CSS, Accessibility" },
      },
    ],
  };
}

function blankData() {
  const d = sampleData();
  d.contact = { name: "", title: "", email: "", phone: "", location: "", links: "" };
  d.sections.forEach((s) => {
    if (s.kind === "experience") s.data = { entries: [emptyExperienceEntry()] };
    if (s.kind === "education") s.data = { entries: [emptyEducationEntry()] };
    if (s.kind === "summary" || s.kind === "skills") s.data = { text: "" };
  });
  return d;
}

// ---------- Small UI atoms ----------

function Field({ label, ...props }) {
  return (
    <label className="cvm-field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}

function TextArea({ label, ...props }) {
  return (
    <label className="cvm-field">
      <span>{label}</span>
      <textarea {...props} />
    </label>
  );
}

function IconButton({ onClick, title, disabled, children }) {
  return (
    <button
      type="button"
      className="cvm-icon-btn"
      onClick={onClick}
      disabled={disabled}
      title={title}
      aria-label={title}
    >
      {children}
    </button>
  );
}

// ---------- Editor: per-kind bodies ----------

function SummaryEditor({ section, onChange }) {
  return (
    <TextArea
      label="Summary text"
      rows={4}
      value={section.data.text}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="A two to three sentence pitch of who you are and what you're looking for."
    />
  );
}

function SkillsEditor({ section, onChange }) {
  return (
    <TextArea
      label="Skills (comma separated)"
      rows={2}
      value={section.data.text}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="Figma, SQL, Public speaking, ..."
    />
  );
}

function CustomEditor({ section, onChange }) {
  return (
    <TextArea
      label="Content (one line per bullet)"
      rows={4}
      value={section.data.text}
      onChange={(e) => onChange({ text: e.target.value })}
      placeholder="Add free-form text, or one bullet per line."
    />
  );
}

function ExperienceEditor({ section, onChange }) {
  const entries = section.data.entries;
  const updateEntry = (id, patch) =>
    onChange({ entries: entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const addEntry = () => onChange({ entries: [...entries, emptyExperienceEntry()] });
  const removeEntry = (id) => onChange({ entries: entries.filter((e) => e.id !== id) });

  return (
    <div className="cvm-entries">
      {entries.map((entry, i) => (
        <div className="cvm-entry" key={entry.id}>
          <div className="cvm-entry-head">
            <span className="cvm-entry-index">Role {i + 1}</span>
            <IconButton title="Remove role" onClick={() => removeEntry(entry.id)} disabled={entries.length === 1}>
              <Trash2 size={14} />
            </IconButton>
          </div>
          <div className="cvm-grid-2">
            <Field label="Title" value={entry.role} onChange={(e) => updateEntry(entry.id, { role: e.target.value })} />
            <Field label="Company" value={entry.company} onChange={(e) => updateEntry(entry.id, { company: e.target.value })} />
            <Field label="Location" value={entry.location} onChange={(e) => updateEntry(entry.id, { location: e.target.value })} />
            <Field label="Dates" value={entry.dates} onChange={(e) => updateEntry(entry.id, { dates: e.target.value })} placeholder="2022 — Present" />
          </div>
          <TextArea
            label="Highlights (one per line)"
            rows={3}
            value={entry.bullets}
            onChange={(e) => updateEntry(entry.id, { bullets: e.target.value })}
          />
        </div>
      ))}
      <button type="button" className="cvm-add-entry" onClick={addEntry}>
        <Plus size={14} /> Add role
      </button>
    </div>
  );
}

function EducationEditor({ section, onChange }) {
  const entries = section.data.entries;
  const updateEntry = (id, patch) =>
    onChange({ entries: entries.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  const addEntry = () => onChange({ entries: [...entries, emptyEducationEntry()] });
  const removeEntry = (id) => onChange({ entries: entries.filter((e) => e.id !== id) });

  return (
    <div className="cvm-entries">
      {entries.map((entry, i) => (
        <div className="cvm-entry" key={entry.id}>
          <div className="cvm-entry-head">
            <span className="cvm-entry-index">School {i + 1}</span>
            <IconButton title="Remove school" onClick={() => removeEntry(entry.id)} disabled={entries.length === 1}>
              <Trash2 size={14} />
            </IconButton>
          </div>
          <div className="cvm-grid-2">
            <Field label="School" value={entry.school} onChange={(e) => updateEntry(entry.id, { school: e.target.value })} />
            <Field label="Degree" value={entry.degree} onChange={(e) => updateEntry(entry.id, { degree: e.target.value })} />
            <Field label="Location" value={entry.location} onChange={(e) => updateEntry(entry.id, { location: e.target.value })} />
            <Field label="Dates" value={entry.dates} onChange={(e) => updateEntry(entry.id, { dates: e.target.value })} placeholder="2015 — 2019" />
          </div>
          <Field label="Details (optional)" value={entry.details} onChange={(e) => updateEntry(entry.id, { details: e.target.value })} />
        </div>
      ))}
      <button type="button" className="cvm-add-entry" onClick={addEntry}>
        <Plus size={14} /> Add school
      </button>
    </div>
  );
}

const KIND_EDITORS = {
  summary: SummaryEditor,
  experience: ExperienceEditor,
  education: EducationEditor,
  skills: SkillsEditor,
  custom: CustomEditor,
};

// ---------- Preview renderers ----------

function bulletsToList(text) {
  return text
    .split("\n")
    .map((s) => s.trim())
    .filter(Boolean);
}

function SectionHeading({ children }) {
  return <h2 className="cvm-p-heading">{children}</h2>;
}

function PreviewSection({ section }) {
  const { kind, title, data } = section;
  if (kind === "summary") {
    if (!data.text.trim()) return null;
    return (
      <section className="cvm-p-section">
        <SectionHeading>{title}</SectionHeading>
        <p className="cvm-p-summary">{data.text}</p>
      </section>
    );
  }
  if (kind === "skills") {
    if (!data.text.trim()) return null;
    const items = data.text.split(",").map((s) => s.trim()).filter(Boolean);
    return (
      <section className="cvm-p-section">
        <SectionHeading>{title}</SectionHeading>
        <ul className="cvm-p-skills">
          {items.map((s, i) => (
            <li key={i}>{s}</li>
          ))}
        </ul>
      </section>
    );
  }
  if (kind === "custom") {
    if (!data.text.trim()) return null;
    const lines = bulletsToList(data.text);
    return (
      <section className="cvm-p-section">
        <SectionHeading>{title}</SectionHeading>
        {lines.length > 1 ? (
          <ul className="cvm-p-bullets">
            {lines.map((l, i) => (
              <li key={i}>{l}</li>
            ))}
          </ul>
        ) : (
          <p className="cvm-p-summary">{data.text}</p>
        )}
      </section>
    );
  }
  if (kind === "experience") {
    const entries = data.entries.filter((e) => e.role || e.company || e.bullets);
    if (entries.length === 0) return null;
    return (
      <section className="cvm-p-section">
        <SectionHeading>{title}</SectionHeading>
        {entries.map((e) => (
          <div className="cvm-p-item" key={e.id}>
            <div className="cvm-p-item-row">
              <span className="cvm-p-item-title">
                {e.role}
                {e.company ? <span className="cvm-p-item-org"> · {e.company}</span> : null}
              </span>
              <span className="cvm-p-item-dates">{e.dates}</span>
            </div>
            {e.location && <div className="cvm-p-item-sub">{e.location}</div>}
            {e.bullets.trim() && (
              <ul className="cvm-p-bullets">
                {bulletsToList(e.bullets).map((b, i) => (
                  <li key={i}>{b}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>
    );
  }
  if (kind === "education") {
    const entries = data.entries.filter((e) => e.school || e.degree);
    if (entries.length === 0) return null;
    return (
      <section className="cvm-p-section">
        <SectionHeading>{title}</SectionHeading>
        {entries.map((e) => (
          <div className="cvm-p-item" key={e.id}>
            <div className="cvm-p-item-row">
              <span className="cvm-p-item-title">{e.school}</span>
              <span className="cvm-p-item-dates">{e.dates}</span>
            </div>
            {(e.degree || e.location) && (
              <div className="cvm-p-item-sub">
                {e.degree}
                {e.degree && e.location ? " · " : ""}
                {e.location}
              </div>
            )}
            {e.details && <p className="cvm-p-summary">{e.details}</p>}
          </div>
        ))}
      </section>
    );
  }
  return null;
}

function ResumePaper({ data }) {
  const { contact, sections, templateId } = data;
  const contactLine = [contact.email, contact.phone, contact.location, contact.links]
    .filter(Boolean)
    .join("   ·   ");
  return (
    <div className={`cvm-paper cvm-tpl-${templateId}`}>
      <header className="cvm-p-header">
        <h1 className="cvm-p-name">{contact.name || "Your name"}</h1>
        {contact.title && <div className="cvm-p-title">{contact.title}</div>}
        {contactLine && <div className="cvm-p-contact">{contactLine}</div>}
      </header>
      {sections.map((s) => (
        <PreviewSection section={s} key={s.id} />
      ))}
    </div>
  );
}

// ---------- Main App ----------

export default function App() {
  const [data, setData] = useState(null);
  const [saveState, setSaveState] = useState("idle"); // idle | saving | saved
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const saveTimer = useRef(null);
  const firstLoad = useRef(true);

  // Load persisted data on mount (browser localStorage)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setData(raw ? JSON.parse(raw) : sampleData());
    } catch {
      setData(sampleData());
    }
  }, []);

  // Debounced autosave to localStorage
  useEffect(() => {
    if (!data) return;
    if (firstLoad.current) {
      firstLoad.current = false;
      return;
    }
    setSaveState("saving");
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        setSaveState("saved");
      } catch {
        setSaveState("idle");
      }
    }, 600);
    return () => clearTimeout(saveTimer.current);
  }, [data]);

  const updateContact = useCallback((field, value) => {
    setData((d) => ({ ...d, contact: { ...d.contact, [field]: value } }));
  }, []);

  const updateSectionData = useCallback((id, patch) => {
    setData((d) => ({
      ...d,
      sections: d.sections.map((s) => (s.id === id ? { ...s, data: { ...s.data, ...patch } } : s)),
    }));
  }, []);

  const updateSectionTitle = useCallback((id, title) => {
    setData((d) => ({ ...d, sections: d.sections.map((s) => (s.id === id ? { ...s, title } : s)) }));
  }, []);

  const moveSection = useCallback((id, dir) => {
    setData((d) => {
      const idx = d.sections.findIndex((s) => s.id === id);
      const swap = idx + dir;
      if (swap < 0 || swap >= d.sections.length) return d;
      const next = [...d.sections];
      [next[idx], next[swap]] = [next[swap], next[idx]];
      return { ...d, sections: next };
    });
  }, []);

  const removeSection = useCallback((id) => {
    setData((d) => ({ ...d, sections: d.sections.filter((s) => s.id !== id) }));
  }, []);

  const addSection = useCallback((kind) => {
    const label = SECTION_KINDS.find((k) => k.kind === kind)?.label ?? "Section";
    setData((d) => ({
      ...d,
      sections: [...d.sections, { id: uid(), kind, title: label, data: defaultDataForKind(kind) }],
    }));
    setAddMenuOpen(false);
  }, []);

  const setTemplate = useCallback((templateId) => {
    setData((d) => ({ ...d, templateId }));
  }, []);

  const resetAll = useCallback(() => {
    if (!window.confirm("Clear everything and start over? This can't be undone.")) return;
    const fresh = blankData();
    setData(fresh);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch {
      /* ignore */
    }
  }, []);

  if (!data) {
    return (
      <div className="cvm-app cvm-loading">
        <style>{STYLES}</style>
        <span>Loading your resume…</span>
      </div>
    );
  }

  return (
    <div className="cvm-app">
      <style>{STYLES}</style>

      <header className="cvm-header">
        <div className="cvm-brand">CV Maker</div>
        <div className="cvm-header-actions">
          <span className="cvm-save-state">
            {saveState === "saving" ? "Saving…" : saveState === "saved" ? "Saved" : ""}
          </span>
          <button type="button" className="cvm-ghost-btn" onClick={resetAll}>
            <RotateCcw size={14} /> Start over
          </button>
          <button type="button" className="cvm-primary-btn" onClick={() => window.print()}>
            <Printer size={14} /> Export PDF
          </button>
        </div>
      </header>

      <div className="cvm-app-body">
        <div className="cvm-editor-panel">
          <div className="cvm-block">
            <h3 className="cvm-block-title">Contact</h3>
            <div className="cvm-grid-2">
              <Field label="Full name" value={data.contact.name} onChange={(e) => updateContact("name", e.target.value)} />
              <Field label="Headline" value={data.contact.title} onChange={(e) => updateContact("title", e.target.value)} placeholder="Product Designer" />
              <Field label="Email" value={data.contact.email} onChange={(e) => updateContact("email", e.target.value)} />
              <Field label="Phone" value={data.contact.phone} onChange={(e) => updateContact("phone", e.target.value)} />
              <Field label="Location" value={data.contact.location} onChange={(e) => updateContact("location", e.target.value)} />
              <Field label="Website / links" value={data.contact.links} onChange={(e) => updateContact("links", e.target.value)} />
            </div>
          </div>

          {data.sections.map((section, i) => {
            const Editor = KIND_EDITORS[section.kind];
            return (
              <div className="cvm-block" key={section.id}>
                <div className="cvm-block-head">
                  <input
                    className="cvm-section-title-input"
                    value={section.title}
                    onChange={(e) => updateSectionTitle(section.id, e.target.value)}
                    aria-label="Section title"
                  />
                  <div className="cvm-block-controls">
                    <IconButton title="Move up" onClick={() => moveSection(section.id, -1)} disabled={i === 0}>
                      <ChevronUp size={14} />
                    </IconButton>
                    <IconButton title="Move down" onClick={() => moveSection(section.id, 1)} disabled={i === data.sections.length - 1}>
                      <ChevronDown size={14} />
                    </IconButton>
                    <IconButton title="Delete section" onClick={() => removeSection(section.id)}>
                      <Trash2 size={14} />
                    </IconButton>
                  </div>
                </div>
                {Editor && <Editor section={section} onChange={(patch) => updateSectionData(section.id, patch)} />}
              </div>
            );
          })}

          <div className="cvm-add-section">
            <button type="button" className="cvm-ghost-btn cvm-add-section-btn" onClick={() => setAddMenuOpen((v) => !v)}>
              <Plus size={14} /> Add section
            </button>
            {addMenuOpen && (
              <div className="cvm-add-menu">
                {SECTION_KINDS.map((k) => (
                  <button type="button" key={k.kind} onClick={() => addSection(k.kind)}>
                    {k.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="cvm-preview-panel">
          <div className="cvm-preview-toolbar">
            {TEMPLATES.map((t) => (
              <button
                type="button"
                key={t.id}
                className={`cvm-tpl-chip ${data.templateId === t.id ? "is-active" : ""}`}
                onClick={() => setTemplate(t.id)}
              >
                {t.label}
              </button>
            ))}
          </div>
          <div className="cvm-paper-scroll">
            <ResumePaper data={data} />
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------- Styles ----------

const STYLES = `
@import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700&family=Inter:wght@400;500;600;700&display=swap');

.cvm-app {
  --bg: #14171c;
  --panel: #1b1f26;
  --panel-alt: #20242c;
  --border: #2e333c;
  --text: #e9e7e1;
  --text-muted: #8d8f96;
  --accent: #c08a2e;
  --accent-hover: #d69b3b;
  --paper: #ffffff;
  --ink: #1b2230;
  --ink-muted: #5b6270;

  font-family: 'Inter', system-ui, sans-serif;
  color: var(--text);
  background: var(--bg);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.cvm-app *, .cvm-app *::before, .cvm-app *::after { box-sizing: border-box; }
.cvm-app :focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

.cvm-loading { align-items: center; justify-content: center; color: var(--text-muted); font-size: 15px; }

.cvm-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
  background: var(--panel);
}
.cvm-brand {
  font-family: 'Source Serif 4', serif;
  font-size: 20px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
.cvm-header-actions { display: flex; align-items: center; gap: 10px; }
.cvm-save-state { font-size: 12px; color: var(--text-muted); min-width: 52px; text-align: right; }

.cvm-primary-btn, .cvm-ghost-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  font-size: 13px;
  font-weight: 500;
  border-radius: 6px;
  padding: 8px 14px;
  cursor: pointer;
  border: 1px solid transparent;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.cvm-primary-btn { background: var(--accent); color: #1b1206; }
.cvm-primary-btn:hover { background: var(--accent-hover); }
.cvm-ghost-btn { background: transparent; color: var(--text); border-color: var(--border); }
.cvm-ghost-btn:hover { border-color: var(--accent); color: var(--accent); }

.cvm-app-body { display: flex; flex: 1; min-height: 0; }

.cvm-editor-panel {
  width: 420px;
  flex-shrink: 0;
  overflow-y: auto;
  padding: 20px;
  border-right: 1px solid var(--border);
  background: var(--bg);
}

.cvm-block {
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 14px;
}
.cvm-block-title {
  margin: 0 0 12px 0;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--text-muted);
}
.cvm-block-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.cvm-section-title-input {
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 4px 2px;
  border-bottom: 1px solid transparent;
  flex: 1;
  min-width: 0;
}
.cvm-section-title-input:hover, .cvm-section-title-input:focus { border-bottom-color: var(--border); }
.cvm-block-controls { display: flex; gap: 2px; flex-shrink: 0; }

.cvm-icon-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 5px;
  border: 1px solid var(--border);
  background: var(--panel-alt);
  color: var(--text-muted);
  cursor: pointer;
}
.cvm-icon-btn:hover:not(:disabled) { color: var(--accent); border-color: var(--accent); }
.cvm-icon-btn:disabled { opacity: 0.35; cursor: not-allowed; }

.cvm-field {
  display: flex;
  flex-direction: column;
  gap: 5px;
  font-size: 12px;
  color: var(--text-muted);
  margin-bottom: 10px;
}
.cvm-field input, .cvm-field textarea {
  font-family: inherit;
  font-size: 13.5px;
  color: var(--text);
  background: var(--panel-alt);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px 10px;
  resize: vertical;
}
.cvm-field input:focus, .cvm-field textarea:focus { border-color: var(--accent); }

.cvm-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 0 10px; }

.cvm-entries { display: flex; flex-direction: column; gap: 14px; }
.cvm-entry { border-top: 1px solid var(--border); padding-top: 12px; }
.cvm-entry:first-child { border-top: none; padding-top: 0; }
.cvm-entry-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.cvm-entry-index { font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.05em; }

.cvm-add-entry, .cvm-add-section-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 12.5px;
  color: var(--accent);
  background: transparent;
  border: 1px dashed var(--border);
  border-radius: 6px;
  padding: 7px 10px;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}
.cvm-add-entry:hover { border-color: var(--accent); }

.cvm-add-section { position: relative; }
.cvm-add-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  background: var(--panel);
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow: hidden;
  z-index: 5;
}
.cvm-add-menu button {
  display: block;
  width: 100%;
  text-align: left;
  padding: 9px 12px;
  background: transparent;
  border: none;
  color: var(--text);
  font-size: 13px;
  cursor: pointer;
}
.cvm-add-menu button:hover { background: var(--panel-alt); color: var(--accent); }

.cvm-preview-panel {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: #0e1014;
  display: flex;
  flex-direction: column;
}
.cvm-preview-toolbar {
  display: flex;
  gap: 6px;
  padding: 14px 24px;
  border-bottom: 1px solid var(--border);
}
.cvm-tpl-chip {
  font-family: inherit;
  font-size: 12.5px;
  font-weight: 500;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--border);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}
.cvm-tpl-chip.is-active { border-color: var(--accent); color: var(--accent); }

.cvm-paper-scroll { flex: 1; display: flex; justify-content: center; padding: 32px 24px 60px; }

.cvm-paper {
  width: min(100%, 8.5in);
  min-height: 11in;
  background: var(--paper);
  color: var(--ink);
  padding: 0.75in;
  box-shadow: 0 8px 40px rgba(0,0,0,0.4);
  font-family: 'Source Serif 4', Georgia, serif;
}

.cvm-p-header { margin-bottom: 22px; }
.cvm-p-name { margin: 0; font-size: 30px; font-weight: 600; letter-spacing: 0.01em; }
.cvm-p-title { font-size: 14px; color: var(--ink-muted); margin-top: 2px; }
.cvm-p-contact { font-size: 12px; color: var(--ink-muted); margin-top: 8px; }

.cvm-p-heading {
  font-size: 12.5px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.09em;
  border-bottom: 1px solid #d8d5cc;
  padding-bottom: 5px;
  margin: 0 0 10px 0;
}
.cvm-p-section { margin-bottom: 18px; }
.cvm-p-summary { font-size: 13.5px; line-height: 1.55; margin: 0; }
.cvm-p-skills { display: flex; flex-wrap: wrap; gap: 6px 18px; padding: 0; margin: 0; list-style: none; font-size: 13px; }
.cvm-p-skills li::before { content: "· "; color: var(--ink-muted); }
.cvm-p-skills li:first-child::before { content: ""; }

.cvm-p-item { margin-bottom: 12px; }
.cvm-p-item:last-child { margin-bottom: 0; }
.cvm-p-item-row { display: flex; justify-content: space-between; align-items: baseline; gap: 12px; }
.cvm-p-item-title { font-size: 14px; font-weight: 600; }
.cvm-p-item-org { font-weight: 400; color: var(--ink-muted); }
.cvm-p-item-dates { font-size: 12px; color: var(--ink-muted); white-space: nowrap; }
.cvm-p-item-sub { font-size: 12.5px; color: var(--ink-muted); margin-top: 1px; }
.cvm-p-bullets { margin: 6px 0 0; padding-left: 18px; font-size: 13px; line-height: 1.5; }
.cvm-p-bullets li { margin-bottom: 2px; }

/* Modern template */
.cvm-tpl-modern { font-family: 'Inter', system-ui, sans-serif; }
.cvm-tpl-modern .cvm-p-name { color: var(--accent); font-weight: 700; }
.cvm-tpl-modern .cvm-p-heading {
  color: var(--accent);
  border-bottom: 2px solid var(--accent);
  text-transform: none;
  letter-spacing: 0.02em;
  font-size: 13px;
}
.cvm-tpl-modern .cvm-p-item-title { font-weight: 700; }

/* Minimal template */
.cvm-tpl-minimal { font-family: 'Inter', system-ui, sans-serif; padding: 0.9in 0.9in; }
.cvm-tpl-minimal .cvm-p-name { font-weight: 500; letter-spacing: -0.01em; }
.cvm-tpl-minimal .cvm-p-heading {
  border-bottom: none;
  color: var(--ink-muted);
  font-weight: 600;
  letter-spacing: 0.14em;
}
.cvm-tpl-minimal .cvm-p-section { margin-bottom: 24px; }
.cvm-tpl-minimal .cvm-p-item-title { font-weight: 600; }

@media (max-width: 900px) {
  .cvm-app-body { flex-direction: column; }
  .cvm-editor-panel { width: 100%; max-height: 50vh; border-right: none; border-bottom: 1px solid var(--border); }
  .cvm-grid-2 { grid-template-columns: 1fr; }
  .cvm-paper { padding: 0.5in; }
}

@media print {
  .cvm-header, .cvm-editor-panel, .cvm-preview-toolbar { display: none !important; }
  .cvm-app, .cvm-app-body, .cvm-preview-panel, .cvm-paper-scroll { display: block !important; background: white !important; overflow: visible !important; }
  .cvm-paper { box-shadow: none !important; margin: 0 auto !important; }
}
`;
