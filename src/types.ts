type responseDataFormat = {
  channel: GoogleAppsScript.YouTube.Schema.Subscription;
  videos: GoogleAppsScript.YouTube.Schema.SearchResult[];
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

export type { responseDataFormat, channelVideosDataFormat, formattedDataFormat };
