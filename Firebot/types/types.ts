export type BeatSaverAuthor = {
    id: number
    name: string
    avatar: string
    curator: boolean
    verifiedMapper: boolean
}

export type BeatSaverSongData = {
    id: string
    name: string,
    description: string
    uploader: BeatSaverAuthor,
    metadata: {
        bpm: number
        duration: number
        songName: string
        songSubName: string
        songAuthorName: string
        levelAuthorName: string
    },
    uploaded: string
    ranked: boolean
    qualified: boolean
    tags: string[],
    curatedAt: string
    createdAt: string
    updatedAt: string
    lastPublishedAt: string
    collaborators?: BeatSaverAuthor[]
    declaredAi: "None" | string
    blRanked: boolean
    blQualified: boolean
}

export type AuthorLookupJson = {
    twitchUserToBeatSaverProfile: Record<string, string>
    lastUpdated: number
};

export type AuthorLookupDictionary = Record<string, string[]>;