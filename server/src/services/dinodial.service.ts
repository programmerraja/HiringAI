import axios, { AxiosInstance, AxiosError } from 'axios';
import config from '../config/config';
import { logger } from '../utils/logger';
import {
  DinodialMakeCallRequest,
  DinodialCallResponse,
  DinodialCallDetail,
  EvaluationTool,
} from '../types/dinodial.types';

/**
 * Service class for all Dinodial API communication.
 * Implements the backend proxy pattern to secure credentials.
 */
class DinodialService {
  private client: AxiosInstance;

  constructor() {
    this.client = axios.create({
      baseURL: config.dinodial.apiUrl,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.dinodial.adminToken}`,
      },
      timeout: 30000, // 30 second timeout
    });
  }

  /**
   * Initiate a call via Dinodial API
   * @param phoneNumber - The candidate's phone number
   * @param prompt - XML-structured prompt for the AI interviewer
   * @param evaluationTool - JSON schema for evaluation
   * @returns DinodialCallResponse with call ID
   */
  async makeCall(
    phoneNumber: string,
    prompt: string,
    evaluationTool: EvaluationTool
  ): Promise<DinodialCallResponse> {
    const requestBody: DinodialMakeCallRequest = {
      prompt,
      evaluation_tool: evaluationTool,
    } as DinodialMakeCallRequest;

    try {
      logger.info(`Initiating Dinodial call to ${phoneNumber.substring(0, 4)}****`);

      const response = await this.client.post<DinodialCallResponse>(
        '/api/proxy/make-call/',
        requestBody
      );

      logger.info(`Dinodial call initiated successfully, id: ${response.data.data.id}`);
      return response.data;
    } catch (error: any) {
      if (error.response?.status === 429) {
        throw new Error(error.response?.data);
      }
      this.handleError(error, 'makeCall');
      throw error;
    }
  }


  /**
   * Get call details from Dinodial API
   * @param dinodialCallId - The Dinodial call ID
   * @returns DinodialCallDetail with status, analysis, etc.
   */
  async getCallDetail(dinodialCallId: number): Promise<DinodialCallDetail> {
    try {
      logger.info(`Fetching Dinodial call details for id: ${dinodialCallId}`);

      const response = await this.client.get<{ data: DinodialCallDetail }>(
        `/api/proxy/call/detail/${dinodialCallId}/`
      );

      logger.info(`Dinodial call details fetched, status: ${response.data.data.status}`);
      return response.data.data;
    } catch (error) {
      this.handleError(error, 'getCallDetail');
      throw error;
    }
  }

  /**
   * Get recording URL for a completed call
   * @param dinodialCallId - The Dinodial call ID
   * @returns Recording URL string
   */
  async getRecordingUrl(dinodialCallId: number): Promise<string> {
    try {
      logger.info(`Fetching recording URL for Dinodial call id: ${dinodialCallId}`);

      const response = await this.client.get<{ data: { recording_url: string } }>(
        `/api/proxy/recording-url/${dinodialCallId}/`
      );

      logger.info(`Recording URL fetched for call id: ${dinodialCallId}`);
      return response.data.data.recording_url;
    } catch (error) {
      this.handleError(error, 'getRecordingUrl');
      throw error;
    }
  }

  /**
   * Handle and log errors without exposing internal details
   */
  private handleError(error: unknown, method: string): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      // Log detailed error internally but don't expose credentials
      logger.error(`DinodialService.${method} failed`, {
        status: axiosError.response?.status,
        statusText: axiosError.response?.statusText,
        message: axiosError.message,
        // Never log the full config which contains auth headers
      });
    } else {
      logger.error(`DinodialService.${method} unexpected error`, {
        message: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
}

// Export singleton instance
export const dinodialService = new DinodialService();

// Export class for testing
export { DinodialService };
