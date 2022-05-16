const hiraganaPair: { [key: string]: string } = {
  ぁ: "あ",
  ぃ: "い",
  ぅ: "う",
  ぇ: "え",
  ぉ: "お",
  っ: "つ",
  ゃ: "や",
  ゅ: "ゆ",
  ょ: "よ",
  ゎ: "わ",
  を: "お",
  ヶ: "け",
  ッ: "つ",
};

export default function toUpper(hiragana: any) {
  if (Object.keys(hiraganaPair).includes(hiragana)) {
    return hiraganaPair[hiragana];
  } else return hiragana;
}

export function hiraToKana(str: string): string {
  return str.replace(/[\u3041-\u3096]/g, function (match) {
    const chr = match.charCodeAt(0) + 0x60;
    return String.fromCharCode(chr);
  });
}
export function kanaToHira(str: string): string {
  return str.replace(/[\u30A1-\u30F6]/g, function (match) {
    const chr = match.charCodeAt(0) - 0x60;
    return String.fromCharCode(chr);
  });
}
