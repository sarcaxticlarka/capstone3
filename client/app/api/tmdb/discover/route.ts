import { NextResponse } from 'next/server';

const TMDB_BASE = 'https://api.themoviedb.org/3';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const type = url.searchParams.get('type') || 'movie';
  const genre = url.searchParams.get('genre') || '';
  const page = url.searchParams.get('page') || '1';
  const sortBy = url.searchParams.get('sort_by') || 'popularity.desc';
  const withKeywords = url.searchParams.get('with_keywords') || '';
  const region = url.searchParams.get('region') || '';
  const withOriginalLanguage = url.searchParams.get('with_original_language') || '';
  const voteCountGte = url.searchParams.get('vote_count.gte') || '';

  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
  }

  try {
    let queryParams = `api_key=${apiKey}&page=${page}&sort_by=${sortBy}`;
    if (genre) queryParams += `&with_genres=${genre}`;
    if (withKeywords) queryParams += `&with_keywords=${withKeywords}`;
    if (region) queryParams += `&region=${region}`;
    if (withOriginalLanguage) queryParams += `&with_original_language=${withOriginalLanguage}`;
    if (voteCountGte) queryParams += `&vote_count.gte=${voteCountGte}`;

    const res = await fetch(`${TMDB_BASE}/discover/${type}?${queryParams}`);
    const data = await res.json();
    return NextResponse.json(data);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Failed to fetch' }, { status: 500 });
  }
}
