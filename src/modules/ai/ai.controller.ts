import { Request, Response, NextFunction } from 'express';
import { aiService, ChatMessage } from './ai.service';
import { ApiError } from '../../utils/api-error';

export async function chat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { messages, lang = 'ar' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw ApiError.badRequest('يجب إرسال مصفوفة الرسائل messages');
    }

    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || !lastMessage.content || typeof lastMessage.content !== 'string') {
      throw ApiError.badRequest('محتوى الرسالة غير صالح');
    }

    const validMessages: ChatMessage[] = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
      content: String(m.content),
    }));

    const result = await aiService.generateChat(validMessages, lang === 'en' ? 'en' : 'ar');

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

export async function streamChat(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { messages, lang = 'ar' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      throw ApiError.badRequest('يجب إرسال مصفوفة الرسائل messages');
    }

    const validMessages: ChatMessage[] = messages.map((m: any) => ({
      role: m.role === 'assistant' ? 'assistant' : m.role === 'system' ? 'system' : 'user',
      content: String(m.content),
    }));

    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    if (typeof (res as any).flushHeaders === 'function') {
      (res as any).flushHeaders();
    }

    const result = await aiService.streamChat(
      validMessages,
      lang === 'en' ? 'en' : 'ar',
      (token: string) => {
        res.write(`data: ${JSON.stringify({ token })}\n\n`);
      }
    );

    res.write(
      `data: ${JSON.stringify({
        done: true,
        model: result.model,
        recommendedProducts: result.recommendedProducts,
      })}\n\n`
    );
    res.end();
  } catch (error) {
    if (res.headersSent) {
      res.write(`data: ${JSON.stringify({ error: 'حدث خطأ أثناء بث الاستشارة' })}\n\n`);
      res.end();
    } else {
      next(error);
    }
  }
}

export async function getSuggestions(req: Request, res: Response): Promise<void> {
  const lang = req.query.lang === 'en' ? 'en' : 'ar';
  const suggestions = await aiService.getSuggestions(lang);
  res.json({
    success: true,
    data: suggestions,
  });
}

export function getStatus(_req: Request, res: Response): void {
  res.json({
    success: true,
    data: {
      configured: (process.env.GROQ_API_KEY ? true : aiService.isConfigured()),
      model: aiService.getModelName(),
      provider: 'Groq Cloud',
    },
  });
}
