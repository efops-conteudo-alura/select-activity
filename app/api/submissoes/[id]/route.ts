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

  // Apenas o instrutor que enviou ou o coordenador destinatário podem ver
  const userId = session.user.id;
  if (submission.instructorId !== userId && submission.coordinatorId !== userId) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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

  // Apenas o coordenador destinatário pode atualizar
  if (submission.coordinatorId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const data: Record<string, unknown> = {};

  if (body.status === "exported") {
    data.status = "exported";
    data.exportedAt = new Date();
  }
  if (body.submittedData) {
    data.submittedData = body.submittedData;
  }

  const updated = await prisma.submission.update({ where: { id }, data });
  return NextResponse.json({ id: updated.id, status: updated.status });
}
