/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import { useState, useCallback, ChangeEvent, DragEvent, useEffect } from 'react';
import { Upload, Leaf, Sparkles, Bot, MapPin, Thermometer, Image as ImageIcon, Loader2, Mic, Languages, Tractor } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { generateDiagnosis } from './services/geminiService';
import { getWeatherData, WeatherData } from './services/weatherService';
import ImageUploadSlot from './components/ImageUploadSlot';
import DiagnosisDisplay from './components/DiagnosisDisplay';
import { Diagnosis } from './types';

// Main App Component
export default function App() {
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageTwo, setImageTwo] = useState<File | null>(null);
  const [imageTwoPreview, setImageTwoPreview] = useState<string | null>(null);
  const [city, setCity] = useState('');
  const [temp, setTemp] = useState('');
  const [scale, setScale] = useState<'plants' | 'crop'>('crop');
  const [plantCount, setPlantCount] = useState('1');
  const [cropArea, setCropArea] = useState('');
  const [cropAreaUnit, setCropAreaUnit] = useState('acre');
  const [description, setDescription] = useState('');
  const [language, setLanguage] = useState('en-US');
  const [analysis, setAnalysis] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(false);

  const { transcript, listening, browserSupportsSpeechRecognition, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    setDescription(transcript);
  }, [transcript]);

  if (!browserSupportsSpeechRecognition) {
    return <div className="p-4">Browser doesn't support speech recognition.</div>;
  }

  const handleImageChange = (file: File) => {
    setImage(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleImageTwoChange = (file: File) => {
    setImageTwo(file);
    setImageTwoPreview(URL.createObjectURL(file));
  };

  const handleDiagnose = async () => {
    const acreage = scale === 'plants' ? `${plantCount} plant(s)` : `${cropArea} ${cropAreaUnit}(s)`;
    if (!image || !city || !temp || !description || !acreage) {
      alert('Please fill in all fields and upload an image.');
      return;
    }
    setLoading(true);
    setAnalysis(null);
    // Gemini API call will go here
    try {
      const weatherData = await getWeatherData(city);
      const diagnosisJson = await generateDiagnosis(image, imageTwo, city, temp, description, acreage, weatherData);
      try {
        const parsedDiagnosis: Diagnosis = JSON.parse(diagnosisJson);
        setAnalysis(parsedDiagnosis);
      } catch (e) {
        console.error("Failed to parse diagnosis JSON:", e);
        setAnalysis({ error: 'The AI returned an invalid response. Please try again.' } as unknown as Diagnosis);
      }
    } catch (error) {
      console.error(error);
      setAnalysis({ error: 'An error occurred during diagnosis. Please try again.' } as Diagnosis);
    } finally {
      setLoading(false);
    }
  };

  const acreage = scale === 'plants' ? `${plantCount} plant(s)` : `${cropArea} ${cropAreaUnit}(s)`;

  return (
    <div className="min-h-screen bg-[#f5f5f0] text-slate-900 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-6xl mx-auto">
        <Header />
        <main className="mt-10 bg-white p-6 sm:p-8 rounded-3xl shadow-lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploadSlot onImageChange={handleImageChange} imagePreview={imagePreview} label="1. Primary Image*" />
                <ImageUploadSlot onImageChange={handleImageTwoChange} imagePreview={imageTwoPreview} label="2. Second Image (Optional)" />
              </div>
              <InfoForm 
                city={city} setCity={setCity} 
                temp={temp} setTemp={setTemp} 
                scale={scale} setScale={setScale}
                plantCount={plantCount} setPlantCount={setPlantCount}
                cropArea={cropArea} setCropArea={setCropArea}
                cropAreaUnit={cropAreaUnit} setCropAreaUnit={setCropAreaUnit}
              />
              <DescriptionForm 
                description={description}
                setDescription={setDescription}
                language={language}
                setLanguage={setLanguage}
                listening={listening}
                resetTranscript={resetTranscript}
              />
              <button
                onClick={handleDiagnose}
                disabled={loading || !image || !city || !temp || !description}
                className="w-full inline-flex items-center justify-center gap-2 bg-green-600 text-white font-bold py-3 px-6 rounded-full hover:bg-green-700 transition-all disabled:bg-slate-400 disabled:cursor-not-allowed shadow-md hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                {loading ? (
                  <><Loader2 className="animate-spin" size={20} /> Diagnosing...</>
                ) : (
                  <><Sparkles size={20} /> Diagnose Crop</>
                )}
              </button>
            </div>
            <div className="bg-slate-50 rounded-2xl p-6">
              <h2 className="text-2xl font-bold font-serif text-slate-800 mb-4 flex items-center gap-2">
                <Bot size={24} /> AI Diagnosis
              </h2>
              <div>
                {loading && <div className="flex justify-center items-center"><Loader2 className="animate-spin" size={32} /> <p className="ml-2">Analyzing...</p></div>}
                {analysis ? (
                  <DiagnosisDisplay diagnosis={analysis} acreage={acreage} />
                ) : (
                  !loading && <p className="text-slate-500 text-center">Your crop analysis will appear here.</p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// Header Component
function Header() {
  return (
    <header className="text-center">
      <div className="inline-flex items-center gap-3 bg-white py-2 px-4 rounded-full shadow-sm">
        <Leaf className="text-green-600" size={24} />
        <h1 className="text-3xl sm:text-4xl font-bold tracking-tight font-serif text-slate-800">
          AgriScribe
        </h1>
      </div>
      <p className="mt-3 text-lg font-medium text-green-700">Your AI Agricultural Crop Doctor</p>
    </header>
  );
}





// Information Form Component
function InfoForm({ 
  city, setCity, 
  temp, setTemp, 
  scale, setScale, 
  plantCount, setPlantCount, 
  cropArea, setCropArea, 
  cropAreaUnit, setCropAreaUnit 
}: { 
  city: string; setCity: (c: string) => void; 
  temp: string; setTemp: (t: string) => void; 
  scale: 'plants' | 'crop'; setScale: (s: 'plants' | 'crop') => void;
  plantCount: string; setPlantCount: (p: string) => void;
  cropArea: string; setCropArea: (a: string) => void;
  cropAreaUnit: string; setCropAreaUnit: (u: string) => void;
}) {
  return (
        <div className="space-y-4">
        <div>
            <label className="block text-sm font-medium text-slate-700">3. Scale</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <button type="button" onClick={() => setScale('plants')} className={`relative inline-flex items-center space-x-2 rounded-l-md border px-4 py-2 text-sm font-medium ${scale === 'plants' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>Plants</button>
              <button type="button" onClick={() => setScale('crop')} className={`relative -ml-px inline-flex items-center space-x-2 rounded-r-md border px-4 py-2 text-sm font-medium ${scale === 'crop' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}>Crop</button>
            </div>
        </div>
        {scale === 'plants' ? (
          <div>
            <label htmlFor="plantCount" className="block text-sm font-medium text-slate-700">Number of Plants</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <select id="plantCount" name="plantCount" value={plantCount} onChange={(e) => setPlantCount(e.target.value)} className="block w-full rounded-md border-slate-300 focus:border-green-500 focus:ring-green-500 sm:text-sm p-2.5">
                    <option value="1">1 Plant</option>
                    <option value="2">2 Plants</option>
                    <option value="3-5">3-5 Plants</option>
                    <option value="5-10">5-10 Plants</option>
                    <option value="10+">10+ Plants</option>
                </select>
            </div>
          </div>
        ) : (
          <div>
            <label htmlFor="cropArea" className="block text-sm font-medium text-slate-700">Crop Area</label>
            <div className="mt-1 flex rounded-md shadow-sm">
              <input type="number" name="cropArea" id="cropArea" value={cropArea} onChange={(e) => setCropArea(e.target.value)} className="block w-full rounded-none rounded-l-md border-slate-300 focus:border-green-500 focus:ring-green-500 sm:text-sm p-2.5" placeholder="e.g., 10" />
              <select value={cropAreaUnit} onChange={(e) => setCropAreaUnit(e.target.value)} className="rounded-r-md border-l-0 border-slate-300 text-sm focus:border-green-500 focus:ring-green-500">
                <option value="kanal">Kanal</option>
                <option value="marla">Marla</option>
                <option value="acre">Acre</option>
              </select>
            </div>
          </div>
        )}

        <div>
            <label htmlFor="city" className="block text-sm font-medium text-slate-700">4. Location</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <MapPin className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="text"
                    name="city"
                    id="city"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="block w-full rounded-md border-slate-300 pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm p-2.5"
                    placeholder="e.g., Nairobi, Kenya"
                />
            </div>
        </div>
        <div>
            <label htmlFor="temp" className="block text-sm font-medium text-slate-700">4. Temperature (°C)</label>
            <div className="mt-1 relative rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <Thermometer className="h-5 w-5 text-slate-400" />
                </div>
                <input
                    type="number"
                    name="temp"
                    id="temp"
                    value={temp}
                    onChange={(e) => setTemp(e.target.value)}
                    className="block w-full rounded-md border-slate-300 pl-10 focus:border-green-500 focus:ring-green-500 sm:text-sm p-2.5"
                    placeholder="e.g., 25"
                />
            </div>
        </div>
    </div>
  );
}

// Description Form Component
function DescriptionForm({ description, setDescription, language, setLanguage, listening, resetTranscript }: { description: string; setDescription: (d: string) => void; language: string; setLanguage: (l: string) => void; listening: boolean; resetTranscript: () => void; }) {
  const handleListen = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: true, language });
    }
  };

  return (
    <div className="space-y-2">
      <label htmlFor="description" className="block text-sm font-medium text-slate-700">5. Farmer's Description</label>
      <div className="relative">
        <textarea
          id="description"
          name="description"
          rows={4}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="block w-full rounded-md border-slate-300 shadow-sm focus:border-green-500 focus:ring-green-500 sm:text-sm p-2.5 pr-20"
          placeholder="Describe the issue, e.g., 'The leaves are turning yellow and have brown spots.'"
        />
        <div className="absolute top-2 right-2 flex items-center space-x-1">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="rounded-md border-slate-300 text-sm focus:border-green-500 focus:ring-green-500"
          >
            <option value="ur-PK">Urdu</option>
            <option value="pa-IN">Punjabi</option>
            <option value="en-US">English</option>
          </select>
          <button
            type="button"
            onClick={handleListen}
            className={`p-2 rounded-full transition-colors ${listening ? 'bg-red-500 text-white' : 'bg-green-500 text-white hover:bg-green-600'}`}>
            <Mic size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
