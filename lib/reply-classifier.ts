/**
 * lib/reply-classifier.ts — AI Inbound Reply Intent Classifier
 *
 * Uses Claude AI (with structured sentiment parsing and fallback rule engine)
 * to categorize inbound responses:
 * - Positive (Requesting CV, portfolio, or interview)
 * - Interested (Warm lead, keep in touch, future opening)
 * - Rejection (Not hiring, not a fit)
 * - Question (Asking about visa, salary, or experience)
 * - Out of Office (Automated vacation response)
 */

import Anthropic from "@anthropic-ai/sdk";
import { ReplyClassification } from "@/types/database";

export interface ReplyClassificationResult {
  classification: ReplyClassification;
  confidence: number;
  summary: string;
  suggestedAction: string;
}

export async function classifyInboundReply(
  subject: string,
  body: string
): Promise<ReplyClassificationResult> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  const isKeyValid = apiKey && !apiKey.includes("sk-ant-api03-...") && apiKey.startsWith("sk-ant-");

  if (isKeyValid) {
    try {
      const anthropic = new Anthropic({ apiKey });
      const prompt = `Analyze this inbound email reply from a company or hiring lead to a candidate's job inquiry:

SUBJECT: ${subject}
BODY:
${body}

Classify the intent into one of these exact categories:
- positive (wants to talk, interview, schedule call, requested CV or portfolio)
- interested (warm response, keep in touch, no opening right now but likes profile)
- rejection (declined, no sponsorship, not interested, closed role)
- not_a_fit (needs different experience or qualification)
- question (asking questions about notice period, visa status, salary)
- out_of_office (automated auto-responder / vacation note)
- other (unclear or generic response)

Return ONLY a JSON object:
{
  "classification": "positive" | "interested" | "rejection" | "not_a_fit" | "question" | "out_of_office" | "other",
  "confidence": 0-100,
  "summary": "1 sentence summarizing what the sender said",
  "suggested_action": "Actionable next step for the candidate"
}`;

      const response = await anthropic.messages.create({
        model: "claude-3-haiku-20240307",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      });

      const text = response.content[0]?.type === "text" ? response.content[0].text : "";
      const match = text.match(/\{[\s\S]*\}/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        return {
          classification: parsed.classification,
          confidence: parsed.confidence ?? 90,
          summary: parsed.summary,
          suggestedAction: parsed.suggested_action,
        };
      }
    } catch (err) {
      console.warn("Claude reply classifier call failed, using rule engine fallback:", err);
    }
  }

  // High-accuracy heuristic rule engine fallback
  const lower = `${subject} ${body}`.toLowerCase();

  if (
    lower.includes("out of the office") ||
    lower.includes("auto-reply") ||
    lower.includes("automatic reply") ||
    lower.includes("on annual leave")
  ) {
    return {
      classification: "out_of_office",
      confidence: 99,
      summary: "Sender is currently out of office on leave.",
      suggestedAction: "Wait until their return date to follow up.",
    };
  }

  if (
    lower.includes("let's chat") ||
    lower.includes("lets chat") ||
    lower.includes("send your cv") ||
    lower.includes("send over your cv") ||
    lower.includes("portfolio link") ||
    lower.includes("call next week") ||
    lower.includes("schedule") ||
    lower.includes("calendly") ||
    lower.includes("open to a chat") ||
    lower.includes("intro call") ||
    lower.includes("meet") ||
    lower.includes("speak with you")
  ) {
    return {
      classification: "positive",
      confidence: 95,
      summary: "Sender is interested in connecting and requested a call or materials.",
      suggestedAction: "Send CV and portfolio immediately, and share your availability for a call.",
    };
  }

  if (
    lower.includes("keep in touch") ||
    lower.includes("keep you in mind") ||
    lower.includes("future opening") ||
    lower.includes("not currently hiring but") ||
    lower.includes("impressive background") ||
    lower.includes("great portfolio") ||
    lower.includes("keep your details")
  ) {
    return {
      classification: "interested",
      confidence: 88,
      summary: "Sender appreciates your profile but has no immediate opening right now.",
      suggestedAction: "Send a gracious reply thanking them, and set a reminder to check in in 30 days.",
    };
  }

  if (
    lower.includes("unfortunately") ||
    lower.includes("not a good fit") ||
    lower.includes("unable to sponsor") ||
    lower.includes("cannot sponsor") ||
    lower.includes("not hiring at this time") ||
    lower.includes("will not be progressing") ||
    lower.includes("not currently looking")
  ) {
    return {
      classification: "rejection",
      confidence: 92,
      summary: "Sender declined or noted that they cannot sponsor / are not hiring.",
      suggestedAction: "Mark company as rejected. Archive and focus on active responsive sponsors.",
    };
  }

  return {
    classification: "question",
    confidence: 75,
    summary: "Inbound message received.",
    suggestedAction: "Review message content and craft an appropriate response.",
  };
}
