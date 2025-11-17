
import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon, ExclamationTriangleIcon } from './icons';

// Configurações para cada tipo de loteria
const LOTTERY_CONFIG = {
    'Mega-Sena': { numbers: 6, min: 1, max: 60 },
    'Lotofácil': { numbers: 15, min: 1, max: 25 },
    'Quina': { numbers: 5, min: 1, max: 80 },
};
type LotteryGame = keyof typeof LOTTERY_CONFIG;

const GeneratorTab: React.FC = () => {
    const [selectedGame, setSelectedGame] = useState<LotteryGame>('Mega-Sena');
    const [numBets, setNumBets] = useState<number>(5);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedBets, setGeneratedBets] = useState<number[][]>([]);
    const [analysis, setAnalysis] = useState<string>('');

    const handleGenerateBets = async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedBets([]);
        setAnalysis('');

        try {
            if (!process.env.API_KEY) {
                throw new Error("API key não encontrada. Verifique a configuração.");
            }
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const config = LOTTERY_CONFIG[selectedGame];
            const prompt = `
                Você é um especialista em análise de dados de loterias brasileiras. 
                Com base no seu conhecimento sobre resultados históricos e padrões de sorteio da ${selectedGame}, 
                gere ${numBets} sugestões de apostas únicas e com alta probabilidade estatística.
                Cada aposta para a ${selectedGame} deve conter ${config.numbers} números únicos, entre ${config.min} e ${config.max}.
                
                Forneça uma breve análise (no máximo 3 frases) explicando a estratégia ou os padrões que você considerou (ex: números mais/menos frequentes, dezenas, etc.).
                
                Retorne a resposta estritamente no formato JSON, conforme o schema definido.
            `;
            
            const responseSchema = {
                type: Type.OBJECT,
                properties: {
                    analysis: {
                        type: Type.STRING,
                        description: "A breve análise da estratégia de geração dos números."
                    },
                    bets: {
                        type: Type.ARRAY,
                        description: `Uma lista de ${numBets} apostas.`,
                        items: {
                            type: Type.ARRAY,
                            description: `Uma aposta com ${config.numbers} números.`,
                            items: {
                                type: Type.INTEGER
                            }
                        }
                    }
                }
            };
            
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: responseSchema,
                },
            });
            
            const resultText = response.text.trim();
            const resultJson = JSON.parse(resultText);

            if (resultJson.bets && resultJson.analysis) {
                setGeneratedBets(resultJson.bets);
                setAnalysis(resultJson.analysis);
            } else {
                throw new Error("A resposta da IA não está no formato esperado.");
            }

        } catch (err) {
            console.error("Erro ao gerar apostas:", err);
            setError("Ocorreu um erro ao gerar as apostas. A IA pode estar ocupada ou a chave de API é inválida. Tente novamente em alguns instantes.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Gerador de Apostas com IA</h2>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                    Use o poder do Google Gemini para gerar sugestões de apostas baseadas em análises de dados históricos.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
                    <div>
                        <label htmlFor="lottery-game" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Jogo de Loteria
                        </label>
                        <select
                            id="lottery-game"
                            value={selectedGame}
                            onChange={(e) => setSelectedGame(e.target.value as LotteryGame)}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                        >
                            {Object.keys(LOTTERY_CONFIG).map(game => (
                                <option key={game} value={game}>{game}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="num-bets" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Quantidade de Apostas
                        </label>
                        <input
                            id="num-bets"
                            type="number"
                            min="1"
                            max="20"
                            value={numBets}
                            onChange={(e) => setNumBets(parseInt(e.target.value, 10))}
                            className="w-full p-2 border rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 border-gray-300 dark:border-gray-600 focus:ring-primary-500 focus:border-primary-500"
                        />
                    </div>
                    <button
                        onClick={handleGenerateBets}
                        disabled={isLoading}
                        className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-primary-500 text-white font-semibold rounded-md hover:bg-primary-600 transition-colors disabled:bg-gray-400 disabled:cursor-wait"
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                <span>Gerando...</span>
                            </>
                        ) : (
                            <>
                                <SparklesIcon className="w-5 h-5" />
                                <span>Gerar Apostas</span>
                            </>
                        )}
                    </button>
                </div>
            </div>

            {error && (
                <div className="bg-red-100 dark:bg-red-900 border-l-4 border-red-500 text-red-700 dark:text-red-200 p-4 rounded-md" role="alert">
                    <div className="flex">
                        <div className="py-1"><ExclamationTriangleIcon className="h-6 w-6 text-red-500 mr-4"/></div>
                        <div>
                            <p className="font-bold">Erro</p>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                </div>
            )}

            {generatedBets.length > 0 && (
                 <div className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow-md space-y-6 animate-fade-in-up">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">Análise da IA</h3>
                        <blockquote className="border-l-4 border-primary-500 pl-4 italic text-gray-600 dark:text-gray-400">
                           {analysis}
                        </blockquote>
                    </div>
                     <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                            {generatedBets.length} Sugestões de Apostas para {selectedGame}
                        </h3>
                        <div className="space-y-4">
                            {generatedBets.map((bet, index) => (
                                <div key={index} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                                    <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Aposta {index + 1}</p>
                                    <div className="flex flex-wrap gap-2">
                                        {bet.sort((a,b) => a - b).map(num => (
                                            <span key={num} className="flex items-center justify-center h-8 w-8 text-sm font-bold bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200 rounded-full">
                                                {String(num).padStart(2, '0')}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GeneratorTab;
