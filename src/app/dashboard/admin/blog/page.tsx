"use client";

import React, { useState, useCallback, useRef } from "react";

// ─── Types ───────────────────────────────────────────────────────────────────

type BlogFormValues = {
  title: string;
  content: string;
  tags: string;
  organization: string;
  isFeatured: boolean;
  image: File | null;
};

type FormErrors = {
  title?: string;
  content?: string;
  organization?: string;
};

type Organization = "Collabuilder" | "Kynyx" | "Homeasy" | "Aiexperts";

const ORGANIZATIONS: Organization[] = [
  "Collabuilder",
  "Kynyx",
  "Homeasy",
  "Aiexperts",
];

const INITIAL_FORM: BlogFormValues = {
  title: "",
  content: "",
  tags: "",
  organization: "",
  isFeatured: false,
  image: null,
};

// ─── Sub-components ───────────────────────────────────────────────────────────

const CharCount = ({
  value,
  min,
  max,
}: {
  value: string;
  min: number;
  max: number;
}) => {
  const len = value.length;
  const colorClass =
    len >= max
      ? "text-orange-500"
      : len >= min
        ? "text-emerald-700"
        : "text-gray-400";
  return (
    <span className={`text-[11px] float-right mt-1 ${colorClass}`}>
      {len} / {max}
    </span>
  );
};

