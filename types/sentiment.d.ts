declare module 'sentiment' {
  export default class Sentiment {
    analyze(
      text: string,
      options?: any,
      callback?: any
    ): {
      score: number;
      comparative: number;
      calculation: any[];
      tokens: string[];
      words: string[];
      positive: string[];
      negative: string[];
    };
  }
}
