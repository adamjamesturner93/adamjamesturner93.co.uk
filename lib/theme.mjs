export const themeKey = 'adam-theme';
export function parseTheme(value) {
  return value === 'light' || value === 'dark' ? value : 'system';
}
export function resolveTheme(value, dark) {
  return parseTheme(value) === 'system' ? (dark ? 'dark' : 'light') : value;
}
export const themeBootstrap = `(function(){try{var t=localStorage.getItem('adam-theme');if(t==='light'||t==='dark')document.documentElement.dataset.theme=t;}catch(e){}})();`;
