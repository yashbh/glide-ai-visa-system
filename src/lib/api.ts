import { supabase } from "./supabase";

interface ChatRequest {
  conversation_id: string;
  message: string;
}

interface ChatResponse {
  reply: string;
  error?: string;
}

const MOCK_RESPONSES: Record<string, string> = {
  default: `Great! I'd be happy to help you with your visa application. 🇩🇪

Let's start by going through the key requirements. First, let me ask about your **finances**:

**Bank Balance**: For a Germany Schengen tourist visa, it's recommended to show at least ₹5,00,000 in your savings account, maintained for the last 3 months.

How much balance do you currently have in your bank account?`,
  low_balance: `I see — ₹2,00,000 is below the typical recommended amount of ₹5,00,000.

Here's what you can do:
• **Show additional assets**: Fixed deposits, mutual fund statements, or PPF balance can supplement your savings
• **Get a sponsor**: A family member with sufficient funds can sponsor your trip with a sponsorship letter
• **Build up over time**: If your trip is a few months away, you have time to accumulate more

Would you like to explore any of these options? Meanwhile, let me ask about your **employment** — are you currently employed? If yes, can your employer provide a letter confirming your leave?`,
  employed: `That's great — being employed strengthens your application significantly.

Here's what you'll need from your employer:
• **Employment letter** on company letterhead confirming your position, salary, and that leave is approved
• **Leave approval** document matching your travel dates
• **Last 3 salary slips** as proof of regular income

Can your HR department provide these? Most companies are familiar with the format needed for visa applications.

Next, let me ask about your **passport** — when does it expire, and how many blank pages do you have?`,
  passport: `Your passport validity looks good.

For a Schengen visa, you need:
• At least **3 months validity** beyond your planned return date ✓
• At least **2 blank pages** for the visa sticker

Now let's talk about **travel arrangements**:
• Have you booked your flights yet? (Refundable bookings work fine)
• Where are you planning to stay — hotel, Airbnb, or with someone?
• Which cities in Germany do you plan to visit?`,
};

function getMockResponse(message: string): string {
  const lower = message.toLowerCase();
  if (lower.includes("2 lakh") || lower.includes("200000") || lower.includes("2,00") || lower.includes("two lakh")) {
    return MOCK_RESPONSES.low_balance;
  }
  if (lower.includes("employed") || lower.includes("job") || lower.includes("work") || lower.includes("salaried") || lower.includes("company")) {
    return MOCK_RESPONSES.employed;
  }
  if (lower.includes("passport") || lower.includes("expire") || lower.includes("valid") || lower.includes("2032") || lower.includes("2030")) {
    return MOCK_RESPONSES.passport;
  }
  return MOCK_RESPONSES.default;
}

export async function sendChatMessage(request: ChatRequest): Promise<ChatResponse> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;

  // If no Supabase URL configured, use mock mode
  if (!supabaseUrl || supabaseUrl === "https://placeholder.supabase.co") {
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return { reply: getMockResponse(request.message) };
  }

  const { data: { session } } = await supabase.auth.getSession();

  if (!session) {
    return { reply: "", error: "Not authenticated" };
  }

  const response = await fetch(`${supabaseUrl}/functions/v1/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify(request),
  });

  if (!response.ok) {
    const errorText = await response.text();
    return { reply: "", error: errorText || "Chat request failed" };
  }

  const data = await response.json();
  return { reply: data.reply, error: undefined };
}
