import { NextRequest, NextResponse } from 'next/server';
import { 
  addWaitlistEntry, 
  checkEmailExists, 
  checkRateLimit, 
  getClientIP 
} from '@/lib/db';
import { render } from "@react-email/render";
import WelcomeTemplate from "../../../emails";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const { name, email } = await request.json();
    const clientIP = getClientIP(request);

    // Validate input
    if (!name || !email) {
      return NextResponse.json(
        { error: "Name and email are required" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check rate limit
    const isRateLimited = await checkRateLimit(clientIP);
    if (!isRateLimited) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Check if email already exists
    const emailExists = await checkEmailExists(email);
    if (emailExists) {
      return NextResponse.json(
        { error: "Email already registered on waitlist" },
        { status: 409 }
      );
    }

    // Add to waitlist database
    const waitlistEntry = await addWaitlistEntry({ name, email });

    // Send welcome email
    try {
      await resend.emails.send({
        from: "Lakshay<hello@waitlist.lakshb.dev>",
        to: [email],
        subject: "Thank you for joining our waitlist!",
        reply_to: "lakshb.work@gmail.com",
        html: await render(WelcomeTemplate({ userFirstname: name })),
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Don't fail the entire request if email fails
    }

    return NextResponse.json({
      success: true,
      message: "Successfully added to waitlist",
      position: waitlistEntry.position
    });

  } catch (error) {
    console.error('Waitlist submission error:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// GET endpoint to check waitlist stats (for admin purposes)
export async function GET() {
  try {
    const { getWaitlistStats } = await import('@/lib/db');
    const stats = await getWaitlistStats();
    
    return NextResponse.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching waitlist stats:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
} 