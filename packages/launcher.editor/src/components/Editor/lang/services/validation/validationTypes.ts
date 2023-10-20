import { ExpectationManager, Options } from '../../expectations/expectations';

export type MatchMessage = { text: string; priority: number; range?: { form: number; to: number } };

export type MatchObject = { valid: boolean; message?: MatchMessage; skip?: 'subtree' | 'this object' };
export type Match = MatchObject | false;
export type Matcher = (expectations: ExpectationManager, options: Options) => Match;

export type Marker = {
    from: number;
    to: number;
    message: string;
};
