import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { questions } from '../src/data/questions.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const outputDir = path.join(__dirname, '../src/data');

const THEME_IDS = ['candy', 'classroom', 'bakery', 'beach', 'garden'];

// ─── SMART THEME MATCHER ─────────────────────────────────────────────────────
const THEME_KEYWORDS = {
  classroom: ['pencil', 'chalk', 'book', 'student', 'notebook', 'storybook', 'comic', 'pen', 'eraser', 'ruler', 'ดินสอ', 'ชอล์ก', 'หนังสือ', 'นักเรียน', 'สมุด', 'ปากกา'],
  candy: ['candy', 'candies', 'lollipop', 'marshmallow', 'ice cream', 'ลูกอม', 'ลูกกวาด', 'ไอศกรีม'],
  bakery: ['snack', 'cake', 'cupcake', 'bread', 'cookie', 'milk', 'egg', 'ขนม', 'เค้ก', 'ขนมปัง', 'คุกกี้', 'นม', 'ไข่'],
  garden: ['orange', 'apple', 'fruit', 'tree', 'mango', 'banana', 'bird', 'flower', 'ส้ม', 'แอปเปิล', 'ผลไม้', 'ต้นไม้', 'มะม่วง', 'กล้วย', 'นก', 'ดอกไม้'],
  beach: ['shell', 'ball', 'boat', 'fish', 'crab', 'starfish', 'sea', 'ลูกบอล', 'หอย', 'ปลา', 'ปู', 'ทะเล', 'เรือ']
};

function matchTheme(textEN, textTH) {
  const combined = ((textEN || '') + ' ' + (textTH || '')).toLowerCase();
  for (const [themeId, keywords] of Object.entries(THEME_KEYWORDS)) {
    if (keywords.some(kw => combined.includes(kw))) return themeId;
  }
  // No match — pick random theme
  return THEME_IDS[Math.floor(Math.random() * THEME_IDS.length)];
}

// ─── KEYWORD DICTIONARY ─────────────────────────────────────────────────────
// Maps operators to common word-problem keywords in English and Thai.
// Used to auto-tag each question's analysis.keywordsEN / analysis.keywordsTH.
const KEYWORD_DICTIONARY = {
  '+': {
    en: ['gives', 'gave', 'give', 'more', 'added', 'add', 'total', 'altogether', 'in all', 'combined', 'both', 'sum', 'receives', 'gets', 'get', 'joins', 'plus', 'and', 'together', 'collect', 'collects', 'buy', 'buys', 'bought', 'prepare', 'prepares', 'has', 'have', 'makes'],
    th: ['ให้', 'อีก', 'เพิ่ม', 'ทั้งหมด', 'รวม', 'บวก', 'ได้รับ', 'มาเพิ่ม', 'และ', 'ซื้อ', 'เก็บ']
  },
  '-': {
    en: ['left', 'remain', 'gave away', 'gives', 'gave', 'give', 'lost', 'lose', 'loses', 'ate', 'eat', 'sold', 'sell', 'sells', 'fewer', 'difference', 'took', 'take', 'removed', 'minus', 'spent', 'spend', 'spends', 'less', 'absent', 'broken', 'away', 'used', 'uses', 'use', 'borrowed'],
    th: ['เหลือ', 'ให้ไป', 'ให้', 'หาย', 'กิน', 'ขาย', 'ลบ', 'น้อยกว่า', 'ใช้ไป', 'ใช้', 'หัก', 'แตก', 'ไม่มา', 'ยืม']
  },
  '×': {
    en: ['each', 'every', 'per', 'times', 'groups of', 'rows of', 'sets of', 'multiply', 'bags of', 'boxes of'],
    th: ['อันละ', 'ชิ้นละ', 'กลุ่มละ', 'แถวละ', 'คูณ', 'ชุดละ', 'ถุงละ', 'กล่องละ']
  },
  '÷': {
    en: ['share', 'split', 'divide', 'equally', 'each get', 'distributed', 'per group', 'into groups'],
    th: ['แบ่ง', 'เท่าๆ กัน', 'หาร', 'คนละ', 'กลุ่มละ', 'แจก']
  }
};

