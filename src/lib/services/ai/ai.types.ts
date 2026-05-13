export interface ExtractedEventData {
  eventName: string;
  subheading?: string;
  description?: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  vanishDate?: string;
  roles?: string[];
}

export interface ConversationContext {
  eventName?: string;
  subheading?: string;
  description?: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  vanishDate?: string;
  roles?: string[];
}
