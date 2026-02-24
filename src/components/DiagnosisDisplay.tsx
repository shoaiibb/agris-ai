/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { Diagnosis, PotentialDisease } from '../types';
import { CheckCircle, AlertTriangle, Info, DollarSign, Wind, Droplets, Shield, BarChart, Languages } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface DiagnosisDisplayProps {
  diagnosis: Diagnosis | null;
  acreage: string;
}

const RiskMeter = ({ risk }: { risk: 'Low' | 'Medium' | 'High' }) => {
  const riskConfig = {
    Low: { color: 'bg-green-500', text: 'Low' },
    Medium: { color: 'bg-yellow-500', text: 'Medium' },
    High: { color: 'bg-red-500', text: 'High' },
  };
  const { color, text } = riskConfig[risk] || riskConfig.Low;

  return (
    <div className="flex items-center gap-2">
      <span className={`w-4 h-4 rounded-full ${color}`}></span>
      <span className="font-semibold">{text} Risk</span>
    </div>
  );
};

const TreatmentCardDisplay = ({ disease }: { disease: PotentialDisease }) => {
  if (!disease.treatmentCard) return null;

  return (
  <div className="bg-white rounded-lg shadow p-4 mt-2">
    <h4 className="font-bold text-lg text-slate-800">{disease.diseaseName} {disease.isMostLikely && "(Most Likely)"}</h4>
    <div className="mt-2 space-y-2 text-sm">
      <p><span className="font-semibold">Chemical:</span> {disease.treatmentCard.approvedChemical}</p>
      <p><span className="font-semibold">Dose/Acre:</span> {disease.treatmentCard.dosePerAcre}</p>
      <p><span className="font-semibold">Interval:</span> {disease.treatmentCard.sprayInterval}</p>
      <p><span className="font-semibold">Pre-Harvest Interval:</span> {disease.treatmentCard.preHarvestInterval}</p>
      <p className="text-red-600"><span className="font-semibold">Safety:</span> {disease.treatmentCard.safetyNotes}</p>
    </div>
  </div>
)};

const EcoAlternative = ({ disease }: { disease: PotentialDisease }) => {
  if (!disease.ecoFriendlyAlternative) return null;

  return (
    <div className="bg-green-50 rounded-lg p-4 mt-4">
        <h5 className="font-bold text-green-800">Eco-Friendly Alternative</h5>
        <p className="text-sm mt-1"><span className="font-semibold">Option:</span> {disease.ecoFriendlyAlternative.option}</p>
        <p className="text-sm mt-1"><span className="font-semibold">IPM Tip:</span> {disease.ecoFriendlyAlternative.ipmTip}</p>
    </div>
)};

