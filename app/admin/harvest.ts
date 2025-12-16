'use server'

import { exec } from 'child_process';
import path from 'path';

export async function harvestCity(cityName: string) {
    return new Promise<{ success: boolean, logs: string[] }>((resolve) => {
        // Assume running locally with the venv set up
        const scriptPath = path.join(process.cwd(), 'pipelines', 'harvest_osm.py');
        const pythonPath = path.join(process.cwd(), 'pipelines', 'venv', 'bin', 'python');

        // Command: pipelines/venv/bin/python pipelines/harvest_osm.py "City Name"
        const cmd = `"${pythonPath}" "${scriptPath}" "${cityName}"`;

        const logs: string[] = [];
        logs.push(`🚀  Invoking Harvester for: ${cityName}`);
        // logs.push(`Command: ${cmd}`);

        exec(cmd, { maxBuffer: 1024 * 1024 * 5 }, (error, stdout, stderr) => {
            if (stdout) {
                // Split lines for cleaner UI
                logs.push(...stdout.split('\n').filter(Boolean));
            }
            if (stderr) {
                // Info logs often go to stderr in some python configs, but errors definitively do
                logs.push(`[STDERR] ${stderr}`);
            }

            if (error) {
                logs.push(`❌ Exec Error: ${error.message}`);
                resolve({ success: false, logs });
            } else {
                resolve({ success: true, logs });
            }
        });
    });
}
