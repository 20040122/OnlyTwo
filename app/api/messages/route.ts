import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "TODO: list messages for the single active conversation.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      message: "TODO: insert a new text message into the messages table.",
    },
    { status: 201 },
  );
}
