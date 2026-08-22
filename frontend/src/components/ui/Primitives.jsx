import { ChevronLeft, ChevronDown } from "lucide-react";
import { C, INTEREST_COLOR } from "../../lib/constants.js";

export function Badge({ children, fg, bg, style }) {
  return (
    <span
      className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{
        color: fg,
        background: bg,
        fontFamily: "Inter, sans-serif",
        ...style,
      }}
    >
      {children}
    </span>
  );
}

export function InterestBadge({ value }) {
  const c = INTEREST_COLOR[value] || {
    fg: C.inkSoft,
    bg: C.surfaceAlt,
    dot: C.inkFaint,
  };
  return (
    <Badge fg={c.fg} bg={c.bg}>
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: c.dot }}
      />
      {value}
    </Badge>
  );
}

export function IconBtn({
  icon: Icon,
  label,
  onClick,
  tone = "default",
  href,
  disabled,
}) {
  const tones = {
    default: { bg: C.surfaceAlt, fg: C.ink, border: C.border },
    primary: { bg: C.primary, fg: "#fff", border: C.primary },
    green: { bg: C.greenSoft, fg: C.green, border: C.greenSoft },
    clay: { bg: C.claySoft, fg: C.clay, border: C.claySoft },
  };
  const t = tones[tone];
  const cls =
    "inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold transition active:scale-95 disabled:opacity-40";
  const style = {
    background: t.bg,
    color: t.fg,
    border: `1px solid ${t.border}`,
    fontFamily: "Inter, sans-serif",
  };
  if (href) {
    return (
      <a
        href={href}
        className={cls}
        style={style}
        onClick={(e) => {
          if (disabled) e.preventDefault();
        }}
      >
        <Icon size={15} /> {label}
      </a>
    );
  }
  return (
    <button className={cls} style={style} onClick={onClick} disabled={disabled}>
      <Icon size={15} /> {label}
    </button>
  );
}

