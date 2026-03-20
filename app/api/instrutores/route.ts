import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as { user: { id: string; email: string; role: string } } | null;

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { name, email } = await req.json();

  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Nome e email são obrigatórios." }, { status: 400 });
  }

  const normalizedEmail = email.trim().toLowerCase();

  let user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

  if (!user) {
    user = await prisma.user.create({
      data: { name: name.trim(), email: normalizedEmail },
    });
  }

  const existing = await prisma.appRole.findUnique({
    where: { userId_app: { userId: user.id, app: "select-activity" } },
  });

  if (existing) {
    return NextResponse.json({ error: "Instrutor já cadastrado." }, { status: 409 });
  }

  await prisma.appRole.create({
    data: { userId: user.id, app: "select-activity", role: "INSTRUCTOR" },
  });

  return NextResponse.json({ id: user.id, name: user.name, email: user.email }, { status: 201 });
}
