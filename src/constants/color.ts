export enum LabelColor {
  "editor" = "editor",
  "art" = "art",
  "web development" = "web development",
  "mathematics" = "mathematics",
  "artificial intelligence" = "artificial intelligence",
  "blockchain" = "blockchain",
  "data visualization" = "data visualization",
}

export const LabelColorEnum = {
  [LabelColor.editor]: "#8ecae6",
  [LabelColor.art]: "#219ebc",
  [LabelColor["web development"]]: "#126782",
  [LabelColor["mathematics"]]: "#023047",
  [LabelColor["artificial intelligence"]]: "#ffb703",
  [LabelColor.blockchain]: "#fd9e02",
  [LabelColor["data visualization"]]: "#fb8500",
};

export const LabelColorer = (label: string) => {
  switch (label) {
    case LabelColor.editor:
      return LabelColorEnum[LabelColor.editor];
    case LabelColor.art:
      return LabelColorEnum[LabelColor.art];
    case LabelColor["web development"]:
      return LabelColorEnum[LabelColor["web development"]];
    case LabelColor["mathematics"]:
      return LabelColorEnum[LabelColor["mathematics"]];
    case LabelColor["artificial intelligence"]:
      return LabelColorEnum[LabelColor["artificial intelligence"]];
    case LabelColor.blockchain:
      return LabelColorEnum[LabelColor.blockchain];
    case LabelColor["data visualization"]:
      return LabelColorEnum[LabelColor["data visualization"]];
    default:
      return "yellow";
  }
};
