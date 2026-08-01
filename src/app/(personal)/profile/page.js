"use client";
import { useEffect, useRef, useState } from "react";
import { getCurrentUser } from "@/api/user";
import { getProfile, updateProfile } from "@/api/profile";
import {
  Spinner,
  EditIcon, CheckIcon, XIcon, CameraIcon,
} from "@/components/icons";
import styles from "@/components/animations.module.css";

const fieldInput =
  "w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-3.5 py-2 text-sm text-black " +
  "placeholder:text-zinc-400 focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-100 " +
  "dark:border-zinc-700 dark:bg-zinc-900 dark:text-rose-100 dark:placeholder:text-rose-300/40 " +
  "dark:focus:ring-rose-900/40 transition-all";

function Avatar({ url, initial, editing, onClick }) {
  return (
    <div
      className={`relative h-16 w-16 shrink-0 ${editing ? "cursor-pointer" : ""}`}
      onClick={onClick}
    >
      {url ? (
        <img
          src={url}
          alt="avatar"
          className="h-16 w-16 rounded-full object-cover ring-2 ring-white dark:ring-zinc-900"
        />
      ) : (
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-rose-500 text-xl font-semibold text-white">
          {initial}
        </span>
      )}
      {editing && (
        <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40">
          <CameraIcon className="h-5 w-5 text-white" />
        </span>
      )}
    </div>
  );
}

export default function Home() {
  const fileInputRef = useRef(null);

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({});
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [userRes, profileRes] = await Promise.all([
          getCurrentUser(),
          getProfile(),
        ]);
        const merged = { ...profileRes.data, username: userRes.data.username };
        if (!cancelled) { setUser(merged); setDraft(merged); }
      } catch (e) {
        if (!cancelled && e.response?.status !== 401)
          setLoadError(e.response?.data?.message ?? e.message ?? "Couldn't load your profile.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  function startEdit() {
    setDraft({ ...user });
    setAvatarPreview(null);
    setSaveError("");
    setEditing(true);
  }

  function cancelEdit() {
    setEditing(false);
    setAvatarPreview(null);
    setSaveError("");
  }

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAvatarPreview(ev.target.result);
      setDraft((d) => ({ ...d, avatarUrl: ev.target.result }));
    };
    reader.readAsDataURL(file);
  }

  async function saveEdit() {
    setSaving(true);
    setSaveError("");
    try {
      const res = await updateProfile({
        nickname: draft.nickname,
        bio: draft.bio,
        avatarUrl: draft.avatarUrl,
      });
      setUser((u) => ({ ...u, ...res.data }));
      setEditing(false);
      setAvatarPreview(null);
    } catch (e) {
      setSaveError(e.response?.data?.message ?? e.message ?? "Couldn't save changes.");
    } finally {
      setSaving(false);
    }
  }

  const initial = user?.username?.[0]?.toUpperCase() ?? "?";
  const displayName = user?.nickname || user?.username || "—";
  const displayAvatar = avatarPreview || draft.avatarUrl;
  return (
    <>
        <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-10">
        {loading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-36 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
            <div className="h-20 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
            <div className="h-20 rounded-3xl bg-zinc-200/70 dark:bg-zinc-900" />
          </div>
        ) : loadError ? (
          <div className={`${styles.fadeInUp} rounded-3xl border border-zinc-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950`}>
            <p className="text-sm text-rose-600 dark:text-rose-400">{loadError}</p>
            <button onClick={() => window.location.reload()} className="mt-4 h-10 rounded-full bg-rose-500 px-5 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95">
              Try again
            </button>
          </div>
        ) : (
          <div className={`flex flex-col gap-4 ${styles.fadeInUp}`}>

            {/* Profile card */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center gap-4">
                <Avatar url={user?.avatarUrl} initial={initial} editing={false} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-lg font-semibold select-none cursor-default text-black dark:text-rose-100">{displayName}</p>
                  <p className="text-sm select-none cursor-default text-zinc-500 dark:text-rose-300/70">@{user?.username}</p>
                  {user?.bio && (
                    <p className="mt-1.5 text-sm leading-relaxed select-none cursor-default text-zinc-600 dark:text-rose-200">{user.bio}</p>
                  )}
                </div>
                <button
                  onClick={startEdit}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-zinc-200 px-3 py-1.5 text-xs font-medium text-zinc-600 transition-all hover:bg-zinc-100 active:scale-95 dark:border-zinc-700 dark:text-rose-200 dark:hover:bg-zinc-900"
                >
                  <EditIcon className="h-3.5 w-3.5" />
                  Edit
                </button>
              </div>
            </div>

            {/* Privacy card — placeholder, default public */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-sm font-medium text-black dark:text-rose-100">Public profile</p>
                  <p className="text-xs text-zinc-500 dark:text-rose-300/70">Anyone with your username can view your profile.</p>
                </div>
                {/* Toggle placeholder — logic to be wired up, default on */}
                <div className="relative h-6 w-11 shrink-0 rounded-full bg-rose-500">
                  <span className="absolute right-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow" />
                </div>
              </div>
            </div>

            {/* Family card — placeholder */}
            <div className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm dark:border-zinc-800 dark:bg-zinc-950">
              <h2 className="mb-3 text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">Family</h2>
              <p className="text-sm text-zinc-400 dark:text-rose-300/40">No family set</p>
            </div>

          </div>
        )}
        </main>

      {/* Edit modal */}
      {editing && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
          onClick={(e) => { if (e.target === e.currentTarget) cancelEdit(); }}
        >
          <div className={`${styles.popIn} w-full max-w-sm rounded-3xl border border-zinc-200 bg-white p-6 shadow-xl dark:border-zinc-800 dark:bg-zinc-950`}>
            {/* Modal header */}
            <div className="mb-5 flex items-center justify-between">
              <p className="font-medium text-black dark:text-rose-100">Edit profile</p>
              <button
                onClick={cancelEdit}
                className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-400 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>

            {/* Avatar upload */}
            <div className="mb-5 flex flex-col items-center gap-2">
              <Avatar
                url={displayAvatar}
                initial={initial}
                editing={true}
                onClick={() => fileInputRef.current?.click()}
              />
              <p className="text-xs text-zinc-400 dark:text-rose-300/50">Click to upload a photo</p>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* Fields */}
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
                  Nickname
                </label>
                <input
                  className={fieldInput}
                  placeholder="Your display name"
                  value={draft.nickname ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, nickname: e.target.value }))}
                  maxLength={40}
                  autoFocus={false}
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-zinc-500 dark:text-rose-300/70">
                  Bio
                </label>
                <textarea
                  className={`${fieldInput} resize-none`}
                  placeholder="Tell others about yourself"
                  rows={3}
                  value={draft.bio ?? ""}
                  onChange={(e) => setDraft((d) => ({ ...d, bio: e.target.value }))}
                  maxLength={160}
                />
                <p className="mt-1 text-right text-xs text-zinc-400 dark:text-rose-300/40">
                  {(draft.bio ?? "").length}/160
                </p>
              </div>
            </div>

            {saveError && (
              <p className={`${styles.popIn} mt-3 text-center text-sm text-rose-600 dark:text-rose-400`}>
                {saveError}
              </p>
            )}

            {/* Save button — bottom of modal */}
            <button
              onClick={saveEdit}
              disabled={saving}
              className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-full bg-rose-500 text-sm font-medium text-white transition-all hover:bg-rose-600 active:scale-95 disabled:opacity-60"
            >
              {saving ? <Spinner className="h-4 w-4" /> : <CheckIcon className="h-4 w-4" />}
              {saving ? "Saving..." : "Save changes"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
