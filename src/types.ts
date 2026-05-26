type VideoResult =
  | GoogleAppsScript.YouTube.Schema.SearchResult
  | GoogleAppsScript.YouTube.Schema.PlaylistItem;

type responseDataFormat = {
  channel: GoogleAppsScript.YouTube.Schema.Subscription;
  videos: VideoResult[];
}[];

type channelVideosDataFormat = {
  link: string;
  title: string;
  description: string;
}[];

type formattedDataFormat = {
  channelTitle: string;
  videos: channelVideosDataFormat;
}[];

export type { responseDataFormat, channelVideosDataFormat, formattedDataFormat, VideoResult };
