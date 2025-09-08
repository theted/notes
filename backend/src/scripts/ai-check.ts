import { probeOpenAI } from '../ai';

async function main() {
  if (!process.env.OPENAI_API_KEY) {
    console.error('Missing OPENAI_API_KEY');
    process.exit(2);
  }
  const result = await probeOpenAI();
  if (result.ok) {
    console.log('AI check OK. Model:', result.model, '\nSample:', result.sample);
    return;
  }
  console.error('AI check failed:', result.error);
  process.exit(1);
}

main();
