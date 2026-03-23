import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json({
    message: "TODO: update conversation_members.last_read_message_id and last_read_at.",
  });
}
