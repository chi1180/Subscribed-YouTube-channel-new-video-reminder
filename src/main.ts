import { EmailUtilities } from "./email";
import { YouTubeUtilities } from "./youtube";

function main() {
  const _YouTubeUtilities = new YouTubeUtilities();
  const _EmailUtilities = new EmailUtilities();

  const formattedData = _YouTubeUtilities.run();

  const is_newVideosAvailable = formattedData.length > 0;
  if (is_newVideosAvailable) {
    const mailInfo = {
      subject: "Subscribed YouTube channels' new videos reminder",
      htmlPath: "template.html",
      mailData: formattedData,
    };
    _EmailUtilities.sendMail(mailInfo.subject, mailInfo.htmlPath, mailInfo.mailData);
  } else {
    console.log("[--INFO--] There are no new videos from your subscribing YouTube channels...");
  }
}

export { main };
