export type CvPdfSpec = {
  readonly locale: 'es' | 'en';
  readonly view: 'compact' | 'standard';
  readonly photo: boolean;
  readonly expectedPages: number;
  readonly expectedLocalizedHeading: string;
  readonly expectedLocalizedLanguage: string;
};

export declare const CV_PUBLIC_PDF_SPECS: readonly CvPdfSpec[];
export declare const CV_INPUT_FILES: readonly string[];

export declare function publicPdfFilename(
  locale: 'es' | 'en',
  view: 'compact' | 'standard',
  photo?: boolean,
): string;

export declare function privatePdfFilename(
  locale: 'es' | 'en',
  view: 'compact' | 'standard',
  photo?: boolean,
): string;

export declare function computeFileSha256(filePath: string): string;

export declare function computeCvInputHash(repoRoot: string): string;
