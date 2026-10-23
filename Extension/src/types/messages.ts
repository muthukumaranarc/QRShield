import { UrlAnalysisResponse } from './analysis';

export interface PageAnalysisMessage {
  type: 'QRSHIELD_PAGE_ANALYSIS';
  payload: UrlAnalysisResponse;
}

export interface GetAnalysisForUrlMessage {
  type: 'GET_ANALYSIS_FOR_URL';
  url: string;
  tabId?: number;
}

export interface ReanalyzeUrlMessage {
  type: 'REANALYZE_URL';
  url: string;
  tabId?: number;
}

export type ExtensionRuntimeMessage =
  | PageAnalysisMessage
  | GetAnalysisForUrlMessage
  | ReanalyzeUrlMessage;
