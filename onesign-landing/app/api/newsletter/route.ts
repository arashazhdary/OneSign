import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Here you would typically:
    // 1. Add email to your newsletter service (Mailchimp, SendGrid, etc.)
    // 2. Store the subscription in a database
    // 3. Send a welcome email

    // For now, we'll just log it and return success
    console.log('Newsletter subscription:', {
      email,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown',
      userAgent: request.headers.get('user-agent') || 'unknown',
    });

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Check if email already exists (mock check)
    // In production, you'd check your database
    const existingEmails = ['test@example.com']; // Mock data
    if (existingEmails.includes(email)) {
      return NextResponse.json(
        { error: 'This email is already subscribed' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Thank you for subscribing! Check your inbox for a confirmation email.',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// OPTIONS handler for CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
