import { ChatOpenAI } from '@langchain/openai';
import { PromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';
import { type Field } from '../../database/schemas/fields.js';
import { type FieldUpdate } from '../../database/schemas/field_updates.js';

export class FieldStatusAIService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      model: 'gpt-4o',
      openAIApiKey: process.env.OPENAI_API_KEY,
      temperature: 0,
    });
  }

  async computeStatus(field: Field, latestUpdates: FieldUpdate[]): Promise<{ status: 'Active' | 'At Risk' | 'Completed'; reason?: string }> {
    // 1. Check if stage is Harvested
    if (field.currentStage === 'Harvested') {
      return { status: 'Completed', reason: 'Crop has been harvested.' };
    }

    // 2. Check for "At Risk" based on update frequency (14 days)
    const lastUpdate = latestUpdates[0];
    const fourteenDaysAgo = new Date();
    fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 14);

    if (!lastUpdate || new Date(lastUpdate.createdAt!) < fourteenDaysAgo) {
      return { status: 'At Risk', reason: 'No updates received in over 14 days.' };
    }

    // 3. Use AI to analyze latest notes for risk
    if (lastUpdate && lastUpdate.notes && process.env.OPENAI_API_KEY) {
      try {
        const aiResult = await this.analyzeRiskWithAI(lastUpdate.notes);
        console.log('AI Risk Analysis Result:', aiResult);
        if (aiResult.status === 'At Risk') {
          return aiResult;
        }
      } catch (error) {
        console.error('AI Risk Analysis failed:', error);
        // Fallback to keyword matching if AI fails
        if (this.containsRiskKeywords(lastUpdate.notes)) {
          return { status: 'At Risk', reason: 'Risk keywords detected in recent notes (AI analysis failed).' };
        }
      }
    } else if (lastUpdate && lastUpdate.notes) {
      // Fallback to keyword matching if no API key
      if (this.containsRiskKeywords(lastUpdate.notes)) {
        return { status: 'At Risk', reason: 'Risk keywords detected in recent notes.' };
      }
    }

    // 4. Otherwise Active
    return { status: 'Active', reason: 'Field is progressing and being monitored regularly.' };
  }

  private async analyzeRiskWithAI(notes: string): Promise<{ status: 'Active' | 'At Risk'; reason: string }> {
    const prompt = PromptTemplate.fromTemplate(
      `Analyze the following farming observation notes and determine if the field is "At Risk" or "Active".
      Risk factors include: pests, disease, drought, wilting, flooding, low germination, or any other negative environmental factors.
      
      Notes: {notes}
      
      Respond in JSON format with two fields:
      "status": "At Risk" or "Active"
      "reason": A brief explanation of why you chose this status based on the notes.
      `
    );

    const parser = new JsonOutputParser<{ status: 'Active' | 'At Risk'; reason: string }>();

    const chain = prompt.pipe(this.model).pipe(parser);

    try {
      const result = await chain.invoke({ notes });
      return {
        status: result.status === 'At Risk' ? 'At Risk' : 'Active',
        reason: result.reason || 'AI analysis completed.',
      };
    } catch (e) {
      console.error('Failed to parse AI response as JSON:', e);
      // Fallback to keyword matching logic if JSON parsing fails
      const isAtRisk = this.containsRiskKeywords(notes);
      return {
        status: isAtRisk ? 'At Risk' : 'Active',
        reason: isAtRisk ? 'Risk keywords detected in notes (AI parsing failed).' : 'AI analysis completed (parsing failed, assuming active).',
      };
    }
  }

  private containsRiskKeywords(notes: string): boolean {
    const riskKeywords = ['pest', 'disease', 'drought', 'wilting', 'flooding', 'low germination'];
    const lowerNotes = notes.toLowerCase();
    return riskKeywords.some(keyword => lowerNotes.includes(keyword));
  }
}

export const fieldStatusAIService = new FieldStatusAIService();
