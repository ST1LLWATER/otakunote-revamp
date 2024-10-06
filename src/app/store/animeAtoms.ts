import { atom } from 'jotai';
import { CardInterface } from '@/interfaces';

export const watchlistedIdsAtom = atom<number[] | null>(null);
export const watchlistedAnimesAtom = atom<CardInterface[] | null>(null);
export const currentCalendarAtom = atom<CardInterface[] | null>(null);

export const selectedAnimeAtom = atom<any | null>(null);
