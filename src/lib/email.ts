import { remark } from "remark";
import remarkHtml from "remark-html";

const AUTOSEND_API_KEY = process.env.AUTOSEND_API_KEY;
const VERIFICATION_TEMPLATE_ID = process.env.VERIFICATION_TEMPLATE_ID;
const SITE_LINK = process.env.SITE_LINK;
const WELCOME_TEMPLATE_ID = process.env.WELCOME_TEMPLATE_ID;
const UNSUBSCRIBE_GROUP_ID = process.env.UNSUBSCRIBE_GROUP_ID;

export async function sendVerificationEmail(
  email: string,
  token: string,
  name?: string,
) {
  const response = await fetch("https://api.autosend.com/v1/mails/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTOSEND_API_KEY}`,
    },
    body: JSON.stringify({
      to: {
        email: email,
        name: name,
      },
      from: {
        email: "newsletter@mail.adarshdubey.com",
        name: "Adarsh Dubey",
      },
      templateId: VERIFICATION_TEMPLATE_ID,
      dynamicData: {
        name: name || email,
        link: `${SITE_LINK}/?verification-token=${token}`,
      },
      replyTo: {
        email: "dubeyadarshmain@gmail.com",
      },
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to send verification email");
  }
}

export async function sendWelcomeEmail(email: string, name?: string) {
  const response = await fetch("https://api.autosend.com/v1/mails/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${AUTOSEND_API_KEY}`,
    },
    body: JSON.stringify({
      to: {
        email: email,
        name: name,
      },
      from: {
        email: "newsletter@mail.adarshdubey.com",
        name: "Adarsh Dubey",
      },
      templateId: WELCOME_TEMPLATE_ID,
      dynamicData: {
        name: name || email,
      },
      replyTo: {
        email: "dubeyadarshmain@gmail.com",
      },
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to send welcome email");
  }
}

export async function markdownToHtml(markdown: string): Promise<string> {
  try {
    const result = await remark().use(remarkHtml).process(markdown);
    return String(result);
  } catch (error) {
    throw new Error(
      `Failed to convert markdown to HTML: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

function processImageStyles(html: string): string {
  // Add inline styles to all img tags for maximum email client compatibility
  // Exclude small images (emojis, tracking pixels) and tracking images
  return html.replace(/<img([^>]*)>/gi, (match, attributes) => {
    // Check if this is a small image or tracking pixel that should be excluded
    const isSmallImage = (attrs: string): boolean => {
      // Check for explicit width/height attributes that are small
      const widthMatch = attrs.match(/width\s*=\s*["']?(\d+)["']?/i);
      const heightMatch = attrs.match(/height\s*=\s*["']?(\d+)["']?/i);

      if (widthMatch && parseInt(widthMatch[1]) < 50) return true;
      if (heightMatch && parseInt(heightMatch[1]) < 50) return true;

      // Check for tracking-related classes/ids
      if (
        /class\s*=\s*["'][^"']*(?:track|pixel|beacon|spacer|hidden)[^"']*["']/i.test(
          attrs,
        )
      )
        return true;
      if (
        /id\s*=\s*["'][^"']*(?:track|pixel|beacon|spacer|hidden)[^"']*["']/i.test(
          attrs,
        )
      )
        return true;

      // Check for tracking-related src URLs
      const srcMatch = attrs.match(/src\s*=\s*["']([^"']+)["']/i);
      if (srcMatch) {
        const src = srcMatch[1].toLowerCase();
        if (
          src.includes("track") ||
          src.includes("pixel") ||
          src.includes("beacon") ||
          src.includes("analytics") ||
          src.includes("utm_") ||
          src.includes("spacer")
        ) {
          return true;
        }
      }

      // Check for style attributes that indicate small/hidden images
      const styleMatch = attrs.match(/style\s*=\s*["']([^"']+)["']/i);
      if (styleMatch) {
        const style = styleMatch[1].toLowerCase();
        if (style.includes("width:") && style.match(/width:\s*(\d+)px/i)) {
          const width = parseInt(style.match(/width:\s*(\d+)px/i)?.[1] || "0");
          if (width < 50) return true;
        }
        if (style.includes("height:") && style.match(/height:\s*(\d+)px/i)) {
          const height = parseInt(
            style.match(/height:\s*(\d+)px/i)?.[1] || "0",
          );
          if (height < 50) return true;
        }
        if (
          style.includes("display:none") ||
          style.includes("visibility:hidden")
        )
          return true;
      }

      return false;
    };

    // Skip styling for small/tracking images
    if (isSmallImage(attributes)) {
      return match;
    }

    // Check if style attribute already exists
    const hasStyle = /style\s*=/i.test(attributes);

    if (hasStyle) {
      // Append to existing style
      return match.replace(
        /style\s*=\s*["']([^"']*)["']/i,
        (_styleMatch, existingStyles) => {
          const newStyles = `max-width: 100%; width: 100%; height: auto; border-radius: 8px; border: 1px solid #e7e5e4; display: block; margin: 16px auto;`;
          return `style="${existingStyles} ${newStyles}"`;
        },
      );
    } else {
      // Add new style attribute
      const newStyles = `max-width: 100%; width: 100%; height: auto; border-radius: 8px; border: 1px solid #e7e5e4; display: block; margin: 16px auto;`;
      return `<img${attributes} style="${newStyles}">`;
    }
  });
}

