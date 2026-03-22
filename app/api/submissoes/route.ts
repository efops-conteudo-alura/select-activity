import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type AppSession = { user: { id: string; role: string } };

export async function GET() {
  const session = await getServerSession(authOptions) as AppSession | null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, role } = session.user;

  const where =
    role === "INSTRUCTOR"
      ? { instructorId: userId }
      : role === "ADMIN"
      ? {}
      : { coordinatorId: userId };

  const submissions = await prisma.submission.findMany({
    where,
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      coordinator: { select: { id: true, name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(
    submissions.map((s) => ({
      id: s.id,
      courseId: s.courseId,
      status: s.status,
      instructor: s.instructor,
      coordinator: s.coordinator,
      createdAt: s.createdAt,
      exportedAt: s.exportedAt,
    }))
  );
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions) as AppSession | null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (session.user.role !== "COORDINATOR" && session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Apenas coordenadores podem criar tarefas." }, { status: 403 });
  }

  const { instructorId, originalData } = await req.json();

  if (!instructorId || !originalData) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  const courseId = (originalData as { courseId?: string }).courseId ?? "";

  // Verificar que o instrutor existe e tem role no app
  const instructorRole = await prisma.appRole.findFirst({
    where: {
      userId: instructorId,
      app: "select-activity",
      role: "INSTRUCTOR",
    },
  });
  if (!instructorRole) {
    return NextResponse.json({ error: "Instrutor não encontrado." }, { status: 404 });
  }

  const submission = await prisma.submission.create({
    data: {
      instructorId,
      coordinatorId: session.user.id,
      courseId,
      originalData,
      submittedData: {},
      status: "pending",
    },
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
