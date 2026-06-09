import { readFileSync } from 'fs';
import { join } from 'path';

export default function handler(req, res) {
  try {
    const svgPath = join(process.cwd(), 'ogp.svg');
    const svg = readFileSync(svgPath, 'utf8');

    res.setHeader('Content-Type', 'image/svg+xml');
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=86400');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(200).send(svg);
  } catch (e) {
    res.status(500).send('Image not found');
  }
}