const ErrorMsg = ({ msg }: { msg?: string }) =>
  msg ? (
    <p className="text-xs text-red-600 mt-1.5 flex items-center gap-1.5">
      <span className="w-3.5 h-3.5 rounded-full bg-red-600 text-white text-[9px] font-bold inline-flex items-center justify-center shrink-0">
        !
      </span>
      {msg}
    </p>
  ) : null;

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-4 flex items-center gap-2">
    {children}
    <span className="flex-1 h-px bg-gray-100 block" />
  </div>
);

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-white border border-gray-100 rounded-xl px-8 py-7 mb-4 shadow-sm ${className ?? ""}`}
  >
    {children}
  </div>
);

// ─── Upload Zone ──────────────────────────────────────────────────────────────

const UploadZone = ({
  file,
  onChange,
}: {
  file: File | null;
  onChange: (f: File | null) => void;
}) => {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const dropped = e.dataTransfer.files[0];
      if (dropped && dropped.type.startsWith("image/")) onChange(dropped);
    },
    [onChange],
  );

  const hasFile = !!file;

  return (
    <div
      className={[
        "rounded border text-center cursor-pointer transition-all duration-150 py-7 px-4",
        hasFile
          ? "border-emerald-500 border-solid bg-emerald-50"
          : dragging
            ? "border-red-500 border-solid bg-red-50"
            : "border-dashed border-gray-200 bg-gray-50 hover:border-gray-300",
      ].join(" ")}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
    >
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={(e) => onChange(e.target.files?.[0] ?? null)}
      />
      <svg
        width="36"
        height="36"
        viewBox="0 0 36 36"
        fill="none"
        className={`mx-auto mb-2 ${hasFile ? "opacity-50" : "opacity-30"}`}
      >
        <rect width="36" height="36" rx="8" fill="#1a1a1a" fillOpacity="0.08" />
        <path
          d="M18 12v8M14 16l4-4 4 4M12 24h12"
          stroke={hasFile ? "#059669" : "#1a1a1a"}
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      {hasFile ? (
        <>
          <p className="text-sm font-medium text-emerald-700">{file!.name}</p>
          <p className="text-xs text-emerald-500 mt-0.5">
            {(file!.size / 1024).toFixed(0)} KB · click to replace
          </p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-gray-700">
            Drop image here or click to browse
          </p>
          <p className="text-xs text-gray-400 mt-0.5">
            JPG, PNG or WebP · max 5 MB
          </p>
        </>
      )}
    </div>
  );
};

// ─── Toggle Switch ────────────────────────────────────────────────────────────

const Toggle = ({
  checked,
  onChange,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
}) => (
  <label className="relative w-[42px] h-6 block cursor-pointer">
    <input
      type="checkbox"
      checked={checked}
      onChange={(e) => onChange(e.target.checked)}
      className="opacity-0 w-0 h-0 absolute"
    />
    <span
      className={`absolute inset-0 rounded-full transition-colors duration-200 ${checked ? "bg-red-600" : "bg-gray-300"}`}
    >
      <span
        className={`absolute top-[3px] w-[18px] h-[18px] rounded-full bg-white shadow transition-all duration-200 ${checked ? "left-[21px]" : "left-[3px]"}`}
      />
    </span>
  </label>
);

// ─── Main Component ───────────────────────────────────────────────────────────

export default function BlogPublishForm() {
  const [form, setForm] = useState<BlogFormValues>(INITIAL_FORM);
  const [errors, setErrors] = useState<FormErrors>({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const setField = <K extends keyof BlogFormValues>(
    key: K,
    value: BlogFormValues[K],
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const clearError = (key: keyof FormErrors) =>
    setErrors((prev) => ({ ...prev, [key]: undefined }));

  const parsedTags = form.tags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (form.title.trim().length < 5)
      newErrors.title = "Title must be at least 5 characters";
    if (form.content.trim().length < 20)
      newErrors.content = "Content must be at least 20 characters";
    if (!form.organization)
      newErrors.organization = "Please select an organization";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const data = new FormData();
      data.append("title", form.title.trim());
      data.append("content", form.content.trim());
      data.append("tags", JSON.stringify(parsedTags));
      data.append("organization", form.organization);
      data.append("isFeatured", String(form.isFeatured));
      if (form.image) data.append("image", form.image);

      const res = await fetch("/api/blogs", { method: "POST", body: data });
      if (!res.ok) throw new Error("Failed to submit");

      setSuccess(true);
      setForm(INITIAL_FORM);
      setErrors({});
      setTimeout(() => setSuccess(false), 4000);
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "w-full font-sans text-[15px] text-gray-900 bg-gray-50 border border-gray-200 rounded px-3.5 py-2.5 outline-none transition-all duration-150 placeholder:text-gray-300 placeholder:font-light focus:border-red-500 focus:ring-2 focus:ring-red-500/10 focus:bg-white appearance-none";
  const inputError = "border-red-500 bg-red-50";

  return (
    <div className="bg-gray-50 min-h-screen px-4 py-10 ">
      <div className="w-full p-10 ">
        {/* ── Success Banner ── */}
        {success && (
          <div className="animate-[slideIn_0.3s_ease] bg-emerald-50 border border-emerald-200 rounded px-4 py-3 text-sm text-emerald-800 flex items-center gap-2.5 mb-4">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="7" stroke="#059669" strokeWidth="1.5" />
              <path
                d="M5 8l2 2 4-4"
                stroke="#059669"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Blog published successfully!
          </div>
        )}

        {/* ── Masthead ── */}
        <div className="mb-10 pb-6 border-b border-gray-100">
          <p className="text-[11px] font-semibold tracking-[0.12em] uppercase text-red-600 mb-1.5">
            Content Studio
          </p>
          <h1 className="font-serif text-[clamp(28px,5vw,38px)] text-gray-900 leading-tight">
            Publish a <em className="italic text-red-600">new</em> blog
          </h1>
          <p className="text-sm text-gray-400 mt-2 font-light">
            Share ideas, updates and stories with your organization.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* ── Content Card ── */}
          <Card>
            <SectionLabel>Content</SectionLabel>

            {/* Title */}
            <div className="mb-5">
              <label
                htmlFor="title"
                className="block text-xs font-medium text-gray-400 mb-1.5"
              >
                Post title
              </label>
              <input
                id="title"
                type="text"
                className={`${inputBase} ${errors.title ? inputError : ""}`}
                placeholder="Give your post a compelling title…"
                value={form.title}
                maxLength={120}
                onChange={(e) => {
                  setField("title", e.target.value);
                  clearError("title");
                }}
              />
              <CharCount value={form.title} min={5} max={120} />
              <ErrorMsg msg={errors.title} />
            </div>

            {/* Content */}
            <div className="mb-5">
              <label
                htmlFor="content"
                className="block text-xs font-medium text-gray-400 mb-1.5"
              >
                Body
              </label>
              <textarea
                id="content"
                className={`${inputBase} resize-y min-h-[148px] leading-relaxed ${errors.content ? inputError : ""}`}
                placeholder="Write your post here…"
                value={form.content}
                maxLength={5000}
                onChange={(e) => {
                  setField("content", e.target.value);
                  clearError("content");
                }}
              />
              <CharCount value={form.content} min={20} max={5000} />
              <ErrorMsg msg={errors.content} />
            </div>

            {/* Tags */}
            <div>
              <label
                htmlFor="tags"
                className="block text-xs font-medium text-gray-400 mb-1.5"
              >
                Tags
              </label>
              <input
                id="tags"
                type="text"
                className={inputBase}
                placeholder="e.g. design, product, update"
                value={form.tags}
                onChange={(e) => setField("tags", e.target.value)}
              />
              <p className="text-[11px] text-gray-300 mt-1">
                Separate multiple tags with commas
              </p>
              {parsedTags.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {parsedTags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[11px] font-medium bg-red-50 text-red-600 border border-red-200/50 rounded-full px-2.5 py-0.5 tracking-[0.02em]"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </Card>

          <div>
            {/* ── Organization Card ── */}
            <Card>
              <SectionLabel>Organization</SectionLabel>
              <div className="grid grid-cols-2 gap-2">
                {ORGANIZATIONS.map((org) => (
                  <button
                    key={org}
                    className={[
                      "text-sm text-left px-3.5 py-2.5 rounded border transition-all duration-150 flex justify-between items-center cursor-pointer",
                      form.organization === org
                        ? "bg-red-50 border-red-500 text-red-600 font-medium"
                        : "bg-gray-50 border-gray-200 text-gray-500 hover:border-red-300 hover:text-gray-800",
                    ].join(" ")}
                    onClick={() => {
                      setField("organization", org);
                      clearError("organization");
                    }}
                    type="button"
                  >
                    {org}
                    {form.organization === org && (
                      <span className="text-sm">✓</span>
                    )}
                  </button>
                ))}
              </div>
              <ErrorMsg msg={errors.organization} />
            </Card>
            {/* ── Settings Card ── */}
            <Card>
              <SectionLabel>Settings</SectionLabel>

              {/* Featured Toggle */}
              <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-100">
                <div>
                  <strong className="text-sm font-medium text-gray-800 block">
                    Featured post
                  </strong>
                  <span className="text-xs text-gray-400 mt-0.5 block">
                    Highlight this post at the top of the feed
                  </span>
                </div>
                <Toggle
                  checked={form.isFeatured}
                  onChange={(v) => setField("isFeatured", v)}
                />
              </div>

              {/* Image Upload */}
              <div>
                <label className="block text-xs font-medium text-gray-400 mb-2">
                  Cover image
                </label>
                <UploadZone
                  file={form.image}
                  onChange={(f) => setField("image", f)}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* ── Submit Row ── */}
        <div className="flex items-center flex-col gap-4 mt-6">
          <span className="text-xs text-gray-700 font-light">
            All required fields must be filled before publishing.
          </span>
          <button
            className="text-sm font-semibold text-white bg-gray-900 border-none rounded px-7 py-3 cursor-pointer tracking-[0.03em] transition-all duration-150 flex items-center gap-2 min-w-[160px] justify-center hover:bg-red-600 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
            onClick={handleSubmit}
            type="button"
          >
            {loading ? (
              <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              "Publish post"
            )}
          </button>
        </div>
      </div>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600&display=swap');
        * { font-family: 'DM Sans', sans-serif; }
        h1 { font-family: 'DM Serif Display', serif; }
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
