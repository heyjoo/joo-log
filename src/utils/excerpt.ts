/**
 * 마크다운 본문에서 서식을 걷어내고 앞부분을 잘라 요약문으로 만든다.
 */
export function getExcerpt(markdown: string = '', maxLength = 150): string {
  const text = markdown
    .replace(/```[\s\S]*?```/g, ' ') // 코드 블록
    .replace(/<[^>]+>/g, ' ') // HTML 태그
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ') // 이미지
    .replace(/!\[\[[^\]]*\]\]/g, ' ') // Obsidian 이미지
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1') // 링크 → 텍스트
    .replace(/`([^`]*)`/g, '$1') // 인라인 코드
    .replace(/^\s{0,3}#{1,6}\s+.*$/gm, ' ') // 제목 줄
    .replace(/^\s{0,3}(>|[-*+]|\d+\.)\s+/gm, '') // 인용/목록 기호
    .replace(/^\s*([-*_]\s*){3,}$/gm, ' ') // 구분선
    .replace(/(\*\*|__|\*|_|~~)(.+?)\1/g, '$2') // 강조
    .replace(/\s+/g, ' ')
    .trim();

  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength).trimEnd() + '…';
}
