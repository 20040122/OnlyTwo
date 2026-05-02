"use client";

import type { ChangeEvent } from "react";
import { useActionState, useEffect, useRef, useState } from "react";
import Image from "next/image";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { saveProfile, type SaveProfileActionState } from "@/features/profile/actions";

const INITIAL_STATE: SaveProfileActionState = {
  message: "",
  status: "idle",
};

const MAX_AVATAR_FILE_SIZE = 15 * 1024 * 1024;

export default function OnboardingForm() {
  const [state, formAction, pending] = useActionState(saveProfile, INITIAL_STATE);
  const [avatarPreviewUrl, setAvatarPreviewUrl] = useState("");
  const [avatarFileName, setAvatarFileName] = useState("");
  const [avatarValidationError, setAvatarValidationError] = useState("");
  const avatarInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    return () => {
      if (avatarPreviewUrl) {
        URL.revokeObjectURL(avatarPreviewUrl);
      }
    };
  }, [avatarPreviewUrl]);

  function handleAvatarChange(event: ChangeEvent<HTMLInputElement>) {
    const nextFile = event.target.files?.[0];

    if (avatarPreviewUrl) {
      URL.revokeObjectURL(avatarPreviewUrl);
    }

    if (!nextFile) {
      setAvatarPreviewUrl("");
      setAvatarFileName("");
      setAvatarValidationError("");
      return;
    }

    if (!nextFile.type.startsWith("image/")) {
      setAvatarPreviewUrl("");
      setAvatarFileName("");
      setAvatarValidationError("头像必须是图片文件。");
      return;
    }

    if (nextFile.size > MAX_AVATAR_FILE_SIZE) {
      setAvatarPreviewUrl("");
      setAvatarFileName("");
      setAvatarValidationError("头像大小不能超过 15MB。");
      return;
    }

    setAvatarPreviewUrl(URL.createObjectURL(nextFile));
    setAvatarFileName(nextFile.name);
    setAvatarValidationError("");
  }

  return (
    <form action={formAction} className="space-y-5">
      <div className="space-y-2">
        <label className="text-sm font-medium text-zinc-700" htmlFor="nickname">
          昵称
        </label>
        <Input
          id="nickname"
          name="nickname"
          placeholder="昵称"
          required
        />
      </div>

      <div className="space-y-3">
        <label className="text-sm font-medium text-zinc-700" htmlFor="avatarFile">
          头像上传（可选）
        </label>

        <input
          accept="image/*"
          className="sr-only"
          disabled={pending}
          id="avatarFile"
          name="avatarFile"
          onChange={handleAvatarChange}
          ref={avatarInputRef}
          type="file"
        />

        <label
          className="flex cursor-pointer items-center gap-4 rounded-[1.5rem] border border-dashed border-zinc-300 bg-zinc-50/80 p-4 transition hover:border-rose-300 hover:bg-rose-50/60"
          htmlFor="avatarFile"
        >
          {avatarPreviewUrl ? (
            <Image
              alt="头像预览"
              className="h-18 w-18 rounded-[1.25rem] object-cover shadow-sm"
              height={72}
              src={avatarPreviewUrl}
              unoptimized
              width={72}
            />
          ) : (
            <div className="flex h-18 w-18 items-center justify-center rounded-[1.25rem] bg-white text-xs text-zinc-400 shadow-sm">
              预览
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-zinc-800">
              {avatarFileName || "点击选择头像图片"}
            </p>
          </div>
        </label>

        {avatarValidationError ? (
          <p className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {avatarValidationError}
          </p>
        ) : null}
      </div>

      {state.message ? (
        <p
          aria-live="polite"
          className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
        >
          {state.message}
        </p>
      ) : null}

      <Button
        className="w-full rounded-2xl border border-rose-200/80 bg-rose-200 text-[15px] font-semibold text-rose-950 shadow-[0_0_0_rgba(251,113,133,0.0),0_0_24px_rgba(251,113,133,0.45)] transition-[background-color,box-shadow,transform] duration-300 animate-pulse-rose hover:-translate-y-0.5 hover:bg-rose-300 hover:shadow-[0_0_0_rgba(251,113,133,0.0),0_0_38px_rgba(244,114,182,0.65)] disabled:opacity-50 disabled:pointer-events-none"
        disabled={pending || Boolean(avatarValidationError)}
        type="submit"
      >
        {pending ? "上传并保存中..." : "保存资料"}
      </Button>
    </form>
  );
}
