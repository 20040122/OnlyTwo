"use server";

export async function createInvite() {
  return { message: "TODO: create or return an active relationship invite." };
}

export async function acceptInvite() {
  return {
    message:
      "TODO: accept an invite and atomically create relationship and conversation records.",
  };
}

export async function unbindRelationship() {
  return { message: "TODO: unbind the active relationship safely." };
}
