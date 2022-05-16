type WordHistory = {
  word: string;
  pageId: string | null;
};

type Dir = "left" | "right";
type BalloonSay = {
  text: string;
  dir: Dir;
  url?: string;
};

type HiraganaAPI = {
  converted: string;
};
type WikipediaApi = {};
