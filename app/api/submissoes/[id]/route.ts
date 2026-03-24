import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

type AppSession = { user: { id: string; role: string } };

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions) as AppSession | null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const submission = await prisma.submission.findUnique({
    where: { id },
    include: {
      instructor: { select: { id: true, name: true, email: true } },
      coordinator: { select: { id: true, name: true, email: true } },
    },
  });

  if (!submission) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const { id: userId, role } = session.user;
  const canView =
    role === "ADMIN" ||
    submission.instructorId === userId ||
    submission.coordinatorId === userId;

  if (!canView) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json(submission);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions) as AppSession | null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  const { id: userId, role } = session.user;
  const isCoordinator =
    (role === "COORDINATOR" && submission.coordinatorId === userId) ||
    role === "ADMIN";
  const isAssignedInstructor = role === "INSTRUCTOR" && submission.instructorId === userId;

  if (!isCoordinator && !isAssignedInstructor) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (isAssignedInstructor) {
    // Instrutor envia revisão
    if (!body.submittedData) {
      return NextResponse.json({ error: "submittedData obrigatório." }, { status: 400 });
    }
    data.submittedData = body.submittedData;
    data.status = "reviewed";
  } else {
    // Coordenador/Admin edita ou exporta
    if (body.status === "exported") {
      data.status = "exported";
      data.exportedAt = new Date();
    }
    if (body.submittedData) {
      data.submittedData = body.submittedData;
    }
  }

  const updated = await prisma.submission.update({ where: { id }, data });
  return NextResponse.json({ id: updated.id, status: updated.status });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions) as AppSession | null;
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: userId, role } = session.user;
  if (role !== "COORDINATOR" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const submission = await prisma.submission.findUnique({ where: { id } });
  if (!submission) return NextResponse.json({ error: "Não encontrado." }, { status: 404 });

  if (role === "COORDINATOR" && submission.coordinatorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await prisma.submission.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
