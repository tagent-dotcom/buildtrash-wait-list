"use client";

import { toast } from "sonner";
import { useState } from "react";
import CTA from "@/components/cta";
import Form from "@/components/form";
import Logos from "@/components/logos";
import Particles from "@/components/ui/particles";
import Header from "@/components/header";
import Footer from "@/components/footer";

export default function Home() {
  const [name, setName] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  const handleEmailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(event.target.value);
  };

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async () => {
    if (!name || !email) {
      toast.error("Please fill in all fields 😠");
      return;
    }

    if (!isValidEmail(email)) {
      toast.error("Please enter a valid email address 😠");
      return;
    }

    setLoading(true);

    const promise = new Promise(async (resolve, reject) => {
      try {
        // First, attempt to send the email
        const mailResponse = await fetch("/api/mail", {
          cache: "no-store",
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firstname: name, email }),
        });

        if (!mailResponse.ok) {
          if (mailResponse.status === 429) {
            reject("Rate limited");
          } else {
            reject("Email sending failed");
          }
          return; // Exit the promise early if mail sending fails
        }

        // If email sending is successful, proceed to insert into Notion
        const notionResponse = await fetch("/api/notion", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name, email }),
        });

        if (!notionResponse.ok) {
          if (notionResponse.status === 429) {
            reject("Rate limited");
          } else {
            reject("Notion insertion failed");
          }
        } else {
          resolve({ name });
        }
      } catch (error) {
        reject(error);
      }
    });

    toast.promise(promise, {
      loading: "Getting you on the waitlist... 🚀",
      success: (data) => {
        setName("");
        setEmail("");
        return "Thank you for joining the waitlist 🎉";
      },
      error: (error) => {
        if (error === "Rate limited") {
          return "You're doing that too much. Please try again later";
        } else if (error === "Email sending failed") {
          return "Failed to send email. Please try again 😢.";
        } else if (error === "Notion insertion failed") {
          return "Failed to save your details. Please try again 😢.";
        }
        return "An error occurred. Please try again 😢.";
      },
    });

    promise.finally(() => {
      setLoading(false);
    });
  };

  return (
    <main className="flex min-h-screen flex-col items-center overflow-x-clip pt-44 md:pt-24">
      <section className="flex flex-col items-center px-4 sm:px-6 lg:px-8">
        <Header />

        <CTA />

        <Form
          name={name}
          email={email}
          handleNameChange={handleNameChange}
          handleEmailChange={handleEmailChange}
          handleSubmit={handleSubmit}
          loading={loading}
        />
        {/* Discord server link */}
        <div className="mt-4 flex items-center gap-2 text-gray-500">
          <a
            href="https://discord.gg/xcJtC3V6QJ"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width={24}
              height={24}
              viewBox="0 0 24 24">
              <path
                fill="gray"
                d="M18.942 5.556a16.3 16.3 0 0 0-4.126-1.3a12 12 0 0 0-.529 1.1a15.2 15.2 0 0 0-4.573 0a12 12 0 0 0-.535-1.1a16.3 16.3 0 0 0-4.129 1.3a17.4 17.4 0 0 0-2.868 11.662a15.8 15.8 0 0 0 4.963 2.521q.616-.847 1.084-1.785a10.6 10.6 0 0 1-1.706-.83q.215-.16.418-.331a11.66 11.66 0 0 0 10.118 0q.206.172.418.331q-.817.492-1.71.832a12.6 12.6 0 0 0 1.084 1.785a16.5 16.5 0 0 0 5.064-2.595a17.3 17.3 0 0 0-2.973-11.59M8.678 14.813a1.94 1.94 0 0 1-1.8-2.045a1.93 1.93 0 0 1 1.8-2.047a1.92 1.92 0 0 1 1.8 2.047a1.93 1.93 0 0 1-1.8 2.045m6.644 0a1.94 1.94 0 0 1-1.8-2.045a1.93 1.93 0 0 1 1.8-2.047a1.92 1.92 0 0 1 1.8 2.047a1.93 1.93 0 0 1-1.8 2.045"
                strokeWidth={0.5}
                stroke="#070e22"></path>
            </svg>
            <span>Join Discord server</span>
          </a>
        </div>
      </section>

      <Footer />

      <Particles
        quantityDesktop={350}
        quantityMobile={100}
        ease={80}
        color={"#F7FF9B"}
        refresh
      />
    </main>
  );
}
