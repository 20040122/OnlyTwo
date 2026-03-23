"use server";

export async function sendMessage() {
  return { message: "TODO: insert a new message with a client_id for dedupe." };
}

export async function markConversationRead() {
  return { message: "TODO: update last_read_message_id and last_read_at." };
}

export async function retryMessage() {
  return { message: "TODO: retry a locally failed message." };
}
