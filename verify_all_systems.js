const assert = require('assert');
const { QuestionRepository, STORAGE_KEYS, getExamChronologicalScore } = require('./questions.js');
const { PRACTICE_YDS_QUESTIONS } = require('./practice_questions.js');

console.log("=== RUNNING SYSTEM VERIFICATION ===");

// 1. Practice questions count and structure
console.log(`[TEST 1] Practice questions count: ${PRACTICE_YDS_QUESTIONS.length}`);
assert.strictEqual(PRACTICE_YDS_QUESTIONS.length, 227, "Expected exactly 227 cleaned practice questions");

for (let i = 0; i < PRACTICE_YDS_QUESTIONS.length; i++) {
  const q = PRACTICE_YDS_QUESTIONS[i];
  assert.strictEqual(q.id, `practice-${i+1}`, `ID should be practice-${i+1}`);
  assert.ok(q.questionText && q.questionText.length > 10, `Q${i+1} questionText should be valid`);
  assert.ok(q.options && Object.keys(q.options).length === 5, `Q${i+1} must have 5 options`);
  for (const opt of ['A', 'B', 'C', 'D', 'E']) {
    assert.ok(q.options[opt] && q.options[opt].trim().length > 0, `Q${i+1} option ${opt} empty`);
  }
  assert.ok(['A', 'B', 'C', 'D', 'E'].includes(q.correctAnswer), `Q${i+1} correctAnswer invalid`);
  assert.ok(q.explanation && q.explanation.length > 10, `Q${i+1} explanation missing`);
}
console.log("  [PASS] All 227 practice questions passed deep structure verification!");

// 2. QuestionRepository and custom exams
global.PRACTICE_YDS_QUESTIONS = PRACTICE_YDS_QUESTIONS;
const repo = new QuestionRepository();

const exams = repo.getAvailableExams();
console.log(`[TEST 2] Available exams count: ${exams.length}`);
assert.strictEqual(exams.length, 13, "Expected exactly 13 available exams");

const allExamQs = repo.getAllExamQuestions();
console.log(`[TEST 3] Total exam questions count: ${allExamQs.length}`);
assert.strictEqual(allExamQs.length, 1040, "Expected exactly 1040 exam questions (13 * 80)");

// Check each exam has exactly 80 questions
for (const e of exams) {
  const qs = repo.getByExam(e.name);
  assert.strictEqual(qs.length, 80, `${e.name} should have 80 questions, got ${qs.length}`);
  console.log(`  [OK] ${e.name} -> ${qs.length} questions`);
}
console.log("  [PASS] All 13 exams have exactly 80 questions!");

// 3. Deep spot-check on 2025 and 2024 new exams
const e2025 = repo.getByExam("2025 YDS/1 Özgün Deneme");
assert.strictEqual(e2025[0].questionNumber, 1);
assert.strictEqual(e2025[0].correctAnswer, "E");
assert.strictEqual(e2025[0].options["E"], "ramifications");
assert.ok(!e2025[0].questionText.startsWith("A)"), "questionText should not be corrupted by options");
assert.ok(e2025[42].passage.length > 100, "Q43 reading passage should be present");
assert.strictEqual(e2025[42].correctAnswer, "C");
console.log("  [PASS] 2025 YDS/1 spot-check passed!");

const e2024 = repo.getByExam("2024 YDS/2 Özgün Deneme");
assert.strictEqual(e2024[0].questionNumber, 1);
assert.strictEqual(e2024[0].correctAnswer, "E");
assert.strictEqual(e2024[0].options["E"], "adherence");
assert.ok(!e2024[0].questionText.startsWith("A)"), "questionText should not be corrupted by options");
assert.ok(e2024[42].passage.length > 100, "Q43 reading passage should be present");
assert.strictEqual(e2024[42].correctAnswer, "E");
console.log("  [PASS] 2024 YDS/2 spot-check passed!");

// 4. getQuestionById test
const found1 = repo.getQuestionById("yds-2025-yds1-1");
assert.ok(found1 && found1.id === "yds-2025-yds1-1");
const foundPractice = repo.getQuestionById("practice-1");
assert.ok(foundPractice && foundPractice.id === "practice-1");
console.log("  [PASS] getQuestionById test passed!");

console.log("\n>>> ALL TESTS PASSED SUCCESSFULLY! 100% VERIFIED! <<<");
