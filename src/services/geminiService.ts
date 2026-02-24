/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { GoogleGenAI, Type } from '@google/genai';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  throw new Error('GEMINI_API_KEY is not set');
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

// Function to convert a File to a Part
async function fileToGenerativePart(file: File) {
  const base64EncodedDataPromise = new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: await base64EncodedDataPromise,
      mimeType: file.type,
    },
  };
}

const diagnosisSchema = {
  type: Type.OBJECT,
  properties: {
    englishAnalysis: { type: Type.STRING },
    urduAnalysis: { type: Type.STRING },
    confidenceScore: { type: Type.NUMBER },
    potentialDiseases: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          diseaseName: { type: Type.STRING },
          isMostLikely: { type: Type.BOOLEAN },
          treatmentCard: {
            type: Type.OBJECT,
            properties: {
              approvedChemical: { type: Type.STRING },
              dosePerAcre: { type: Type.STRING },
              sprayInterval: { type: Type.STRING },
              preHarvestInterval: { type: Type.STRING },
              safetyNotes: { type: Type.STRING },
            },
          },
          ecoFriendlyAlternative: {
            type: Type.OBJECT,
            properties: {
              option: { type: Type.STRING },
              ipmTip: { type: Type.STRING },
            },
          },
        },
      },
    },
    costCalculator: {
      type: Type.OBJECT,
      properties: {
        chemicalNeededPerAcre: { type: Type.STRING },
        estimatedChemicalCostPerAcre: { type: Type.STRING },
        estimatedSprayCostPerAcre: { type: Type.STRING },
        estimatedEcoCostPerAcre: { type: Type.STRING },
      },
    },
    weatherWarning: {
      type: Type.OBJECT,
      properties: {
        fungalSpreadRisk: { type: Type.STRING },
        sprayAdvice: { type: Type.STRING },
      },
    },
    diseaseRiskMeter: { type: Type.STRING },
    preventedYieldLoss: { type: Type.STRING },
  },
};

import { WeatherData } from './weatherService';

export async function generateDiagnosis(
  image1: File,
  image2: File | null,
  city: string,
  temp: string,
  description: string,
  acreage: string,
  weather: WeatherData | null
) {
  try {
    const imageParts = [await fileToGenerativePart(image1)];
    if (image2) {
      imageParts.push(await fileToGenerativePart(image2));
    }

    const prompt = `
    You are AgriScribe, an expert agricultural crop doctor. Analyze the user's inputs and images to provide a detailed diagnosis.

    **User Inputs:**
    - Location: ${city}
    - Temperature: ${temp}°C
    - Scale / Area: ${acreage}
    - Farmer's Description: ${description}
    - Current Weather: ${weather ? `${weather.description}, Humidity: ${weather.humidity}%, Rain: ${weather.rain ? 'Yes' : 'No'}` : 'Not available'}

    **Task:**
    Based on all the provided information, return a JSON object that strictly follows the defined schema. The analysis should be comprehensive and address all the required fields.

    **Response Language:**
    - Provide detailed analysis in both English and Urdu.
    `;

    const textPart = { text: prompt };

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [textPart, ...imageParts] },
      config: {
        responseMimeType: 'application/json',
        responseSchema: diagnosisSchema,
      },
    });

    return response.text;
  } catch (error) {
    console.error('Error generating diagnosis:', error);
    return '{"error": "Sorry, I was unable to analyze the image. Please try again. Make sure the image is clear and shows the affected parts of the plant."}';
  }
}