export default function DiagnosisDisplay({ diagnosis, acreage }: DiagnosisDisplayProps) {
  if (!diagnosis) return null;
  if (diagnosis.error) {
    return (
      <div className="flex flex-col items-center justify-center text-center text-red-600">
        <AlertTriangle size={48} />
        <p className="mt-2 font-semibold">Analysis Failed</p>
        <p>{diagnosis.error}</p>
      </div>
    );
  }

  const totalAcres = parseFloat(acreage) || 0;

  return (
    <div className="space-y-6">
      <div className="p-4 bg-blue-50 rounded-xl shadow-md">
        <h3 className="font-bold text-xl text-blue-800 flex items-center gap-2"><CheckCircle /> Overall Diagnosis</h3>
        <div className="mt-2 flex justify-between items-start">
            <p className="text-2xl font-bold text-slate-800">Confidence: {diagnosis.confidenceScore}%</p>
            {diagnosis.confidenceScore < 70 && <p className="text-sm text-yellow-700">(Low confidence. Consider uploading a second image for better accuracy.)</p>}
        </div>
        <div className="mt-4 p-4 bg-white rounded-lg">
            <h4 className="font-semibold flex items-center gap-2"><Languages /> Bilingual Analysis</h4>
            <div className="prose prose-sm mt-2"><ReactMarkdown>{diagnosis.englishAnalysis}</ReactMarkdown></div>
            <hr className="my-2" />
            <div className="prose prose-sm" dir="rtl"><ReactMarkdown>{diagnosis.urduAnalysis}</ReactMarkdown></div>
        </div>
      </div>

      <div>
        <h3 className="font-bold text-xl text-slate-800 flex items-center gap-2"><Shield /> Treatment Plan</h3>
        {diagnosis.potentialDiseases.map(d => <TreatmentCardDisplay key={d.diseaseName} disease={d} />)}
      </div>

      <div>
        <h3 className="font-bold text-xl text-green-800 flex items-center gap-2"><Droplets /> Eco-Friendly Alternatives</h3>
        {diagnosis.potentialDiseases.map(d => <EcoAlternative key={d.diseaseName} disease={d} />)}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-4 bg-yellow-50 rounded-xl shadow-md">
            <h3 className="font-bold text-xl text-yellow-800 flex items-center gap-2"><Wind /> Weather-Aware Spray Warning</h3>
            <p className="mt-2"><span className="font-semibold">Fungal Risk:</span> {diagnosis.weatherWarning.fungalSpreadRisk}</p>
            <p><span className="font-semibold">Advice:</span> {diagnosis.weatherWarning.sprayAdvice}</p>
        </div>
        <div className="p-4 bg-red-50 rounded-xl shadow-md">
            <h3 className="font-bold text-xl text-red-800 flex items-center gap-2"><AlertTriangle /> Disease Risk Meter</h3>
            <div className="mt-2">
                <RiskMeter risk={diagnosis.diseaseRiskMeter} />
            </div>
        </div>
      </div>

      <div className="p-4 bg-purple-50 rounded-xl shadow-md">
        <h3 className="font-bold text-xl text-purple-800 flex items-center gap-2"><DollarSign /> Cost Calculator (Total for {totalAcres} acres)</h3>
        <div className="text-sm mt-2 space-y-1">
            <p><span className="font-semibold">Total Chemical Needed:</span> {diagnosis.costCalculator.chemicalNeededPerAcre} x {totalAcres} acres</p>
            <p><span className="font-semibold">Estimated Chemical Cost:</span> {diagnosis.costCalculator.estimatedChemicalCostPerAcre} x {totalAcres} acres</p>
            <p><span className="font-semibold">Estimated Spray Cost:</span> {diagnosis.costCalculator.estimatedSprayCostPerAcre} x {totalAcres} acres</p>
            <p><span className="font-semibold">Estimated Eco Alternative Cost:</span> {diagnosis.costCalculator.estimatedEcoCostPerAcre} x {totalAcres} acres</p>
        </div>
      </div>

      <YieldLossIndicator text={diagnosis.preventedYieldLoss} />

    </div>
  );
}

const YieldLossIndicator = ({ text }: { text: string }) => {
  const percentageMatch = text.match(/(\d{1,2}-?\d{0,2}%)/);

  if (!percentageMatch) {
    return (
      <div className="p-4 bg-indigo-50 rounded-xl shadow-md">
        <h3 className="font-bold text-xl text-indigo-800 flex items-center gap-2"><BarChart /> Prevented Yield Loss</h3>
        <p className="mt-2">{text}</p>
      </div>
    );
  }

  const percentage = percentageMatch[1];
  const parts = text.split(percentage);

  return (
    <div className="p-6 bg-indigo-50 rounded-xl shadow-md text-center">
      <h3 className="font-bold text-xl text-indigo-800 flex items-center justify-center gap-2"><BarChart /> Prevented Yield Loss</h3>
      <p className="mt-4 text-slate-700">
        {parts[0]}
        <span className="block text-4xl font-bold text-indigo-600 my-2">{percentage}</span>
        {parts[1]}
      </p>
    </div>
  );
};
