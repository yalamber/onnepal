import { NextResponse } from 'next/server';
import { getFaqs, createFaq } from '@/lib/db/queries/faq';
import { getAuthenticatedBusiness } from '@/lib/helpers/business-auth';

export async function GET(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const items = await getFaqs(auth.db, auth.businessId);

    return NextResponse.json({ faqs: items });
  } catch (error) {
    console.error('Get FAQs error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const auth = await getAuthenticatedBusiness(request);
    if ('error' in auth) return auth.error;

    const body = (await request.json()) as { question?: string; answer?: string };

    if (!body.question || typeof body.question !== 'string') {
      return NextResponse.json({ error: 'Question is required' }, { status: 400 });
    }
    if (!body.answer || typeof body.answer !== 'string') {
      return NextResponse.json({ error: 'Answer is required' }, { status: 400 });
    }

    const result = await createFaq(auth.db, auth.businessId, {
      question: body.question,
      answer: body.answer,
    });

    return NextResponse.json({ success: true, id: result.id }, { status: 201 });
  } catch (error) {
    console.error('Create FAQ error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
