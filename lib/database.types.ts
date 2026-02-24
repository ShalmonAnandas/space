export type Database = {
  public: {
    Tables: {
      User: {
        Row: {
          id: string;
          username: string;
          passwordHash: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          username: string;
          passwordHash: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          username?: string;
          passwordHash?: string;
          createdAt?: string;
        };
        Relationships: [];
      };
      Space: {
        Row: {
          id: string;
          name: string;
          userId1: string;
          userId2: string | null;
          suttaEnabled: boolean;
          createdAt: string;
        };
        Insert: {
          id?: string;
          name: string;
          userId1: string;
          userId2?: string | null;
          suttaEnabled?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: string;
          name?: string;
          userId1?: string;
          userId2?: string | null;
          suttaEnabled?: boolean;
          createdAt?: string;
        };
        Relationships: [];
      };
      Invite: {
        Row: {
          id: string;
          spaceId: string;
          creatorId: string;
          createdAt: string;
        };
        Insert: {
          id?: string;
          spaceId: string;
          creatorId: string;
          createdAt?: string;
        };
        Update: {
          id?: string;
          spaceId?: string;
          creatorId?: string;
          createdAt?: string;
        };
        Relationships: [];
      };
      PushSubscription: {
        Row: {
          id: number;
          userId: string;
          subscription: Record<string, unknown>;
        };
        Insert: {
          id?: number;
          userId: string;
          subscription: Record<string, unknown>;
        };
        Update: {
          id?: number;
          userId?: string;
          subscription?: Record<string, unknown>;
        };
        Relationships: [];
      };
      Notice: {
        Row: {
          id: string;
          spaceId: string;
          authorId: string;
          content: string;
          seen: boolean;
          isEdited: boolean;
          createdAt: string;
        };
        Insert: {
          id?: string;
          spaceId: string;
          authorId: string;
          content: string;
          seen?: boolean;
          isEdited?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: string;
          spaceId?: string;
          authorId?: string;
          content?: string;
          seen?: boolean;
          isEdited?: boolean;
          createdAt?: string;
        };
        Relationships: [];
      };
      Gossip: {
        Row: {
          id: string;
          spaceId: string;
          authorId: string;
          content: string;
          seen: boolean;
          reacted: boolean;
          createdAt: string;
        };
        Insert: {
          id?: string;
          spaceId: string;
          authorId: string;
          content: string;
          seen?: boolean;
          reacted?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: string;
          spaceId?: string;
          authorId?: string;
          content?: string;
          seen?: boolean;
          reacted?: boolean;
          createdAt?: string;
        };
        Relationships: [];
      };
      Mood: {
        Row: {
          id: number;
          spaceId: string;
          userId: string;
          mood: string;
          createdAt: string;
        };
        Insert: {
          id?: number;
          spaceId: string;
          userId: string;
          mood: string;
          createdAt?: string;
        };
        Update: {
          id?: number;
          spaceId?: string;
          userId?: string;
          mood?: string;
          createdAt?: string;
        };
        Relationships: [];
      };
      DailyClick: {
        Row: {
          id: number;
          spaceId: string;
          userId: string;
          type: string;
          createdAt: string;
        };
        Insert: {
          id?: number;
          spaceId: string;
          userId: string;
          type: string;
          createdAt?: string;
        };
        Update: {
          id?: number;
          spaceId?: string;
          userId?: string;
          type?: string;
          createdAt?: string;
        };
        Relationships: [];
      };
      NotificationQueue: {
        Row: {
          id: number;
          userId: string;
          spaceId: string;
          type: string;
          content: Record<string, unknown>;
          read: boolean;
          createdAt: string;
        };
        Insert: {
          id?: number;
          userId: string;
          spaceId: string;
          type: string;
          content: Record<string, unknown>;
          read?: boolean;
          createdAt?: string;
        };
        Update: {
          id?: number;
          userId?: string;
          spaceId?: string;
          type?: string;
          content?: Record<string, unknown>;
          read?: boolean;
          createdAt?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
  };
};