// ─── ITEM LABEL EXTRACTOR ────────────────────────────────────────────────────
// Attempts to extract human-readable object labels from the English narrative.
// E.g. "25 small snacks" → "small snacks", "34 candies" → "candies"
function extractItemLabels(text) {
  const labels = [];
  // Match: number + optional adjective + noun(s)
  const pattern = /\d+\s+([\w\s-]+?)(?:\.|,|\?|$)/gi;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    const raw = match[1].trim().replace(/\b(more|in total|altogether|does|has|have|had|is|are|were|was|then|and|the|a|an)\b/gi, '').trim();
    if (raw.length > 1 && !labels.includes(raw)) labels.push(raw);
  }
  return labels;
}

// ─── COMPREHENSIVE OBJECT MAP ────────────────────────────────────────────────
// Maps every P.2 curriculum noun (EN + TH) to an emoji.
// Ordered longest-first so "comic book" matches before "book".
const OBJECT_MAP = [
  // Stationery / Classroom
  { keys: ['colored pencil', 'ดินสอสี'], emoji: '🖍️' },
  { keys: ['comic book', 'หนังสือการ์ตูน'], emoji: '📖' },
  { keys: ['storybook', 'หนังสือนิทาน'], emoji: '📚' },
  { keys: ['notebook', 'สมุด'], emoji: '📔' },
  { keys: ['lunch box', 'กล่องข้าว'], emoji: '🍱' },
  { keys: ['pencil', 'ดินสอ'], emoji: '✏️' },
  { keys: ['chalk', 'ชอล์ก'], emoji: '🖍️' },
  { keys: ['book', 'หนังสือ'], emoji: '📚' },
  { keys: ['pen', 'ปากกา'], emoji: '🖊️' },
  { keys: ['eraser', 'ยางลบ'], emoji: '🧽' },
  { keys: ['sticker', 'สติ๊กเกอร์'], emoji: '⭐' },
  { keys: ['picture', 'รูปภาพ'], emoji: '🖼️' },
  // Food / Bakery
  { keys: ['ice cream', 'ไอศกรีม'], emoji: '🍦' },
  { keys: ['sandwich', 'แซนด์���ิช'], emoji: '🥪' },
  { keys: ['cupcake', 'คัพเค้ก'], emoji: '🧁' },
  { keys: ['cookie', 'คุกกี้'], emoji: '🍪' },
  { keys: ['juice', 'น้ำผลไม้'], emoji: '🧃' },
  { keys: ['water', 'น้ำ'], emoji: '💧' },
  { keys: ['bread', 'ขนมปัง'], emoji: '🍞' },
  { keys: ['snack', 'ขนม'], emoji: '🥨' },
  { keys: ['cake', 'เค้ก'], emoji: '🍰' },
  { keys: ['milk', 'กล่องนม', 'ขวดนม'], emoji: '🥛' },
  { keys: ['rice', 'ข้าว'], emoji: '🍚' },
  // Candy
  { keys: ['marshmallow'], emoji: '🍥' },
  { keys: ['lollipop', 'ลูกกวาด'], emoji: '🍭' },
  { keys: ['candy', 'candies', 'ลูกอม'], emoji: '🍬' },
  // Fruit / Garden
  { keys: ['mango', 'มะม่วง'], emoji: '🥭' },
  { keys: ['orange', 'ส้ม'], emoji: '🍊' },
  { keys: ['apple', 'แอปเปิล'], emoji: '🍎' },
  { keys: ['grape', 'องุ่น'], emoji: '🍇' },
  { keys: ['banana', 'กล้วย'], emoji: '🍌' },
  { keys: ['fruit', 'ผลไม้'], emoji: '🍎' },
  { keys: ['flower', 'ดอกไม้'], emoji: '🌸' },
  { keys: ['rose', 'กุหลาบ'], emoji: '🌹' },
  { keys: ['tulip', 'ทิวลิป'], emoji: '🌷' },
  { keys: ['tree', 'ต้นไม้'], emoji: '🌳' },
  { keys: ['plant', 'ผัก', 'ปลูก'], emoji: '🌱' },
  { keys: ['seedling', 'กล้า'], emoji: '🌱' },
  // Animals
  { keys: ['chicken egg', 'ไข่ไก่'], emoji: '🥚' },
  { keys: ['duck egg', 'ไข่เป็ด'], emoji: '🥚' },
  { keys: ['goldfish', 'ปลาทอง'], emoji: '🐠' },
  { keys: ['tilapia', 'ปลานิล'], emoji: '🐟' },
  { keys: ['catfish', 'ปลาดุก'], emoji: '🐟' },
  { keys: ['chicken', 'ไก่'], emoji: '🐔' },
  { keys: ['monkey', 'ลิง'], emoji: '🐒' },
  { keys: ['duck', 'เป็ด'], emoji: '🦆' },
  { keys: ['bird', 'นก'], emoji: '🐦' },
  { keys: ['fish', 'ปลา'], emoji: '🐟' },
  { keys: ['crab', 'ปู'], emoji: '🦀' },
  { keys: ['egg', 'ไข่'], emoji: '🥚' },
  // Beach / Outdoor
  { keys: ['starfish', 'ดาวทะเล'], emoji: '⭐' },
  { keys: ['balloon', 'ลูกโป่ง'], emoji: '🎈' },
  { keys: ['shell', 'เปลือกหอย', 'หอย'], emoji: '🐚' },
  { keys: ['ball', 'ลูก��อล', 'บอล'], emoji: '⚽' },
  { keys: ['boat', 'เรือ'], emoji: '🚤' },
  { keys: ['hoop', 'ห่วง'], emoji: '⭕' },
  // Toys / Objects
  { keys: ['toy car', 'รถของเล่น'], emoji: '🚗' },
  { keys: ['marble', 'ลูกแก้ว'], emoji: '🔮' },
  { keys: ['doll', 'ตุ๊กตา'], emoji: '🧸' },
  { keys: ['toy', 'ของเล่น'], emoji: '🧸' },
  { keys: ['car', 'รถ'], emoji: '🚗' },
  // People
  { keys: ['students', 'นักเรียน'], emoji: '🧒' },
  { keys: ['children', 'boys', 'girls'], emoji: '🧒' },
  // Household / School
  { keys: ['bottle', 'ขวด'], emoji: '🍶' },
  { keys: ['basket', 'ตะกร้า'], emoji: '🧺' },
  { keys: ['shelf', 'ชั้น'], emoji: '📦' },
  { keys: ['vase', 'แจกัน'], emoji: '🏺' },
  { keys: ['plate', 'จาน'], emoji: '🍽️' },
  { keys: ['chair', 'เก้าอี้'], emoji: '🪑' },
  { keys: ['table', 'โต๊ะ'], emoji: '🪑' },
  { keys: ['window', 'หน้าต่าง'], emoji: '🪟' },
  { keys: ['door', 'ประตู'], emoji: '🚪' },
  { keys: ['box', 'กล่อง'], emoji: '📦' },
  { keys: ['bag', 'ถุง'], emoji: '🛍️' },
  { keys: ['tray', '��าด'], emoji: '🍽️' },
  { keys: ['cup', 'ถ้วย'], emoji: '🥤' },
  { keys: ['crate', 'ลัง'], emoji: '📦' },
  { keys: ['stack', 'กอง'], emoji: '📦' },
  // Money
  { keys: ['baht', 'บาท'], emoji: '💰' },
  { keys: ['coin', 'เหร��ยญ'], emoji: '🪙' },
];

