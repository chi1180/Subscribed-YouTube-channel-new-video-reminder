import type { formattedDataFormat } from "./types";

class EmailUtilities {
  addresses: string[] = [];

  constructor() {
    this.addresses = this.getSettingData();
  }

  getSettingData() {
    const set_addresses = PropertiesService.getScriptProperties().getProperty("email_addresses");
    if (set_addresses) return JSON.parse(set_addresses);
    throw new Error(
      "Couldn't find property `email_addresses`. Please check your Google Apps Script project settings.",
    );
  }
  //
  // HTML mail creation method
  //
  renderHtmlMail(htmlPath: string, mailData: formattedDataFormat) {
    const template = HtmlService.createTemplateFromFile(htmlPath);
    template.mailData = mailData;
    return template.evaluate().getContent();
  }
  //
  // Mail sender method *main called method
  //
  sendMail(subject: string, htmlPath: string, mailData: formattedDataFormat) {
    console.log("[--INFO--] Generate html content...");
    const htmlContent = this.renderHtmlMail(htmlPath, mailData);

    console.log("[--INFO--] Send email...");
    this.addresses.map((recipient) => {
      GmailApp.sendEmail(recipient, subject, "", {
        htmlBody: htmlContent,
      });
    });

    console.log("[--INFO--] Successfully finished EmailUtilities.sendMail()");
  }
}

export { EmailUtilities };
