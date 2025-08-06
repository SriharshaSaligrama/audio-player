# Audio Player Next MongoDB

This is an audio player app built with Next.js and MongoDB.

## Folder Structure

The folder structure of this project is as follows:

audio-player-next-mongo/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── actions/
│   │   ├── artists/
│   │   │   ├── create.ts
│   │   │   ├── update.ts
│   │   │   ├── delete.ts
│   │   │   └── get.ts
│   │   ├── tracks/
│   │   │   ├── create.ts
│   │   │   ├── update.ts
│   │   │   ├── delete.ts
│   │   │   └── get.ts
│   │   ├── albums/
│   │   │   ├── create.ts
│   │   │   ├── update.ts
│   │   │   ├── delete.ts
│   │   │   └── get.ts
│   │   └── users/
│   │       ├── create.ts
│   │       ├── update.ts
│   │       ├── delete.ts
│   │       └── get.ts
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   └── ...
│   │   ├── forms/
│   │   │   ├── ArtistForm.tsx
│   │   │   ├── TrackForm.tsx
│   │   │   └── ...
│   │   └── shared/
│   │       ├── Header.tsx
│   │       ├── Footer.tsx
│   │       └── ...
│   ├── lib/
│   │   ├── mongodb.ts
│   │   └── schemas/
│   │       ├── artist.schema.ts
│   │       ├── track.schema.ts
│   │       ├── album.schema.ts
│   │       └── user.schema.ts
│   ├── types/
│   │   ├── globals.d.ts
│   │   └── schemas.ts
│   └── utils/
│       ├── roles.ts
│       └── validation.ts
├── public/
│   ├── images/
│   └── audio/
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md