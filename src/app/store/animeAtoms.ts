import { atom } from 'jotai';
import { CardInterface, SelectedAnime } from '@/lib/types';
import { AnimeDetailsQuery } from '@/lib/graphql/generated/graphql';

export const watchlistedIdsAtom = atom<number[] | null>(null);

export const watchlistedAnimesAtom = atom<CardInterface[] | null>(null);

export const currentCalendarAtom = atom<CardInterface[] | null>(null);

export const animeModelAtom = atom<CardInterface | null>(null);

export const selectedAnimeAtom = atom<AnimeDetailsQuery['Media'] | null>(null);
