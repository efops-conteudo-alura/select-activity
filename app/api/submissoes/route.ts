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
  if (session.user.role !== "INSTRUCTOR") {
    return NextResponse.json({ error: "Apenas instrutores podem enviar submissões." }, { status: 403 });
  }

  const { coordinatorId, originalData, submittedData } = await req.json();

  if (!coordinatorId || !originalData || !submittedData) {
    return NextResponse.json({ error: "Dados incompletos." }, { status: 400 });
  }

  const courseId = (originalData as { courseId?: string }).courseId ?? "";

  // Verificar que o coordenador existe e tem role no app
  const coordRole = await prisma.appRole.findFirst({
    where: {
      userId: coordinatorId,
      app: "select-activity",
      role: { in: ["COORDINATOR", "ADMIN"] },
    },
  });
  if (!coordRole) {
    return NextResponse.json({ error: "Coordenador não encontrado." }, { status: 404 });
  }

  const submission = await prisma.submission.create({
    data: {
      instructorId: session.user.id,
      coordinatorId,
      courseId,
      originalData,
      submittedData,
      status: "pending",
    },
  });

  return NextResponse.json({ id: submission.id }, { status: 201 });
}
