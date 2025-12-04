
import { Injectable, signal } from '@angular/core';

export interface InterlinearWord {
  original: string;
  transliteration: string;
  gloss: string;
  strong?: string;
}

export interface VerseData {
  id: string; // 'gn-1-1'
  ref: string; // '1:1'
  verseNumber: number;
  versions: Record<string, string | InterlinearWord[]>;
}

@Injectable({
  providedIn: 'root'
})
export class BibleService {
  
  currentVerses = signal<VerseData[]>([]);
  isLoading = signal(false);

  // API Token provided by user
  private readonly API_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdHIiOiJUaHUgRGVjIDA0IDIwMjUgMTE6MTk6MzYgR01UKzAwMDAubmVsaW9hcHBAZ21haWwuY29tIiwiaWF0IjoxNzY0ODQ3MTc2fQ.J_UKW60gcddcFGrQRxe05cQRNznxM_G0ExfrBQtTA2c';

  // Mapping generic codes to abibliadigital abbreviations
  private bookMap: Record<string, string> = {
    'GEN': 'gn', 'EXO': 'ex', 'LEV': 'lv', 'NUM': 'nm', 'DEU': 'dt',
    'JOS': 'js', 'JDG': 'jz', 'RUT': 'rt', '1SA': '1sm', '2SA': '2sm',
    '1KI': '1rs', '2KI': '2rs', '1CH': '1cr', '2CH': '2cr', 'EZR': 'ed',
    'NEH': 'ne', 'EST': 'et', 'JOB': 'job', 'PSA': 'sl', 'PRO': 'pv',
    'ECC': 'ec', 'SNG': 'ct', 'ISA': 'is', 'JER': 'jr', 'LAM': 'lm',
    'EZK': 'ez', 'DAN': 'dn', 'HOS': 'os', 'JOL': 'jl', 'AMO': 'am',
    'OBA': 'ob', 'JON': 'jn', 'MIC': 'mq', 'NAH': 'na', 'HAB': 'hc',
    'ZEP': 'sf', 'HAG': 'ag', 'ZEC': 'zc', 'MAL': 'ml',
    'MAT': 'mt', 'MAR': 'mc', 'LUK': 'lc', 'JHN': 'jo', 'ACT': 'at',
    'ROM': 'rm', '1CO': '1co', '2CO': '2co', 'GAL': 'gl', 'EPH': 'ef',
    'PHP': 'fp', 'COL': 'cl', '1TH': '1ts', '2TH': '2ts', '1TI': '1tm',
    '2TI': '2tm', 'TIT': 'tt', 'PHM': 'fm', 'HEB': 'hb', 'JAM': 'tg',
    '1PE': '1pe', '2PE': '2pe', '1JO': '1jo', '2JO': '2jo', '3JO': '3jo',
    'JUD': 'jd', 'REV': 'ap'
  };

  constructor() {
    this.loadPassage('GEN', 1);
  }

  async loadPassage(bookCode: string, chapter: number) {
    this.isLoading.set(true);
    const abbrev = this.bookMap[bookCode] || 'gn';

    try {
      // Fetch versions in parallel using abibliadigital API
      const [nvi, acf, ra, kja, kjv, bbe] = await Promise.all([
        this.fetchApi(abbrev, chapter, 'nvi'),
        this.fetchApi(abbrev, chapter, 'acf'),
        this.fetchApi(abbrev, chapter, 'ra'),
        this.fetchApi(abbrev, chapter, 'kja'),
        this.fetchApi(abbrev, chapter, 'kjv'),
        this.fetchApi(abbrev, chapter, 'bbe')
      ]);

      let length = Math.max(
        nvi.length || 0, 
        acf.length || 0,
        kjv.length || 0
      );

      // FALLBACK MECHANISM: If API blocked (length 0) and it's Gen 1, use fallback data
      let usingFallback = false;
      if (length === 0 && bookCode === 'GEN' && chapter === 1) {
         length = 3; // Show first 3 verses as demo
         usingFallback = true;
         console.warn('API Rate limited or failed. Using fallback data for Genesis 1.');
      }
      
      const newVerses: VerseData[] = [];

      for (let i = 0; i < length; i++) {
        const verseNum = i + 1;
        
        // Helper to extract text safely from array
        const getText = (source: any[], versionKey: string) => {
          if (usingFallback) {
             return this.getFallbackText(versionKey, verseNum);
          }
          const v = source.find((item: any) => item.number === verseNum);
          return v ? v.text.trim() : '';
        };

        // Logic for Original Text (Mocked for Genesis 1 Demo)
        let originalData: InterlinearWord[] = [];
        if (bookCode === 'GEN' && chapter === 1 && verseNum <= 3) {
           originalData = this.getMockGen1Data(verseNum);
        }

        newVerses.push({
          id: `${abbrev}-${chapter}-${verseNum}`,
          ref: `${chapter}:${verseNum}`,
          verseNumber: verseNum,
          versions: {
            nvi: getText(nvi, 'nvi'),
            acf: getText(acf, 'acf'),
            ra: getText(ra, 'ra'),
            kja: getText(kja, 'kja'),
            kjv: getText(kjv, 'kjv'),
            bbe: getText(bbe, 'bbe'),
            original: originalData
          }
        });
      }

      this.currentVerses.set(newVerses);

    } catch (error) {
      console.error('Failed to load bible data', error);
      this.currentVerses.set([]);
    } finally {
      this.isLoading.set(false);
    }
  }

