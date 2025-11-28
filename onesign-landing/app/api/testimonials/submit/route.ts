import { NextResponse } from 'next/server';
import { rateLimit } from '@/app/lib/rateLimit';

/**
 * Testimonials Submission API Endpoint
 * Allows users to submit their testimonials
 */

interface TestimonialSubmission {
  name: string;
  email: string;
  company?: string;
  role?: string;
  rating: number;
  testimonial: string;
  allowPublic: boolean;
  consent: boolean;
}

const limiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // 3 submissions per hour
});

// In-memory storage (use database in production)
const testimonialsStore: (TestimonialSubmission & { id: string; submittedAt: string; status: string })[] = [];

export async function POST(request: Request) {
  try {
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const rateLimitResult = limiter(ip);

    if (!rateLimitResult.allowed) {
      return NextResponse.json(
        {
          error: 'Too many submissions. Please try again later.',
          resetTime: rateLimitResult.resetTime,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimitResult.resetTime.toString(),
          },
        }
      );
    }

    const body: TestimonialSubmission = await request.json();

    // Validation
    const errors: string[] = [];

    if (!body.name || body.name.trim().length < 2) {
      errors.push('Name must be at least 2 characters');
    }

    if (!body.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) {
      errors.push('Valid email is required');
    }

    if (!body.rating || body.rating < 1 || body.rating > 5) {
      errors.push('Rating must be between 1 and 5');
    }

    if (!body.testimonial || body.testimonial.trim().length < 20) {
      errors.push('Testimonial must be at least 20 characters');
    }

    if (body.testimonial && body.testimonial.length > 500) {
      errors.push('Testimonial must not exceed 500 characters');
    }

    if (!body.consent) {
      errors.push('You must agree to the terms and conditions');
    }

    if (errors.length > 0) {
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Store testimonial
    const testimonial = {
      id: `test_${Date.now()}`,
      ...body,
      submittedAt: new Date().toISOString(),
      status: 'pending', // pending, approved, rejected
    };

    testimonialsStore.push(testimonial);

    console.log('[Testimonials API] New submission:', {
      id: testimonial.id,
      name: body.name,
      rating: body.rating,
    });

    // In production: Send email notification to admin
    // In production: Add to moderation queue

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for your testimonial! It will be reviewed shortly.',
        id: testimonial.id,
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('[Testimonials API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Return approved testimonials only
    const approved = testimonialsStore.filter((t) => t.status === 'approved' && t.allowPublic);

    return NextResponse.json({
      testimonials: approved.map((t) => ({
        id: t.id,
        name: t.name,
        company: t.company,
        role: t.role,
        rating: t.rating,
        testimonial: t.testimonial,
        submittedAt: t.submittedAt,
      })),
      total: approved.length,
    });
  } catch (error) {
    console.error('[Testimonials API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
