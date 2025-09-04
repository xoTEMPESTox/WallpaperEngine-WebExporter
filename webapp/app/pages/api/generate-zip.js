// webapp/app/pages/api/generate-zip.js
import JSZip from 'jszip';
import { promises as fs } from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import tmp from 'tmp';

export default async function handler(req, res) {
  console.log(`[API] Received request for generate-zip: ${req.method}`);
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    console.warn(`[API] Method ${req.method} not allowed for generate-zip.`);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { ir, sourcePath } = req.body;
  const wallpaperId = ir?.name || 'generated_wallpaper';

  if (!ir && !sourcePath) {
    return res.status(400).json({ error: 'Request must include either "ir" or "sourcePath".' });
  }

  const tmpDir = tmp.dirSync({ unsafeCleanup: true });
  const outputDir = path.join(tmpDir.name, 'output');
  await fs.mkdir(outputDir);

  let irPath;
  if (ir) {
    irPath = path.join(tmpDir.name, 'ir.json');
    await fs.writeFile(irPath, JSON.stringify(ir, null, 2));
  } else {
    // If sourcePath is provided, we assume the orchestrator will run and create the IR.
    // For now, we'll just pass the source path to the generator, which expects an IR.
    // This part needs to be reconciled with the full pipeline.
    // For this task, we will focus on the IR-first approach.
    return res.status(501).json({ error: 'sourcePath processing not yet implemented.' });
  }

  console.log(`[API] Generating scene in ${outputDir} from IR at ${irPath}`);

  const pythonProcess = spawn('python', [
    path.join(process.cwd(), 'converter', 'generator_scene.py'),
    irPath,
    outputDir,
  ]);

  pythonProcess.stdout.on('data', (data) => {
    console.log(`[Python] ${data}`);
  });

  pythonProcess.stderr.on('data', (data) => {
    console.error(`[Python] Error: ${data}`);
  });

  pythonProcess.on('close', async (code) => {
    if (code !== 0) {
      console.error(`[API] Python script exited with code ${code}`);
      return res.status(500).json({ error: 'Failed to generate scene assets.' });
    }

    console.log(`[API] Python script finished successfully. Zipping output...`);

    const zip = new JSZip();
    const files = await fs.readdir(outputDir, { withFileTypes: true });
    for (const file of files) {
      const filePath = path.join(outputDir, file.name);
      if (file.isDirectory()) {
        const subFiles = await fs.readdir(filePath);
        for (const subFile of subFiles) {
            const subFilePath = path.join(filePath, subFile);
            const content = await fs.readFile(subFilePath);
            zip.file(`${file.name}/${subFile}`, content);
        }
      } else {
        const content = await fs.readFile(filePath);
        zip.file(file.name, content);
      }
    }

    const content = await zip.generateAsync({ type: 'nodebuffer' });
    console.log(`[API] Zip generated successfully for ID: ${wallpaperId} with size: ${content.length} bytes`);

    res.writeHead(200, {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="wallpaper_export_${wallpaperId}.zip"`,
      'Content-Length': content.length,
    });
    res.end(content);
    
    // Cleanup
    tmpDir.removeCallback();
  });
}