/**
 * build-curriculum.cjs
 * Studio Data Pipeline Utility
 * Transforms flat CSV curriculum data into the robust, bilingual JSON schema used by the Wonder Math engine.
 */

const fs = require('fs');
const path = require('path');

// Configuration - Strictly decoupled from the React frontend
const INPUT_CSV = path.join(__dirname, '../raw_curriculum.csv');
const OUTPUT_DIR = path.join(__dirname, '../src/data');

/**
 * Parses a simple CSV line into an array of values, handling basic quotes for narratives.
 */
function parseCSVRow(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    result.push(current.trim());
    return result;
}

function build() {
    console.log('🚀 Starting Wonder Math Curriculum Build Pipeline...');

    if (!fs.existsSync(INPUT_CSV)) {
        console.error(`❌ Error: ${INPUT_CSV} not found! Please create it from the provided template.`);
        process.exit(1);
    }

    if (!fs.existsSync(OUTPUT_DIR)) {
        fs.mkdirSync(OUTPUT_DIR, { recursive: true });
    }

    const content = fs.readFileSync(INPUT_CSV, 'utf8');
    const lines = content.split('\n').filter(l => l.trim().length > 0);
    
    // Headers: World, Level, ThemeId, Num1, Num2, Ans, MissingField, IntroEN, IntroTH
    const headers = parseCSVRow(lines[0]);
    const worlds = {};

    // Process rows (skip header)
    for (let i = 1; i < lines.length; i++) {
        const row = parseCSVRow(lines[i]);
        if (row.length < headers.length) continue;

        const data = {};
        headers.forEach((h, idx) => {
            data[h] = row[idx];
        });

        const worldId = data.World || '1';
        const levelId = data.Level || '1';
        
        // Match the Studio JSON Schema
        const questionObj = {
            id: `w${worldId}-l${levelId}`,
            index: parseInt(levelId),
            theme: { id: data.ThemeId || 'candy' },
            math: {
                num1: parseInt(data.Num1) || 0,
                num2: parseInt(data.Num2) || 0,
                ans: parseInt(data.Ans) || 0
            },
            narrative: {
                en: data.IntroEN || "",
                th: data.IntroTH || ""
            },
            config: {
                missingField: data.MissingField || 'ans'
            }
        };

        if (!worlds[worldId]) worlds[worldId] = [];
        worlds[worldId].push(questionObj);
    }

    // Output formatted JSON chunks per world
    Object.keys(worlds).forEach(world => {
        const filePath = path.join(OUTPUT_DIR, `world_${world}.json`);
        
        // Ensure levels are sorted numerically within the world
        const sortedData = worlds[world].sort((a, b) => a.index - b.index);
        
        fs.writeFileSync(filePath, JSON.stringify(sortedData, null, 2), 'utf8');
        console.log(`✅ Success: Generated ${filePath} with ${sortedData.length} stages.`);
    });

    console.log('\n✨ Build Pipeline Complete!');
}

build();
