const AUTOSEND_API_KEY = process.env.AUTOSEND_API_KEY;
const VERIFICATION_TEMPLATE_ID = process.env.VERIFICATION_TEMPLATE_ID;
const SITE_LINK = process.env.SITE_LINK;

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
      test: true,
    }),
  });
  if (!response.ok) {
    throw new Error("Failed to send verification email");
  }
}
