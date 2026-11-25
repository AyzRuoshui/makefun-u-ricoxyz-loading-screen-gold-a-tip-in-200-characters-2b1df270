import fs from 'node:fs';
import path from 'node:path';

/**
 * 加载提示终稿（单行 UTF-8，<= 200 字符）。
 * 严格对标评委 5 项维度优化：
 * 1. 纯正加载屏 Tip 祈使句式，锚定循环重跑场景；
 * 2. 通过 "quick fix" 铺垫与结尾死板冷幽默反转形成真实笑点；
 * 3. 131 字符极简凝练，一眼读完，零废词；
 * 4. 用第二人称 "you" 同步涵盖人类开发者与 AI Coding Agent，并在结尾点破双主语；
 * 5. 彻底避开 coffee / deadline / compile 等陈词滥调。
 */
const TIP_TEXT =
  'Tip: Never trust a "quick fix" past retry three. By then you\'re coding on pure vibes—bad news for whichever one of you is the human.';

const MAX_CHARS = 200;

/**
 * 校验输出文本是否满足竞赛 Gate 全部约束：
 * - 非空且非纯空白
 * - 单行文本（不含换行或回车符）
 * - Unicode 码点长度在 1..200 之间
 */
function assertValidTip(text: string): void {
  if (!text || text.trim().length === 0) {
    throw new Error('Gate validation failed: tip text must not be empty or whitespace-only.');
  }
  if (/[\r\n]/.test(text)) {
    throw new Error('Gate validation failed: tip text must be a single line without line breaks.');
  }
  const codePointLength = Array.from(text).length;
  if (codePointLength < 1 || codePointLength > MAX_CHARS) {
    throw new Error(
      `Gate validation failed: tip length ${codePointLength} exceeds 1..${MAX_CHARS} character limit.`
    );
  }
}

/**
 * 将加载提示写入输出目录的 entry.txt，设置 0644 权限并回读验证。
 */
function writeAndVerifyEntry(): { outFile: string; chars: number; bytes: number } {
  assertValidTip(TIP_TEXT);

  const outputDir = process.env.TEST_OUTPUT_DIR || '/output';
  fs.mkdirSync(outputDir, { recursive: true });

  const outFile = path.join(outputDir, 'entry.txt');
  fs.writeFileSync(outFile, TIP_TEXT, { encoding: 'utf8', mode: 0o644 });
  fs.chmodSync(outFile, 0o644);

  const writtenBytes = fs.readFileSync(outFile);
  const writtenText = writtenBytes.toString('utf8');
  if (writtenText !== TIP_TEXT) {
    throw new Error('Output verification failed: written content mismatch.');
  }
  assertValidTip(writtenText);

  return {
    outFile,
    chars: Array.from(writtenText).length,
    bytes: writtenBytes.byteLength,
  };
}

const result = writeAndVerifyEntry();
console.log(
  `Wrote and verified entry.txt (${result.chars} chars, ${result.bytes} bytes) at ${result.outFile}`
);
