import { NextResponse } from "next/server";
import { getAllUsers } from "@/lib/auth/user-store";

export async function GET() {
  try {
    const users = getAllUsers();
    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch registered users:", error);
    return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 });
  }
}
