export function truncate(str, n = 4) {
  return str.substr(0, n) + "..." + str.substr(str.length - n, str.length);
}

export function copyToClipboard(text, onCopySuccess = () => {}) {
  // https://developer.mozilla.org/en-US/docs/Web/API/Clipboard/writeText
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text);
  } else {
    // https://stackoverflow.com/a/30810322/130910
    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
  }
  onCopySuccess();
}
