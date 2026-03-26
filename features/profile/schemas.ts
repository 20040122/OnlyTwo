export type ProfileInput = {
  nickname: string;
  avatarUrl?: string | null;
};

export type NormalizedProfileInput = {
  nickname: string;
  avatarUrl: string | null;
};

type ProfileValidationResult =
  | {
      data: NormalizedProfileInput;
      message: "";
      ok: true;
    }
  | {
      data: null;
      message: string;
      ok: false;
    };

export function normalizeProfileInput(
  input: ProfileInput,
): ProfileValidationResult {
  const nickname = input.nickname.trim();
  const avatarUrl = input.avatarUrl?.trim() ?? "";

  if (!nickname) {
    return { ok: false, data: null, message: "请输入昵称。" };
  }

  if (avatarUrl) {
    try {
      new URL(avatarUrl);
    } catch {
      return { ok: false, data: null, message: "头像地址格式不正确。" };
    }
  }

  return {
    ok: true,
    data: {
      nickname,
      avatarUrl: avatarUrl || null,
    },
    message: "",
  };
}
