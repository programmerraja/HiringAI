import axios from 'axios';
import { createOpenAI } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';
import { logger } from '../utils/logger';

const JINA_READER_URL = 'https://r.jina.ai';

// Initialize OpenAI with Azure endpoint
const openai = createOpenAI({
  baseURL: 'https://models.inference.ai.azure.com',
  apiKey: process.env.OPENAI_API_KEY || '',
});

export interface JinaScrapedContent {
  content: string;
  title?: string;
  url: string;
}

export interface CompanyContext {
  culture: string;
  context: string;
  values: string[];
  products: string[];
  industry: string;
  summary: string;
}

/**
 * Scrape website content using Jina.ai Reader API
 * @param url - The website URL to scrape
 * @returns Scraped content in markdown format
 */
export const scrapeWebsite = async (url: string): Promise<JinaScrapedContent> => {
  try {
    // Ensure URL has protocol
    let normalizedUrl = url;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      normalizedUrl = `https://${url}`;
    }

    const response = await axios.get(`${JINA_READER_URL}/${normalizedUrl}`, {
      headers: {
        Accept: 'text/plain',
      },
      timeout: 30000, // 30 second timeout
    });

    return {
      content: response.data,
      url: normalizedUrl,
    };
  } catch (error: any) {
    logger.error(`Jina scraping failed for ${url}: ${error.message}`);
    throw new Error(`Failed to scrape website: ${error.message}`);
  }
};

/**
 * Extract company context from scraped content using AI
 */
export const extractCompanyContext = async (
  scrapedContent: string,
): Promise<{ context: string }> => {
  // If no API key, fall back to simple extraction
  if (!process.env.OPENAI_API_KEY) {
    logger.warn('OPENAI_API_KEY not set, using simple extraction');
    return simpleExtraction(scrapedContent);
  }

  try {
    const prompt = `You are an expert HR professional and company analyst. Your task is to extract key information about a company from their website content.

Please analyze the website content and extract the following information:
- Company culture and work environment description
- Core values (as a list)
- Main products or services (as a list)
- Industry/sector
- A brief summary that could be used to answer candidate questions about the company

Website content:
${scrapedContent.substring(0, 10000)}`;

    const response = await generateObject({
      model: openai('gpt-4o'),
      schemaName: 'companyInfo',
      schemaDescription: 'Structured information extracted from a company website',
      schema: z.object({
        culture: z.string().describe('Description of company culture and work environment'),
        values: z.array(z.string()).describe('List of core company values'),
        products: z.array(z.string()).describe('List of main products or services'),
        industry: z.string().describe('Industry or sector the company operates in'),
        summary: z.string().describe('Brief summary of the company for interview context'),
      }),
      prompt: prompt,
    });

    logger.info('Company context extracted successfully');

    // Combine into the format expected by the model
    const result = response.object;
    const contextParts = [
      `**Summary:** ${result.summary}`,
      `**Industry:** ${result.industry}`,
      `**Values:** ${result.values.join(', ')}`,
      `**Products/Services:** ${result.products.join(', ')}`,
    ];

    return {
      context: contextParts.join('\n\n'),
    };
  } catch (error: any) {
    logger.error(`AI extraction failed: ${error.message}`);
    // Fall back to simple extraction on error
    return simpleExtraction(scrapedContent);
  }
};

/**
 * Simple fallback extraction without AI
 */
const simpleExtraction = (scrapedContent: string): { culture: string; context: string } => {
  // Clean up the content - remove excessive whitespace
  const cleanedContent = scrapedContent
    .replace(/\n{3,}/g, '\n\n')
    .replace(/\s{2,}/g, ' ')
    .trim();

  // Truncate to reasonable length
  const maxLength = 5000;
  const truncatedContent =
    cleanedContent.length > maxLength ? cleanedContent.substring(0, maxLength) + '...' : cleanedContent;

  return {
    culture: '',
    context: truncatedContent,
  };
};
