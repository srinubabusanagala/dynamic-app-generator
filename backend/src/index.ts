import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { EventEmitter } from 'events';
import multer from 'multer'; // 👈 File upload tool
import csv from 'csv-parser'; // 👈 CSV reading tool
import { Readable } from 'stream';
import { AppConfigSchema } from './schema';
import { pool, initDB } from './db';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: 'https://dynamic-app-generator-f3djfsbbl-srinubabusanagalas-projects.vercel.app' }));
app.use(express.json());

// --- NOTIFICATION ENGINE ---
const notificationEngine = new EventEmitter();
notificationEngine.on('new_record', (eventData) => {
    console.log(`\n🔔 [SYSTEM NOTIFICATION]`);
    console.log(`📧 Mock Email Sent! New data added to '${eventData.entity}'`);
    console.log(`📊 Payload Data:`, eventData.payload);
    console.log(`--------------------------------------------\n`);
});

// Configure Multer to keep the uploaded file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

const configPath = path.join(__dirname, '../../sample-config.json');

app.get('/api/config', (req, res) => {
    try {
        const safeConfig = AppConfigSchema.parse(JSON.parse(fs.readFileSync(configPath, 'utf-8')));
        res.json({ message: "Config loaded!", data: safeConfig });
    } catch (error) {
        res.status(400).json({ error: "Invalid configuration format." });
    }
});

// --- DYNAMIC CRUD ROUTES ---
app.post('/api/data/:entity', async (req, res) => {
    const entityName = req.params.entity;
    const payload = req.body;
    try {
        const result = await pool.query(
            `INSERT INTO dynamic_records (entity_name, data) VALUES ($1, $2) RETURNING *`,
            [entityName, payload]
        );
        notificationEngine.emit('new_record', { entity: entityName, payload: payload });
        res.status(201).json({ message: "Record saved!", record: result.rows[0] });
    } catch (error) {
        res.status(500).json({ error: "Failed to save record" });
    }
});

app.get('/api/data/:entity', async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT * FROM dynamic_records WHERE entity_name = $1 ORDER BY created_at DESC`,
            [req.params.entity]
        );
        res.json({ data: result.rows.map(row => ({ id: row.id, ...row.data, created_at: row.created_at })) });
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch records" });
    }
});

// --- THE CSV IMPORT ROUTE (Feature 2) ---
app.post('/api/csv/:entity', upload.single('file'), (req, res) => {
    const entityName = req.params.entity;
    if (!req.file) return res.status(400).json({ error: "No CSV file uploaded." });

    const results: any[] = [];
    
    // Convert the memory buffer into a readable stream and pipe it into the CSV parser
    Readable.from(req.file.buffer)
        .pipe(csv())
        .on('data', (data) => results.push(data))
        .on('end', async () => {
            try {
                // Loop through every row in the CSV and insert it dynamically
                for (const row of results) {
                    // Small cleanup: convert string "true"/"false" to actual booleans if needed
                    if (row.is_active === 'true') row.is_active = true;
                    if (row.is_active === 'false') row.is_active = false;

                    await pool.query(
                        `INSERT INTO dynamic_records (entity_name, data) VALUES ($1, $2)`,
                        [entityName, row]
                    );
                }
                
                notificationEngine.emit('new_record', { 
                    entity: entityName, 
                    payload: `Bulk imported ${results.length} rows from CSV.` 
                });
                
                res.status(200).json({ message: `Successfully imported ${results.length} records!` });
            } catch (err) {
                console.error(err);
                res.status(500).json({ error: "Database import failed." });
            }
        });
});

initDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Dynamic Engine running on http://localhost:${PORT}`));
});