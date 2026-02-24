/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface TreatmentCard {
  approvedChemical: string;
  dosePerAcre: string;
  sprayInterval: string;
  preHarvestInterval: string;
  safetyNotes: string;
}

export interface EcoFriendlyAlternative {
  option: string;
  ipmTip: string;
}

export interface PotentialDisease {
  diseaseName: string;
  isMostLikely: boolean;
  treatmentCard: TreatmentCard;
  ecoFriendlyAlternative: EcoFriendlyAlternative;
}

export interface CostCalculator {
  chemicalNeededPerAcre: string;
  estimatedChemicalCostPerAcre: string;
  estimatedSprayCostPerAcre: string;
  estimatedEcoCostPerAcre: string;
}

export interface WeatherWarning {
  fungalSpreadRisk: string;
  sprayAdvice: string;
}

export interface Diagnosis {
  englishAnalysis: string;
  urduAnalysis: string;
  confidenceScore: number;
  potentialDiseases: PotentialDisease[];
  costCalculator: CostCalculator;
  weatherWarning: WeatherWarning;
  diseaseRiskMeter: 'Low' | 'Medium' | 'High';
  preventedYieldLoss: string;
  error?: string;
}