/**
 * Scan EN text first, then TH for remaining slots. Returns up to 2 matched emojis.
 * Prioritizes EN to avoid false positives from short Thai substrings.
 */
function extractEmojis(enLower, thText) {
  const thLower = (thText || '').toLowerCase();
  const found = [];
  // Pass 1: English text
  for (const entry of OBJECT_MAP) {
    if (found.length >= 2) break;
    const enKeys = entry.keys.filter(k => /^[a-zA-Z\s]+$/.test(k));
    if (enKeys.some(k => enLower.includes(k)) && !found.includes(entry.emoji)) {
      found.push(entry.emoji);
    }
  }
  // Pass 2: Thai text (only if still need more)
  if (found.length < 2) {
    for (const entry of OBJECT_MAP) {
      if (found.length >= 2) break;
      const thKeys = entry.keys.filter(k => !/^[a-zA-Z\s]+$/.test(k));
      if (thKeys.some(k => thLower.includes(k)) && !found.includes(entry.emoji)) {
        found.push(entry.emoji);
      }
    }
  }
  // If only 1 match, duplicate it (same object mentioned twice)
  if (found.length === 1) found.push(found[0]);
  return found;
}

/**
 * Wonder Kids Curriculum Builder V12.0.0
 * Processes raw JS narrative data into pedagogical JSON chunks
 * with analysis metadata for the Pedagogical Analyzer.
 */
