export interface ChatMessageDto {
  message: string;
  conversationId?: string;
}

export interface ConversationState {
  eventName?: string;
  subheading?: string;
  description?: string;
  bannerImageUrl?: string;
  timezone?: string;
  startDate?: string;
  endDate?: string;
  vanishDate?: string;
  roles?: string[];
  userConfirmedFinalization?: boolean;
}
export interface ChatSuggestion {
  type: "timezone" | "roles";
  options: string[];
}

export interface ChatResponse {
  reply: string;
  conversationId: string;
  conversationState: ConversationState;
  missingFields: string[];
  completed: boolean;
  suggestions?: ChatSuggestion;
}
