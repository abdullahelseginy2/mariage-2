import { useEffect } from 'react';

const normalizeText = (value) => String(value || '').replace(/\s+/g, ' ').trim();

const collectTextValues = (value, target = []) => {
  if (typeof value === 'string' || typeof value === 'number') {
    const normalized = normalizeText(value);
    if (normalized) target.push(normalized);
    return target;
  }

  if (Array.isArray(value)) {
    value.forEach((item) => collectTextValues(item, target));
    return target;
  }

  if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => collectTextValues(item, target));
  }

  return target;
};

const valuesForPath = (invitation, storedPath) => {
  const parts = storedPath.split('.');
  const localeIndex = parts.findIndex((part) => part === 'en' || part === 'ar');
  if (localeIndex !== -1) {
    if (parts[localeIndex] !== invitation.locale) return [];
    parts.splice(localeIndex, 1);
  }

  if (parts.at(-1) === 'events_text') parts[parts.length - 1] = 'events';
  const value = parts.reduce((current, part) => current?.[part], invitation);
  return collectTextValues(value);
};

const buildTextSizeMap = (invitation) => {
  const map = new Map();
  Object.entries(invitation?.font_sizes || {}).forEach(([path, rawSize]) => {
    const size = Number(rawSize);
    if (!Number.isFinite(size) || size < 8 || size > 120) return;
    valuesForPath(invitation, path).forEach((text) => map.set(text, size));
  });
  return map;
};

const directText = (element) => normalizeText(
  Array.from(element.childNodes)
    .filter((node) => node.nodeType === Node.TEXT_NODE)
    .map((node) => node.textContent)
    .join(' '),
);

const rememberAndApply = (element, size) => {
  if (!element.dataset.wilCustomFontSize) {
    element.dataset.wilOriginalFontSize = element.style.fontSize || '';
    element.dataset.wilCustomFontSize = 'true';
  }
  element.style.fontSize = `${size}px`;
};

const restoreFontSizes = (root) => {
  root?.querySelectorAll('[data-wil-custom-font-size="true"]').forEach((element) => {
    element.style.fontSize = element.dataset.wilOriginalFontSize || '';
    delete element.dataset.wilOriginalFontSize;
    delete element.dataset.wilCustomFontSize;
  });
};

const applyFontSizes = (root, sizeMap) => {
  if (!root || !sizeMap.size) return;

  root.querySelectorAll('*').forEach((element) => {
    const text = directText(element);
    if (text && sizeMap.has(text)) rememberAndApply(element, sizeMap.get(text));

    const placeholder = normalizeText(element.getAttribute?.('placeholder'));
    if (placeholder && sizeMap.has(placeholder)) rememberAndApply(element, sizeMap.get(placeholder));
  });
};

export const useCustomFontSizes = (rootRef, invitation) => {
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const sizeMap = buildTextSizeMap(invitation);
    restoreFontSizes(root);
    applyFontSizes(root, sizeMap);

    const observer = new MutationObserver(() => applyFontSizes(root, sizeMap));
    observer.observe(root, { childList: true, subtree: true, characterData: true });

    return () => {
      observer.disconnect();
      restoreFontSizes(root);
    };
  }, [rootRef, invitation]);
};
