import { YouTubeUtilities } from "./youtube";
import { EmailUtilities } from "./email";

function main() {
  const _YouTubeUtilities = new YouTubeUtilities();
  const _EmailUtilities = new EmailUtilities();

  const formattedData = _YouTubeUtilities.run();

  const mailInfo = {
    subject: "Subscribed YouTube channels' new videos reminder",
    htmlPath: "template.html",
    mailData: formattedData,
  };
  _EmailUtilities.sendMail(mailInfo.subject, mailInfo.htmlPath, mailInfo.mailData);
}

export { main };
