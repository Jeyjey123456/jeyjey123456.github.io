import { Exam } from '../types/exam';

export const DEFAULT_ADMIN_KEY = 'wangwibu2026';
export const ADMIN_STORAGE_KEY = 'baitaptracnghiem_is_admin_v1';
export const CUSTOM_ADMIN_KEY_STORAGE = 'baitaptracnghiem_custom_admin_key_v1';

export type ResolvedRoute =
  | { type: 'dashboard'; openLibrary?: boolean }
  | { type: 'take-exam'; examId: string; previewOnly?: boolean }
  | { type: 'create-exam' }
  | { type: 'forbidden'; reason: string };

/**
 * Resolves the current browser pathname and search query into a view or a 'forbidden' state ("bạn không nên ở đây").
 * Supports both root domain deployment (`/`) and GitHub Pages project subdirectory deployment (`/<repo-name>/`).
 */
export function resolveAppRoute(
  pathname: string,
  search: string,
  exams: Pick<Exam, 'id'>[],
  isAdmin: boolean,
  requireDirectExamLinkForGuests = false
): ResolvedRoute {
  const cleanPath = pathname.replace(/\/index\.html$/i, '').replace(/\/+$/, '') || '/';
  const params = new URLSearchParams(search);

  // 1. Check query param exam link: ?de=<id> or ?exam=<id> or ?id=<id>
  const queryExamId = params.get('de') || params.get('exam') || params.get('id');
  if (queryExamId !== null) {
    const trimmedId = queryExamId.trim();
    const found = exams.find((e) => e.id === trimmedId);
    if (!found) {
      return {
        type: 'forbidden',
        reason: 'Link đề thi không tồn tại hoặc không hợp lệ.',
      };
    }
    return { type: 'take-exam', examId: found.id };
  }

  // 2. Check query param view: ?view=...
  const queryView = params.get('view');
  if (queryView !== null) {
    if (queryView === 'create') {
      if (!isAdmin) {
        return {
          type: 'forbidden',
          reason: 'Chỉ Admin mới có quyền truy cập trang tạo đề.',
        };
      }
      return { type: 'create-exam' };
    }
    if (queryView === 'library') {
      return { type: 'dashboard', openLibrary: true };
    }
    if (queryView === 'home') {
      return { type: 'dashboard', openLibrary: false };
    }
    return {
      type: 'forbidden',
      reason: 'Đường dẫn không hợp lệ.',
    };
  }

  // 3. Check path ending with `/lam-bai/<examId>` or `/de/<examId>` (works at root or under `/<repo>/`)
  const examPathMatch = cleanPath.match(/(?:^|\/)(?:lam-bai|de)\/([^/]+)$/i);
  if (examPathMatch) {
    const examId = decodeURIComponent(examPathMatch[1]);
    const found = exams.find((e) => e.id === examId);
    if (!found) {
      return {
        type: 'forbidden',
        reason: 'Link đề thi không đúng hoặc đề thi không tồn tại.',
      };
    }
    return { type: 'take-exam', examId: found.id };
  }

  // 4. Check path ending with `/lam-bai` or `/de` with missing examId
  if (/(?:^|\/)(?:lam-bai|de)$/i.test(cleanPath)) {
    return {
      type: 'forbidden',
      reason: 'Thiếu mã đề thi trong đường dẫn.',
    };
  }

  // 5. Check path ending with `/tao-de` or `/nguoi-dung/tao-de`
  if (/(?:^|\/)(?:nguoi-dung\/)?tao-de$/i.test(cleanPath)) {
    if (!isAdmin) {
      return {
        type: 'forbidden',
        reason: 'Chỉ Admin mới được phép tạo đề thi.',
      };
    }
    return { type: 'create-exam' };
  }

  // 6. Check path ending with `/thu-vien`
  if (/(?:^|\/)thu-vien$/i.test(cleanPath)) {
    return { type: 'dashboard', openLibrary: true };
  }

  // 7. Check root `/`, `/nguoi-dung`, or single-segment GitHub Pages repo base path `/<repo-name>`
  const segments = cleanPath.split('/').filter(Boolean);
  if (cleanPath === '/' || cleanPath === '/nguoi-dung' || segments.length <= 1) {
    if (requireDirectExamLinkForGuests && !isAdmin) {
      return {
        type: 'forbidden',
        reason: 'Vui lòng truy cập thông qua đúng đường dẫn (link) của đề thi.',
      };
    }
    return { type: 'dashboard', openLibrary: false };
  }

  // Any other path -> forbidden
  return {
    type: 'forbidden',
    reason: 'Đường dẫn truy cập không tồn tại.',
  };
}

/**
 * Verifies whether the provided console key matches the active admin key.
 */
export function verifyAdminKey(inputKey: string, customSavedKey?: string | null): boolean {
  if (!inputKey || typeof inputKey !== 'string') return false;
  const activeKey = (customSavedKey && customSavedKey.trim()) || DEFAULT_ADMIN_KEY;
  return inputKey.trim() === activeKey;
}