function buildCurriculum() {
  console.log(`\n🚀 Initializing Data Pipeline V12...`);
  console.log(`📦 Source: questions.js (${questions.length} raw entries)`);

  // 1. FILTER — allow Mixed Addition & Subtraction, exclude All Operations Mixed
  const filtered = questions.filter(q => {
    const topic = q.topicEN || '';
    if (topic.includes('All Operations Mixed')) return false;
    const allowedOps = ['Addition', 'Subtraction', 'Multiplication', 'Division'];
    return allowedOps.some(op => topic.includes(op));
  });

  console.log(`🛡️  Firewall active. Filtered to ${filtered.length} valid problems.`);

  // ─── 3-Step operation detector ─────────────────────────────────────
  const ADD_WORDS = ['buys', 'buy', 'bought', 'gives', 'gave', 'adds', 'added', 'more', 'gets', 'receives', 'collects', 'arrives', 'come', 'bloom', 'new', 'prepares'];
  const SUB_WORDS = ['uses', 'used', 'sells', 'sold', 'gives', 'gave', 'loses', 'lost', 'spends', 'spent', 'ate', 'takes', 'took', 'removed', 'broke', 'broken', 'absent', 'borrow'];

  function detect3StepOps(text, num1Pos, num2Pos, num3Pos) {
    const lower = text.toLowerCase();
    // Find text segment around each number
    const seg2 = lower.substring(num1Pos, num3Pos); // text between num1 and num3
    const seg3 = lower.substring(num2Pos); // text from num2 onward

    // Determine op1 (between num1 and num2)
    const seg1Text = lower.substring(num1Pos, num2Pos);
    const op1 = SUB_WORDS.some(w => seg1Text.includes(w)) ? '-' : '+';

    // Determine op2 (between num2 and num3)
    const seg2Text = lower.substring(num2Pos, num3Pos + 5);
    const op2 = SUB_WORDS.some(w => seg2Text.includes(w)) ? '-' : '+';

    return { op1, op2 };
  }

  // 2. TRANSFORM
  const processed = filtered.map((q, idx) => {
    const nums = q.en.match(/\d+/g);
    if (!nums || nums.length < 2) {
      console.warn(`⚠️  Warning: Could not extract numbers for ID ${q.id}. Skipping.`);
      return null;
    }

    const topic = q.topicEN.toLowerCase();
    const enLower = q.en.toLowerCase();
    const thText = q.th || '';
    const is3Step = (topic.includes('3-step') || topic.includes('mixed')) && nums.length >= 3;

    const num1 = parseInt(nums[0]);
    const num2 = parseInt(nums[1]);
    let num3 = is3Step ? parseInt(nums[2]) : undefined;
    let ans = 0;
    let operation, op2;

    if (is3Step) {
      // Find positions of numbers in text for context-based op detection
      const pos1 = enLower.indexOf(nums[0]);
      const pos2 = enLower.indexOf(nums[1], pos1 + nums[0].length);
      const pos3 = enLower.indexOf(nums[2], pos2 + nums[1].length);
      const ops = detect3StepOps(enLower, pos1, pos2, pos3);
      operation = ops.op1;
      op2 = ops.op2;

      // Calculate answer
      let result = num1;
      result = operation === '+' ? result + num2 : result - num2;
      result = op2 === '+' ? result + num3 : result - num3;
      ans = result;
    } else {
      num3 = undefined;
      if (topic.includes('addition')) ans = num1 + num2;
      else if (topic.includes('subtraction')) ans = num1 - num2;
      else if (topic.includes('multiplication')) ans = num1 * num2;
      else if (topic.includes('division')) ans = num2 !== 0 ? Math.floor(num1 / num2) : 0;

      operation = topic.includes('addition') ? '+' : (topic.includes('subtraction') ? '-' : (topic.includes('multiplication') ? '×' : '÷'));
      op2 = undefined;
    }

    // ─── ANALYSIS: keywords from ALL relevant ops ───
    const kwOps = op2 ? [operation, op2] : [operation];
    const allKwEN = []; const allKwTH = [];
    kwOps.forEach(op => {
      const dict = KEYWORD_DICTIONARY[op] || { en: [], th: [] };
      dict.en.forEach(kw => { if (enLower.includes(kw) && !allKwEN.includes(kw)) allKwEN.push(kw); });
      dict.th.forEach(kw => { if (thText.includes(kw) && !allKwTH.includes(kw)) allKwTH.push(kw); });
    });

    const itemLabels = extractItemLabels(q.en);
    const item1Label = itemLabels[0] || '';
    const item2Label = itemLabels[1] || item1Label;

    const isLargeNumber = num1 > 10 || num2 > 10 || (num3 && num3 > 10);

    // ─── SMART EMOJI EXTRACTION ─────────────────────────────────────
    let themeId = matchTheme(q.en, q.th);
    const emojis = extractEmojis(enLower, thText);
    const emoji1 = emojis[0] || '🟦';
    const emoji2 = emojis[1] || emoji1;

    const mathObj = { num1, num2, ans };
    if (num3 !== undefined) mathObj.num3 = num3;

    const configObj = { missingField: 'ans', operation, title: topic };
    if (op2) configObj.op2 = op2;

    return {
      id: q.id,
      level: idx + 1,
      math: mathObj,
      narrative: { en: q.en, th: q.th },
      theme: { id: themeId, item1: emoji1, item2: emoji2 },
      config: configObj,
      analysis: {
        keywordsEN: allKwEN,
        keywordsTH: allKwTH,
        item1Label,
        item2Label,
        isLargeNumber,
        emoji1,
        emoji2
      }
    };
  }).filter(q => q !== null);

  // 3. CHUNKING: Group into worlds (40 levels each)
  const CHUNK_SIZE = 40;
  const worlds = [];

  for (let i = 0; i < processed.length; i += CHUNK_SIZE) {
    const chunk = processed.slice(i, i + CHUNK_SIZE);
    const worldNum = Math.floor(i / CHUNK_SIZE) + 1;
    const filename = `world_${worldNum}.json`;
    const outputPath = path.join(outputDir, filename);

    fs.writeFileSync(outputPath, JSON.stringify(chunk, null, 2));
    worlds.push({ worldNum, count: chunk.length });
  }

  // 4. SUMMARY
  console.log(`\n🎉 Data Pipeline V12 Complete!`);
  worlds.forEach(w => console.log(`   ✅ World ${w.worldNum}: ${w.count} levels generated.`));
  console.log(`📍 Output: ${outputDir}`);

  // Sample analysis output
  if (processed.length > 0) {
    const sample = processed[0];
    console.log(`\n📊 Sample Analysis (Level 1):`);
    console.log(`   Keywords EN: [${sample.analysis.keywordsEN.join(', ')}]`);
    console.log(`   Keywords TH: [${sample.analysis.keywordsTH.join(', ')}]`);
    console.log(`   Items: "${sample.analysis.item1Label}" / "${sample.analysis.item2Label}"`);
    console.log(`   Large Numbers: ${sample.analysis.isLargeNumber}\n`);
  }
}

buildCurriculum();
