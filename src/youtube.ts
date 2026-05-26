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

  getUploadsPlaylistId(channelId: string) {
    const result = YouTube.Channels?.list("contentDetails", {
      id: channelId,
    });

    const uploadsPlaylistId = result?.items?.[0]?.contentDetails?.relatedPlaylists?.uploads || "";

    if (!uploadsPlaylistId) {
      console.warn(`[--WARN--] Could not get uploads playlist for channel: ${channelId}`);
    }

    return uploadsPlaylistId;
  }

  private getCachedUploadsPlaylistId(channelId: string) {
    const cache = CacheService.getUserCache();
    const cacheKey = `uploads_playlist_${channelId}`;

    const cached = cache.get(cacheKey);
    if (cached) {
      console.log(`[--INFO--] Cache hit for uploads playlist: ${channelId}`);
      return cached;
    }

    const uploadsPlaylistId = this.getUploadsPlaylistId(channelId);

    if (uploadsPlaylistId) {
      cache.put(cacheKey, uploadsPlaylistId, 21600);
    }

    return uploadsPlaylistId;
  }

  getNewVideos(uploadsPlaylistId: string, since: Date) {
    if (!uploadsPlaylistId) {
      console.warn("[--WARN--] Empty uploads playlist ID provided");
      return [];
    }

    let nextPageToken = "";
    const videos: GoogleAppsScript.YouTube.Schema.PlaylistItem[] = [];
    let pageCount = 0;
    const MAX_PAGES = 10;

    do {
      const result = YouTube.PlaylistItems?.list("snippet,contentDetails,status", {
        playlistId: uploadsPlaylistId,
        maxResults: 50,
        pageToken: nextPageToken,
      });

      const items = result?.items || [];
      const filteredItems = items.filter((item) => {
        const videoId = item.contentDetails?.videoId || "";
        const publishedAt = new Date(item.contentDetails?.videoPublishedAt || "");
        const isPublic = item.status?.privacyStatus !== "private";
        return Boolean(videoId) && isPublic && publishedAt > since;
      });

      videos.push(...filteredItems);

      const oldestOnPage = items[items.length - 1]?.contentDetails?.videoPublishedAt || "";
      if (oldestOnPage && new Date(oldestOnPage) <= since) {
        break;
      }

      nextPageToken = result?.nextPageToken || "";
      pageCount++;

      if (pageCount >= MAX_PAGES) {
        console.warn(`[--WARN--] Reached pagination limit (${MAX_PAGES}) for playlist ${uploadsPlaylistId}`);
        break;
      }
    } while (nextPageToken.length > 0);

    return videos;
  }

  getAllChannelsNewVideos(channels: GoogleAppsScript.YouTube.Schema.Subscription[], since: Date) {
    const responseData: responseDataFormat = [];

    for (const channel of channels) {
      const channelId: string = channel.snippet?.resourceId?.channelId || ""; // I mistook it to my channel ID... :(
      if (!channelId) {
        console.warn("[--WARN--] Found subscription without channel ID");
        continue;
      }

      const uploadsPlaylistId = this.getCachedUploadsPlaylistId(channelId);
      if (!uploadsPlaylistId) {
        console.warn(`[--WARN--] Could not retrieve uploads playlist for channel: ${channelId}`);
        continue;
      }

      const channelVideos = this.getNewVideos(uploadsPlaylistId, since);
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
        const videoId =
          (video as GoogleAppsScript.YouTube.Schema.SearchResult).id?.videoId ||
          (video as GoogleAppsScript.YouTube.Schema.PlaylistItem).contentDetails?.videoId ||
          (video as GoogleAppsScript.YouTube.Schema.PlaylistItem).snippet?.resourceId?.videoId ||
          "";
        if (!videoId) {
          continue;
        }

        const videoInfo = {
          title: this.decodeHtmlSpecialCode(video.snippet?.title || "Untitled video"),
          link: `https://www.youtube.com/watch?v=${videoId}`,
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
