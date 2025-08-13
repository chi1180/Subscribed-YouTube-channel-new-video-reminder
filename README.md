# Subscribed YouTube channels' new videos reminder

This GAS project is designed to send reminders to subscribed YouTube channels when they upload new videos. It
utilizes the Google Apps Script platform to automate the process and send notifications via email.

# To use

1. Clone this repository

2. Run below:

```bash
npm install
npm run login ## You need to login your Google account
npm run push
```

3. Then, you can find the script in your Google apps script page.

4. Go to the script editor and make new HTML file named "template"

5. Copy html code from this repository's "src/template.html" and paste it into the HTML file in GAS editor.

6. Set script property `emailaddress` at GAS project setting page.

_example: ["example@domain.com"]_

↑need to be array of string

7. Back to editor and click [Add a service] button on left side panel and select "YouTube Data API"

8. Click [Run] button.

opusionaly, you can add trigger in GAS project trigger page.

# Used template

Thank to [template repository](https://github.com/iansan5653/gas-ts-template)
