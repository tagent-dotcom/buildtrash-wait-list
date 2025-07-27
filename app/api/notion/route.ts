import { Client } from "@notionhq/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  try {
    const notion = new Client({ auth: process.env.NOTION_SECRET });
    const response = await notion.pages.create({
      parent: {
        database_id: `${process.env.NOTION_DB}`,
      },
      properties: {
        email: {
          type: "email",
          email: body?.email,
        },
        Name: {
          type: "title",
          title: [
            {
              type: "text",
              text: {
                content: body?.name,
              },
            },
          ],
        },
      },
    });

    if (!response) {
      throw new Error("Failed to add email to Notion");
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Notion API Error:", error);
    
    // Return more detailed error information
    if (error instanceof Error) {
      return NextResponse.json({ 
        success: false, 
        error: error.message,
        details: error.toString()
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: false, 
      error: "Unknown error occurred",
      details: String(error)
    }, { status: 500 });
  }
}
