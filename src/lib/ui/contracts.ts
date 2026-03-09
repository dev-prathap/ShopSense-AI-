export type OnboardingState = {
  connected: boolean;
  knowledgeStatus: "idle" | "discovering" | "fetching" | "summarizing" | "publishing" | "ready" | "failed";
  publishedSources: number;
  lastTrainedAt: string | null;
  canComplete: boolean;
};

export type SyncHealthSnapshot = {
  products: number;
  inStockProducts: number;
  variants: number;
  ordersCached: number;
  knowledgeSourcesTotal: number;
  knowledgePublished: number;
  knowledgeChunks: number;
  lastCatalogUpdateAt: Date | null;
  lastKnowledgeFetchAt: Date | null;
  lastKnowledgePublishedAt: Date | null;
};
