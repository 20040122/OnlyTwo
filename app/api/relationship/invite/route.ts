import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    message: "TODO: return the current pending invite for the authenticated user.",
  });
}

export async function POST() {
  return NextResponse.json(
    {
      message: "TODO: create a relationship_invites record.",
    },
    { status: 201 },
  );
}
