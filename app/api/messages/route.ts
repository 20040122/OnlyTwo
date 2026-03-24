import { NextResponse } from "next/server";

import { getCurrentUser } from "@/features/auth/server";
import { getConversationForCurrentUser } from "@/features/conversation/server";
import { createTextMessageForCurrentUser } from "@/features/message/actions";
import { listMessages } from "@/features/message/server";

export async function GET() {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 },
    );
  }

  const conversation = await getConversationForCurrentUser();

  if (!conversation) {
    return NextResponse.json(
      { message: "No active conversation exists for the current user." },
      { status: 409 },
    );
  }

  const messages = await listMessages(conversation.id);

  return NextResponse.json({
    conversationId: conversation.id,
    messages,
  });
}

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "Authentication required." },
      { status: 401 },
    );
  }

  const payload = await request.json().catch(() => null);
  const content =
    payload && typeof payload.content === "string" ? payload.content : "";
  const result = await createTextMessageForCurrentUser(content);

  if (result.status === "error") {
    const status =
      result.code === "authentication_required"
        ? 401
        : result.code === "conversation_not_found"
          ? 409
          : result.code === "empty_content" || result.code === "message_too_long"
            ? 400
            : result.code === "conversation_access_denied"
              ? 403
              : 500;

    return NextResponse.json({ message: result.message }, { status });
  }

  return NextResponse.json(
    {
      conversationId: result.conversationId,
      message: result.message,
    },
    { status: 201 },
  );
}
