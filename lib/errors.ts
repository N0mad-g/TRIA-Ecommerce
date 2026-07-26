import { NextResponse } from 'next/server';

// Formato único de erro usado por todas as rotas (Architecture Seção 5, 9, 16.2).
export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
    requestId: string;
    timestamp: string;
  };
}

export function apiError(status: number, code: string, message: string) {
  const requestId = crypto.randomUUID();
  console.error(`[${requestId}] ${code}: ${message}`);
  return NextResponse.json(
    { error: { code, message, requestId, timestamp: new Date().toISOString() } },
    { status }
  );
}
