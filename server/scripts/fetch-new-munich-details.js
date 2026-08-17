import 'dotenv/config';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const IMG_DIR = path.join(__dirname, '../../public/images/shops');
const GALLERY_DIR = path.join(__dirname, '../../public/images/shops/gallery');
const MAX_GALLERY_PHOTOS = 5;

if (!API_KEY) {
  console.error('GOOGLE_PLACES_API_KEY is not set in server/.env');
  process.exit(1);
}

fs.mkdirSync(IMG_DIR, { recursive: true });
fs.mkdirSync(GALLERY_DIR, { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const shops = [
  { slug: 'kanso-coffee-lab', name: 'Kanso Coffee Lab', address: 'Theatinerstraße 35, Residenzpassage, 80333 Munich' },
  { slug: 'stray-coffee-roasters', name: 'Stray Coffee Roasters', address: 'Gollierstraße 30, 80339 Munich' },
  { slug: 'cafe-faber', name: 'Café Faber', address: 'Zeppelinstraße 5, 81541 Munich' },
  { slug: 'coffee-twins', name: 'Coffee Twins', address: 'Ehrengutstraße 18, 80469 Munich' },
  { slug: 'sweet-spot-kaffee-viktualienmarkt', name: 'Sweet Spot Kaffee', address: 'Heiliggeiststraße 1, 80331 Munich' },
  { slug: 'sweet-spot-kaffee-reichenbachstrasse', name: 'Sweet Spot Kaffee', address: 'Reichenbachstraße 38, 80469 Munich' },
  { slug: 'southbank-specialty-coffee', name: 'Southbank Specialty Coffee', address: 'Guldeinstraße 30, 80339 Munich' },
  { slug: 'calima-specialty-coffee', name: 'Calima Specialty Coffee', address: 'Nestroystraße 2, 81373 Munich' },
  { slug: 'humpback-whale-specialty-coffee', name: 'Humpback Whale Specialty Coffee', address: 'Türkenstraße 84a, Amalien Passage, 80799 Munich' },
  { slug: 'suuapinga', name: 'Suuapinga', address: 'Müllerstraße 46, 80469 Munich' },
  { slug: 'the-barn-tal', name: 'The Barn', address: 'Tal 15, 80331 Munich' },
  { slug: 'the-barn-glockenbachviertel', name: 'The Barn', address: 'Müllerstraße 38, 80469 Munich' },
];

const DAY_KEYS = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];

function pad(n) {
  return String(n).padStart(2, '0');
}

function periodsToHours(periods) {
  if (!periods || periods.length === 0) return null;
  const hours = {};
  for (const p of periods) {
    if (!p.open) continue;
    const day = DAY_KEYS[p.open.day];
    const openTime = `${p.open.time.slice(0, 2)}:${p.open.time.slice(2)}`;
    const closeTime = p.close ? `${p.close.time.slice(0, 2)}:${p.close.time.slice(2)}` : '23:59';
    hours[day] = `${openTime}-${closeTime}`;
  }
  return Object.keys(hours).length ? hours : null;
}

async function findPlaceId(shop) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/findplacefromtext/json');
  url.searchParams.set('input', `${shop.name}, ${shop.address}`);
  url.searchParams.set('inputtype', 'textquery');
  url.searchParams.set('fields', 'place_id');
  url.searchParams.set('key', API_KEY);
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK' || !data.candidates?.length) return null;
  return data.candidates[0].place_id;
}

async function getDetails(placeId) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/details/json');
  url.searchParams.set('place_id', placeId);
  url.searchParams.set('fields', 'opening_hours,photos,website');
  url.searchParams.set('key', API_KEY);
  const res = await fetch(url);
  const data = await res.json();
  if (data.status !== 'OK') return null;
  return data.result;
}

async function downloadPhoto(photoReference, destPath, maxwidth) {
  const url = new URL('https://maps.googleapis.com/maps/api/place/photo');
  url.searchParams.set('maxwidth', String(maxwidth));
  url.searchParams.set('photo_reference', photoReference);
  url.searchParams.set('key', API_KEY);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Photo download failed: ${res.status}`);
  fs.writeFileSync(destPath, Buffer.from(await res.arrayBuffer()));
}

async function main() {
  const output = {};

  for (const shop of shops) {
    process.stdout.write(`${shop.name} (${shop.slug})... `);
    try {
      const placeId = await findPlaceId(shop);
      if (!placeId) {
        console.log('NO PLACE MATCH');
        continue;
      }
      await sleep(150);
      const details = await getDetails(placeId);
      if (!details) {
        console.log('NO DETAILS');
        continue;
      }

      const photos = details.photos ?? [];
      let image = null;
      const images = [];

      if (photos.length > 0) {
        const coverPath = path.join(IMG_DIR, `${shop.slug}.jpg`);
        await downloadPhoto(photos[0].photo_reference, coverPath, 800);
        image = `/images/shops/${shop.slug}.jpg`;
        await sleep(120);

        const galleryPhotos = photos.slice(0, MAX_GALLERY_PHOTOS);
        for (let i = 0; i < galleryPhotos.length; i++) {
          const galPath = path.join(GALLERY_DIR, `${shop.slug}-${i + 1}.jpg`);
          await downloadPhoto(galleryPhotos[i].photo_reference, galPath, 1000);
          images.push(`/images/shops/gallery/${shop.slug}-${i + 1}.jpg`);
          await sleep(120);
        }
      }

      const hours = periodsToHours(details.opening_hours?.periods);

      output[shop.slug] = {
        image,
        images,
        hours,
        website: details.website ?? null,
      };

      console.log(`ok (${images.length} photos, hours: ${hours ? 'yes' : 'no'})`);
    } catch (err) {
      console.log(`ERROR (${err.message})`);
    }
    await sleep(150);
  }

  fs.writeFileSync(path.join(__dirname, 'new-munich-details.json'), JSON.stringify(output, null, 2));
  console.log('\nWritten to new-munich-details.json');
}

main();
