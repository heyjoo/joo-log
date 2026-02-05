#!/usr/bin/env node

/**
 * Obsidian Import Script
 *
 * Obsidian vault에서 특정 폴더의 노트를 블로그로 복사합니다.
 *
 * 사용법:
 *   node scripts/import-obsidian.mjs <vault-path> <folder-name>
 *
 * 예시:
 *   node scripts/import-obsidian.mjs ~/Documents/ObsidianVault Blog
 *
 * 또는 npm script 사용:
 *   npm run import:obsidian -- ~/Documents/ObsidianVault Blog
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const POSTS_DIR = path.join(__dirname, '..', 'src', 'content', 'posts');
const PUBLIC_DIR = path.join(__dirname, '..', 'public', 'images', 'posts');

/**
 * 프론트매터 파싱
 */
function parseFrontmatter(content) {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---\n([\s\S]*)$/;
  const match = content.match(frontmatterRegex);

  if (match) {
    const frontmatterStr = match[1];
    const body = match[2];
    const frontmatter = {};

    frontmatterStr.split('\n').forEach((line) => {
      const colonIndex = line.indexOf(':');
      if (colonIndex !== -1) {
        const key = line.slice(0, colonIndex).trim();
        let value = line.slice(colonIndex + 1).trim();

        // 배열 처리 (간단한 형태)
        if (value.startsWith('[') && value.endsWith(']')) {
          value = value
            .slice(1, -1)
            .split(',')
            .map((v) => v.trim().replace(/^["']|["']$/g, ''))
            .filter(Boolean);
        }
        // 문자열 따옴표 제거
        else if ((value.startsWith('"') && value.endsWith('"')) ||
                 (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1);
        }
        // 불리언 처리
        else if (value === 'true') value = true;
        else if (value === 'false') value = false;

        frontmatter[key] = value;
      }
    });

    return { frontmatter, body };
  }

  return { frontmatter: {}, body: content };
}

/**
 * 프론트매터 생성
 */
function createFrontmatter(data) {
  const lines = ['---'];

  for (const [key, value] of Object.entries(data)) {
    if (Array.isArray(value)) {
      lines.push(`${key}: [${value.map((v) => `"${v}"`).join(', ')}]`);
    } else if (typeof value === 'string') {
      lines.push(`${key}: "${value}"`);
    } else if (typeof value === 'boolean') {
      lines.push(`${key}: ${value}`);
    } else if (value instanceof Date) {
      lines.push(`${key}: ${value.toISOString().split('T')[0]}`);
    } else {
      lines.push(`${key}: ${value}`);
    }
  }

  lines.push('---');
  return lines.join('\n');
}

/**
 * 슬러그 생성 (파일명에서)
 */
function createSlug(filename) {
  return filename
    .toLowerCase()
    .replace(/\.md$/, '')
    .replace(/[^a-z0-9가-힣]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Obsidian 이미지 링크를 표준 마크다운으로 변환
 * ![[image.png]] -> ![](./images/posts/slug/image.png)
 */
function convertObsidianImages(content, slug) {
  // ![[image.png]] 형태
  const obsidianImageRegex = /!\[\[([^\]]+)\]\]/g;

  return content.replace(obsidianImageRegex, (match, imagePath) => {
    const imageName = path.basename(imagePath);
    return `![](/images/posts/${slug}/${imageName})`;
  });
}

/**
 * 이미지 파일 복사
 */
async function copyImages(content, vaultPath, slug) {
  const imageDir = path.join(PUBLIC_DIR, slug);
  const obsidianImageRegex = /!\[\[([^\]]+)\]\]/g;
  const matches = [...content.matchAll(obsidianImageRegex)];

  if (matches.length === 0) return;

  await fs.mkdir(imageDir, { recursive: true });

  for (const match of matches) {
    const imagePath = match[1];
    const imageName = path.basename(imagePath);

    // 이미지 경로 찾기 (vault 내에서)
    const possiblePaths = [
      path.join(vaultPath, imagePath),
      path.join(vaultPath, 'attachments', imageName),
      path.join(vaultPath, 'images', imageName),
      path.join(vaultPath, 'assets', imageName),
    ];

    for (const srcPath of possiblePaths) {
      try {
        await fs.access(srcPath);
        const destPath = path.join(imageDir, imageName);
        await fs.copyFile(srcPath, destPath);
        console.log(`  이미지 복사: ${imageName}`);
        break;
      } catch {
        // 파일이 없으면 다음 경로 시도
      }
    }
  }
}

/**
 * 마크다운 파일 처리
 */
async function processMarkdownFile(filePath, vaultPath) {
  const filename = path.basename(filePath);
  const content = await fs.readFile(filePath, 'utf-8');

  const { frontmatter, body } = parseFrontmatter(content);
  const slug = createSlug(filename);

  // 프론트매터 보완
  const newFrontmatter = {
    title: frontmatter.title || filename.replace(/\.md$/, ''),
    description: frontmatter.description || '',
    date: frontmatter.date || new Date().toISOString().split('T')[0],
    tags: frontmatter.tags || [],
    draft: frontmatter.draft ?? false,
  };

  // 이미지 복사
  await copyImages(content, vaultPath, slug);

  // Obsidian 이미지 링크 변환
  const convertedBody = convertObsidianImages(body, slug);

  // 새 마크다운 생성
  const newContent = `${createFrontmatter(newFrontmatter)}\n${convertedBody}`;

  // 파일 저장
  const destPath = path.join(POSTS_DIR, `${slug}.md`);
  await fs.writeFile(destPath, newContent, 'utf-8');

  return slug;
}

/**
 * 메인 함수
 */
async function main() {
  const args = process.argv.slice(2);

  if (args.length < 2) {
    console.log('사용법: node scripts/import-obsidian.mjs <vault-path> <folder-name>');
    console.log('');
    console.log('예시:');
    console.log('  node scripts/import-obsidian.mjs ~/Documents/ObsidianVault Blog');
    process.exit(1);
  }

  const [vaultPath, folderName] = args;
  const sourcePath = path.join(vaultPath, folderName);

  // 소스 폴더 확인
  try {
    await fs.access(sourcePath);
  } catch {
    console.error(`오류: 폴더를 찾을 수 없습니다: ${sourcePath}`);
    process.exit(1);
  }

  // 대상 폴더 생성
  await fs.mkdir(POSTS_DIR, { recursive: true });
  await fs.mkdir(PUBLIC_DIR, { recursive: true });

  // 마크다운 파일 목록
  const files = await fs.readdir(sourcePath);
  const mdFiles = files.filter((f) => f.endsWith('.md'));

  if (mdFiles.length === 0) {
    console.log('가져올 마크다운 파일이 없습니다.');
    process.exit(0);
  }

  console.log(`${mdFiles.length}개의 마크다운 파일을 가져옵니다...\n`);

  for (const file of mdFiles) {
    const filePath = path.join(sourcePath, file);
    try {
      const slug = await processMarkdownFile(filePath, vaultPath);
      console.log(`✓ ${file} -> ${slug}.md`);
    } catch (err) {
      console.error(`✗ ${file}: ${err.message}`);
    }
  }

  console.log('\n완료!');
}

main().catch(console.error);
