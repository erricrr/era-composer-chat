/// <reference types="node" />

import type { Handler, HandlerEvent } from '@netlify/functions';
import { generateGeminiResponse } from '../../shared/gemini/generate';
import {
  MAX_HISTORY_MESSAGES,
  MAX_MESSAGE_LENGTH,
} from '../../shared/gemini/config';
import type { ChatRequestBody, ChatResponseBody } from '../../shared/gemini/types';

const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 20;

const rateLimitStore = new Map<string, { count: number; windowStart: number }>();

function jsonResponse(statusCode: number, body: object) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  };
}

function getClientIp(event: HandlerEvent): string {
  return (
    event.headers['x-nf-client-connection-ip'] ||
    event.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    'unknown'
  );
}

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitStore.get(ip);

  if (!entry || now - entry.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitStore.set(ip, { count: 1, windowStart: now });
    return false;
  }

  if (entry.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  entry.count += 1;
  return false;
}

function isAllowedOrigin(event: HandlerEvent): boolean {
  const origin = event.headers.origin || event.headers.referer;
  if (!origin) {
    return process.env.NODE_ENV !== 'production';
  }

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map((value: string) => value.trim())
    .filter(Boolean);

  if (allowedOrigins.length === 0) {
    return (
      origin.includes('localhost') ||
      origin.includes('127.0.0.1') ||
      origin.includes('.netlify.app') ||
      origin.includes('netlify.live')
    );
  }

  return allowedOrigins.some((allowed: string) => origin.startsWith(allowed));
}

function isValidRequestBody(body: unknown): body is ChatRequestBody {
  if (!body || typeof body !== 'object') {
    return false;
  }

  const candidate = body as Partial<ChatRequestBody>;

  return (
    typeof candidate.message === 'string' &&
    candidate.message.trim().length > 0 &&
    candidate.message.length <= MAX_MESSAGE_LENGTH &&
    typeof candidate.composer === 'object' &&
    candidate.composer !== null &&
    typeof candidate.composer.name === 'string' &&
    Array.isArray(candidate.history) &&
    candidate.history.length <= MAX_HISTORY_MESSAGES &&
    candidate.history.every(
      (message) =>
        (message.role === 'user' || message.role === 'model') &&
        typeof message.text === 'string' &&
        message.text.length <= MAX_MESSAGE_LENGTH,
    )
  );
}

export const handler: Handler = async (event) => {
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        Allow: 'POST, OPTIONS',
      },
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return jsonResponse(405, { error: 'Method not allowed' });
  }

  if (!isAllowedOrigin(event)) {
    return jsonResponse(403, { error: 'Forbidden' });
  }

  const clientIp = getClientIp(event);
  if (isRateLimited(clientIp)) {
    return jsonResponse(429, { error: 'Too many requests. Please try again shortly.' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return jsonResponse(500, { error: 'Server configuration error' });
  }

  let body: unknown;
  try {
    body = JSON.parse(event.body || '{}');
  } catch {
    return jsonResponse(400, { error: 'Invalid JSON body' });
  }

  if (!isValidRequestBody(body)) {
    return jsonResponse(400, { error: 'Invalid request payload' });
  }

  try {
    const text = await generateGeminiResponse(
      apiKey,
      body.composer,
      body.history,
      body.message.trim(),
    );

    const response: ChatResponseBody = { text };
    return jsonResponse(200, response);
  } catch (error) {
    console.error('Gemini chat function error:', error);
    return jsonResponse(502, { error: 'Failed to generate response' });
  }
};
