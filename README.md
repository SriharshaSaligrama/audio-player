# Audio Player Next MongoDB

This is an audio player app built with Next.js and MongoDB.

## Folder Structure

The folder structure of this project is as follows:

```
audio-player-next-mongo/
├── src/
│   ├── app/
│   │   ├── layout.tsx
│   │   └── page.tsx
│   ├── actions/
│   │   ├── artists.ts (CRUD actions for artists)
│   │   ├── tracks.ts (CRUD actions for tracks)
│   │   ├── albums.ts (CRUD actions for albums)
│   │   └── users.ts (CRUD actions for users)
│   |   └── playlists.ts (CRUD actions for playlists)
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
│   │       ├── artist.ts
│   │       ├── track.ts
│   │       ├── album.ts
│   │       └── user.ts
│   |       └── playlist.ts
│   ├── types/
│   │   ├── globals.d.ts
│   │   └── ...
│   └── utils/
│       ├── roles.ts
│       └── validation.ts
├── .env.local
├── .gitignore
├── next.config.js
├── package.json
├── tsconfig.json
└── README.md
```