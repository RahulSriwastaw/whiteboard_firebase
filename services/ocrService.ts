import { createWorker } from 'tesseract.js';

export const performOCR = async (imageUrl: string, languages: string[] = ['eng', 'hin']): Promise<string> => {
  const worker = await createWorker(languages);
  
  try {
    const { data: { text } } = await worker.recognize(imageUrl);
    return text;
  } catch (error) {
    console.error('OCR Error:', error);
    throw error;
  } finally {
    await worker.terminate();
  }
};