export function Card({ children, style, className }) {
  return (
    <div
      className={`rounded-2xl ${className || ""}`}
      style={{
        background: C.surface,
        border: `1px solid ${C.border}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children, icon: Icon }) {
  return (
    <div className="flex items-center gap-1.5 mb-2.5 px-1">
      {Icon && <Icon size={14} style={{ color: C.inkFaint }} />}
      <h2
        className="text-[11px] font-bold tracking-[0.12em] uppercase"
        style={{ color: C.inkFaint, fontFamily: "Space Grotesk, sans-serif" }}
      >
        {children}
      </h2>
    </div>
  );
}

export function Field({ label, required, children, hint }) {
  return (
    <label className="block mb-4">
      <span
        className="text-sm font-semibold mb-1.5 flex items-center gap-1"
        style={{ color: C.ink, fontFamily: "Inter, sans-serif" }}
      >
        {label}
        {required && <span style={{ color: C.clay }}>*</span>}
      </span>
      {children}
      {hint && (
        <span className="text-xs mt-1 block" style={{ color: C.inkFaint }}>
          {hint}
        </span>
      )}
    </label>
  );
}

export function Row({ label, value, strong }) {
  return (
    <div className="flex gap-2">
      <span
        className="text-xs font-semibold w-28 shrink-0 pt-0.5"
        style={{ color: C.inkFaint }}
      >
        {label}
      </span>
      <span
        className="text-sm flex-1"
        style={{
          color: strong ? C.clay : C.ink,
          fontWeight: strong ? 700 : 400,
        }}
      >
        {value}
      </span>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, body }) {
  return (
    <div className="flex flex-col items-center text-center py-10 px-6">
      <div
        className="w-12 h-12 rounded-2xl flex items-center justify-center mb-3"
        style={{ background: C.surfaceAlt }}
      >
        <Icon size={22} style={{ color: C.inkFaint }} />
      </div>
      <p
        className="text-sm font-semibold mb-1"
        style={{ color: C.ink, fontFamily: "Inter, sans-serif" }}
      >
        {title}
      </p>
      {body && (
        <p className="text-xs max-w-[240px]" style={{ color: C.inkFaint }}>
          {body}
        </p>
      )}
    </div>
  );
}

export function PageHeader({ title, onBack, right }) {
  return (
    <div className="flex items-center gap-2 mb-5">
      {onBack && (
        <button
          onClick={onBack}
          className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
          style={{ background: C.surfaceAlt }}
        >
          <ChevronLeft size={17} style={{ color: C.ink }} />
        </button>
      )}
      <h1
        className="text-lg font-bold flex-1"
        style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}
      >
        {title}
      </h1>
      {right}
    </div>
  );
}

const inputBase = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: "10px",
  border: `1px solid ${C.border}`,
  background: C.surface,
  color: C.ink,
  fontSize: "14px",
  fontFamily: "Inter, sans-serif",
  outline: "none",
};

export function TextInput(props) {
  return (
    <input
      {...props}
      style={{ ...inputBase, ...(props.style || {}) }}
      onFocus={(e) => (e.target.style.borderColor = C.primary)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  );
}

export function TextArea(props) {
  return (
    <textarea
      {...props}
      style={{
        ...inputBase,
        resize: "vertical",
        minHeight: "72px",
        ...(props.style || {}),
      }}
      onFocus={(e) => (e.target.style.borderColor = C.primary)}
      onBlur={(e) => (e.target.style.borderColor = C.border)}
    />
  );
}

export function Select({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={onChange}
        style={{ ...inputBase, appearance: "none", paddingRight: "34px" }}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        style={{
          position: "absolute",
          right: 10,
          top: 11,
          color: C.inkFaint,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}

export function ChipGroup({ options, value, onChange, columns = 3 }) {
  return (
    <div
      className="grid gap-2"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0,1fr))` }}
    >
      {options.map((opt) => {
        const active = value === opt;
        return (
          <button
            type="button"
            key={opt}
            onClick={() => onChange(opt)}
            className="px-3 py-2 rounded-xl text-sm font-semibold transition active:scale-95"
            style={{
              background: active ? C.primary : C.surfaceAlt,
              color: active ? "#fff" : C.ink,
              border: `1px solid ${active ? C.primary : C.border}`,
              fontFamily: "Inter, sans-serif",
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

export function InterestPicker({ value, onChange }) {
  const opts = [
    {
      v: "Interested",
      label: "Interested",
      dot: C.green,
      bg: C.greenSoft,
      fg: C.green,
    },
    { v: "Maybe", label: "Maybe", dot: C.amber, bg: C.amberSoft, fg: C.amber },
    {
      v: "Not Interested",
      label: "Not Interested",
      dot: C.red,
      bg: C.redSoft,
      fg: C.red,
    },
  ];
  return (
    <div className="grid grid-cols-3 gap-2">
      {opts.map((o) => {
        const active = value === o.v;
        return (
          <button
            type="button"
            key={o.v}
            onClick={() => onChange(o.v)}
            className="flex flex-col items-center gap-1.5 py-3 rounded-2xl transition active:scale-95"
            style={{
              background: active ? o.bg : C.surfaceAlt,
              border: `2px solid ${active ? o.fg : "transparent"}`,
            }}
          >
            <span
              className="w-3.5 h-3.5 rounded-full"
              style={{ background: o.dot }}
            />
            <span
              className="text-xs font-bold text-center leading-tight"
              style={{
                color: active ? o.fg : C.inkSoft,
                fontFamily: "Inter, sans-serif",
              }}
            >
              {o.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function ModalShell({ title, onClose, children }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4"
      style={{ background: "rgba(23,30,25,0.45)" }}
      onClick={onClose}
    >
      <div
        className="w-full md:max-w-md max-h-[88vh] overflow-y-auto rounded-t-3xl md:rounded-3xl p-5"
        style={{ background: C.surface }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3
            className="text-base font-bold"
            style={{ fontFamily: "Space Grotesk, sans-serif", color: C.ink }}
          >
            {title}
          </h3>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: C.surfaceAlt }}
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}) {
  return (
    <ModalShell title={title} onClose={onClose}>
      <p className="text-sm mb-5" style={{ color: C.inkSoft }}>
        {message}
      </p>
      <div className="flex gap-2">
        <button
          onClick={onClose}
          className="flex-1 py-3 rounded-xl text-sm font-bold"
          style={{ background: C.surfaceAlt, color: C.inkSoft }}
        >
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="flex-1 py-3 rounded-xl text-sm font-bold"
          style={{ background: C.red, color: "#fff" }}
        >
          {confirmLabel}
        </button>
      </div>
    </ModalShell>
  );
}
