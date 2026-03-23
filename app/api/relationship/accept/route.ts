import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    {
      message:
        "TODO: accept invite, create relationship, conversation and conversation members atomically.",
    },
    { status: 201 },
  );
}
