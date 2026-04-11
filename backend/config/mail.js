const { Resend } = require("resend");
const resend = new Resend(process.env.RESEND_API_KEY);

module.exports = async ({ to, subject, html }) => {
  await resend.emails.send({
    from: "OaDiscuss <onboarding@resend.dev>", // allowed without domain setup
    to,
    subject,
    html,
  });
};