  private async fetchApi(bookAbbrev: string, chapter: number, version: string) {
    try {
      const response = await fetch(`https://www.abibliadigital.com.br/api/verses/${version}/${bookAbbrev}/${chapter}`, {
        headers: {
          'Authorization': `Bearer ${this.API_TOKEN}`,
          'Content-Type': 'application/json'
        }
      });
      if (!response.ok) {
        return [];
      }
      const data = await response.json();
      return data.verses || [];
    } catch (e) {
      return [];
    }
  }

  private getMockGen1Data(verse: number): InterlinearWord[] {
    const data: Record<number, InterlinearWord[]> = {
      1: [
          { original: 'בְּרֵאשִׁית', transliteration: 'Bereshit', gloss: 'In beginning' },
          { original: 'בָּרָא', transliteration: 'bara', gloss: 'created' },
          { original: 'אֱלֹהִים', transliteration: 'Elohim', gloss: 'God' },
          { original: 'אֵת', transliteration: 'et', gloss: '(obj)' },
          { original: 'הַשָּׁמַיִם', transliteration: 'hashamayim', gloss: 'the heavens' },
          { original: 'וְאֵת', transliteration: 'veet', gloss: 'and' },
          { original: 'הָאָרֶץ', transliteration: 'haaretz', gloss: 'the earth' }
      ],
      2: [
          { original: 'וְהָאָרֶץ', transliteration: 'vehaaretz', gloss: 'Now the earth' },
          { original: 'הָיְתָה', transliteration: 'hayeta', gloss: 'was' },
          { original: 'תֹהוּ', transliteration: 'tohu', gloss: 'formless' },
          { original: 'וָבֹהוּ', transliteration: 'vavohu', gloss: 'and void' },
          { original: 'וְחֹשֶׁךְ', transliteration: 'vechoshech', gloss: 'and darkness' },
          { original: 'עַל', transliteration: 'al', gloss: 'upon' },
          { original: 'פְּנֵי', transliteration: 'pnei', gloss: 'face of' },
          { original: 'תְהוֹם', transliteration: 'tehom', gloss: 'deep' }
      ],
      3: [
          { original: 'וַיֹּאמֶר', transliteration: 'vayomer', gloss: 'And said' },
          { original: 'אֱלֹהִים', transliteration: 'Elohim', gloss: 'God' },
          { original: 'יְהִי', transliteration: 'yehi', gloss: 'let be' },
          { original: 'אוֹר', transliteration: 'or', gloss: 'light' },
          { original: 'וַיְהִי', transliteration: 'vayehi', gloss: 'and was' },
          { original: 'אוֹר', transliteration: 'or', gloss: 'light' }
      ]
    };
    return data[verse] || [];
  }

  private getFallbackText(version: string, verse: number): string {
     // Small subset for Gen 1:1-3 to allow app to function without API
     const db: Record<number, Record<string, string>> = {
       1: {
         nvi: 'No princípio Deus criou os céus e a terra.',
         acf: 'No princípio criou Deus os céus e a terra.',
         ra: 'No princípio criou Deus os céus e a terra.',
         kja: 'No princípio criou Deus os céus e a terra.',
         kjv: 'In the beginning God created the heaven and the earth.',
         bbe: 'At the first God made the heaven and the earth.'
       },
       2: {
         nvi: 'Era a terra sem forma e vazia; trevas cobriam a face do abismo, e o Espírito de Deus se movia sobre a face das águas.',
         acf: 'E a terra era sem forma e vazia; e havia trevas sobre a face do abismo; e o Espírito de Deus se movia sobre a face das águas.',
         ra: 'A terra, porém, estava sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava por sobre as águas.',
         kja: 'A terra, entretanto, era sem forma e vazia; havia trevas sobre a face do abismo, e o Espírito de Deus pairava sobre as águas.',
         kjv: 'And the earth was without form, and void; and darkness was upon the face of the deep. And the Spirit of God moved upon the face of the waters.',
         bbe: 'And the earth was waste and without form; and it was dark on the face of the deep: and the Spirit of God was moving on the face of the waters.'
       },
       3: {
         nvi: 'Disse Deus: "Haja luz", e houve luz.',
         acf: 'E disse Deus: Haja luz; e houve luz.',
         ra: 'Disse Deus: Haja luz; e houve luz.',
         kja: 'Disse Deus: "Haja luz!", e houve luz.',
         kjv: 'And God said, Let there be light: and there was light.',
         bbe: 'And God said, Let there be light: and there was light.'
       }
     };
     return db[verse]?.[version] || '(Text unavailable via API)';
  }
}