function buildNewsletterHtml(contentHtml: string): string {
  // Process content HTML to add image styles
  const processedContent = processImageStyles(contentHtml);

  return `<!DOCTYPE html> <html lang="en" style="background-color: #fafaf9; font-family: system-ui, -apple-system, sans-serif; color: #0c0a09; margin: 0; padding: 0;"><head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    /* Only style images that don't have explicit small dimensions */
    img:not([width]):not([height]) {
      max-width: 100% !important;
      width: 100% !important;
      height: auto !important;
      border-radius: 8px !important;
      border: 1px solid #e7e5e4 !important;
      display: block !important;
      margin: 16px auto !important;
    }
    /* For images with dimensions, only apply if they're not small */
    img[width][height]:not([width="1"]):not([height="1"]):not([width="0"]):not([height="0"]) {
      max-width: 100% !important;
      height: auto !important;
    }
    @media only screen and (max-width: 600px) {
      .email-body {
        padding: 12px !important;
      }
      .email-content {
        padding: 20px !important;
      }
    }
    @media only screen and (min-width: 601px) {
      .email-body {
        padding: 32px !important;
      }
      .email-content {
        padding: 32px !important;
      }
    }
  </style>
</head><body class="email-body" style="background-color: #fafaf9; margin: 0; padding: 12px;">
  <table width="100%" cellspacing="0" cellpadding="0" style="max-width: 680px; margin: 0 auto;">
    <tbody><tr>
      <td class="email-content" style="background-color: #f5f5f4; border: 1px solid #e7e5e4; border-radius: 12px; padding: 20px;">
        
          <h2 style="margin: 0; font-weight: 600;">Adarsh's Newsletter</h2>
          <p style="margin: 4px 0 0 0; font-size: 14px; color: #78716c;">A letter from Adarsh — straight to your inbox
          </p>
        

        
          ${processedContent}
        

        
          <hr style="border: none; border-top: 1px solid #e7e5e4; margin-bottom: 16px;">
          <p style="font-size: 13px; color: #78716c; margin: 0;">
            You're receiving this because you subscribed to <strong>Adarsh's Newsletter</strong>.
            <br>
              <a href="{{unsubscribe}}">unsubscribe</a>
          </p>
          <p style="margin-top: 16px; font-size: 13px;">
            — Adarsh
            <br>
            <a href="https://adarshdubey.com" style="color: #0c0a09; text-decoration: none;">adarshdubey.com</a>
          </p>
        
      </td>
    </tr>
  </tbody></table>

</body></html>`;
}

interface Recipient {
  email: string;
  name?: string;
}

function chunkArray<T>(array: T[], chunkSize: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
}

export async function sendNewsletterBulk(
  recipients: Recipient[],
  issueTitle: string,
  contentHtml: string,
): Promise<void> {
  const html = buildNewsletterHtml(contentHtml);
  const recipientChunks = chunkArray(recipients, 100);

  // Send each chunk serially
  for (const chunk of recipientChunks) {
    const response = await fetch("https://api.autosend.com/v1/mails/bulk", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AUTOSEND_API_KEY}`,
      },
      body: JSON.stringify({
        recipients: chunk.map((r) => ({
          email: r.email,
          name: r.name,
        })),
        from: {
          email: "newsletter@mail.adarshdubey.com",
          name: "Adarsh Dubey",
        },
        subject: `${issueTitle} - Adarsh's Newsletter`,
        html: html,
        replyTo: {
          email: "dubeyadarshmain@gmail.com",
          name: "Adarsh Dubey",
        },
        unsubscribeGroupId: UNSUBSCRIBE_GROUP_ID,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to send newsletter batch: ${response.status} ${errorText}`,
      );
    }
  }
}
