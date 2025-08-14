import type { channelVideosDataFormat, formattedDataFormat, responseDataFormat } from "./types";

class YouTubeUtilities {
  //
  // New video getting methods
  //
  getSubscribedChannels() {
    let nextPageToken = "";
    const channels: GoogleAppsScript.YouTube.Schema.Subscription[] = [];

    do {
      const result = YouTube.Subscriptions?.list("snippet", {
        mine: true,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      const result_channels = result?.items || [];
      channels.push(...result_channels);

      nextPageToken = result?.nextPageToken || "";
    } while (nextPageToken.length > 0);

    return channels;
  }

  getNewVideos(channelId: string, since: Date) {
    let nextPageToken = "";
    const videos: GoogleAppsScript.YouTube.Schema.SearchResult[] = [];

    do {
      const result = YouTube.Search?.list("snippet", {
        type: "video",
        channelId: channelId,
        maxResults: 50,
        order: "date",
        pageToken: nextPageToken,
        publishedAfter: since.toISOString(),
      });

      const result_videos = result?.items || [];
      videos.push(...result_videos);

      nextPageToken = result?.nextPageToken || "";
    } while (nextPageToken.length > 0);

    return videos;
  }

  getAllChannelsNewVideos(channels: GoogleAppsScript.YouTube.Schema.Subscription[], since: Date) {
    const responseData: responseDataFormat = [];

    for (const channel of channels) {
      const channelId: string = channel.snippet?.resourceId?.channelId || ""; // I mistook it to my channel ID... :(
      const channelVideos = this.getNewVideos(channelId, since);
      const hasNewVideo = channelVideos.length > 0;
      if (hasNewVideo) {
        responseData.push({
          channel: channel,
          videos: channelVideos,
        });
      }
    }

    return responseData;
  }
  //
  // Data formatting methods
  //
  /* HTML special code decoder */
  decodeHtmlSpecialCode(text: string) {
    return text
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&#x27;/g, "'");
  }
  /* Main formattor */
  responseDataFormattor(searchData: responseDataFormat) {
    const response: formattedDataFormat = [];
    for (const data of searchData) {
      const channelTitle =
        data.channel.snippet?.channelTitle || data.channel.snippet?.title || "Untitled channel";
      const videos: channelVideosDataFormat = [];

      for (const video of data.videos) {
        const videoInfo = {
          title: this.decodeHtmlSpecialCode(video.snippet?.title || "Untitled video"),
          link: `https://www.youtube.com/watch?v=${video.id?.videoId || ""}`,
          description: this.decodeHtmlSpecialCode(video.snippet?.description || "No description available"),
        };
        videos.push(videoInfo);
      }

      response.push({
        channelTitle: this.decodeHtmlSpecialCode(channelTitle),
        videos: videos,
      });
    }

    return response;
  }
  //
  // Main calling method
  //
  run() {
    console.log("[--INFO--] Getting subscribed YouTube channels...");
    const channels = this.getSubscribedChannels();

    console.log("[--INFO--] Getting new videos...");
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const responseData = this.getAllChannelsNewVideos(channels, yesterday);

    console.log("[--INFO--] Formatting new videos data...");
    const formattedData = this.responseDataFormattor(responseData);

    console.log("[--INFO--] Successfully finished YouTubeUtilities.run()");

    return formattedData;
  }
}

export { YouTubeUtilities };
