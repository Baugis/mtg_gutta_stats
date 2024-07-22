interface Match {
    id: string;
    type: string;
    date_played: string;
    players: {
        deck_id: number;
        result: 'winner' | 'loser';
        owner_id: number;
        team: number;
    }[];
    notes?: string;
}

interface Player {
    id: number;
    name: string;
}

interface Deck {
    id: number;
    name: string;
    owner: number;
}

interface GameCount {
    opponentId: number;
    opponentName: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
}

interface DeckStat {
    id: number;
    deck_id: number;
    owner_id: number;
    '1v1_wins': number;
    '1v1_losses': number;
    '3_man_ffa_wins': number;
    '3_man_ffa_losses': number;
    '4_man_ffa_wins': number;
    '4_man_ffa_losses': number;
    'two_head_giant_wins': number;
    'two_head_giant_losses': number;
    'star_wins': number;
    'star_losses': number;
}

interface ColorCombination {
    [key: string]: string;
}

export const colorCombinations: ColorCombination[] = [
    { "B": "Black" },
    { "G": "Green" },
    { "R": "Red" },
    { "U": "Blue" },
    { "W": "White" },
    { "U,W": "Azorius" },
    { "R,W": "Boros" },
    { "B,U": "Dimir" },
    { "B,G": "Golgari" },
    { "G,R": "Gruul" },
    { "R,U": "Izzet" },
    { "B,W": "Orzhov" },
    { "B,R": "Rakdos" },
    { "G,W": "Selesnya" },
    { "G,U": "Simic" },
    { "B,G,W": "Abzan" },
    { "G,U,W": "Bant" },
    { "B,U,W": "Esper" },
    { "B,R,U": "Grixis" },
    { "R,U,W": "Jeskai" },
    { "B,G,R": "Jund" },
    { "B,R,W": "Mardu" },
    { "G,R,W": "Naya" },
    { "B,G,U": "Sultai" },
    { "G,R,U": "Temur" },
    { "B,G,R,U": "Glint" },
    { "B,G,R,W": "Dune" },
    { "G,R,U,W": "Ink" },
    { "B,G,U,W": "Witch" },
    { "B,R,U,W": "Yore" },
    { "B,G,R,U,W": "Rainbow" },
    { "": "Colorless" }
];

export const countGamesAgainstPlayers = (matches: Match[], currentPlayerId: any, players: Player[], decks: Deck[]): GameCount[] => {
    const playerMap = players.reduce((map, player) => {
        map[player.id] = player.name;
        return map;
    }, {} as { [key: number]: string });

    const deckOwnerMap = decks.reduce((map, deck) => {
        map[deck.id] = deck.owner;
        return map;
    }, {} as { [key: number]: number });

    console.log('Player Map:', playerMap);
    console.log('Deck Owner Map:', deckOwnerMap);

    const gameCountMap: { [key: number]: GameCount } = {};

    matches.forEach(match => {
        const currentPlayerDecks = match.players.filter(player => deckOwnerMap[player.deck_id] === currentPlayerId);
        const opponentDecks = match.players.filter(player => deckOwnerMap[player.deck_id] !== currentPlayerId);

        currentPlayerDecks.forEach(currentPlayer => {
            opponentDecks.forEach(opponent => {
                const ownerId = deckOwnerMap[opponent.deck_id];
                if (ownerId) {
                    if (!gameCountMap[ownerId]) {
                        gameCountMap[ownerId] = {
                            opponentId: ownerId,
                            opponentName: playerMap[ownerId] || 'Unknown',
                            gamesPlayed: 0,
                            wins: 0,
                            losses: 0,
                            winRate: 0,
                        };
                    }
                    gameCountMap[ownerId].gamesPlayed += 1;
                    if (currentPlayer.result === 'winner') {
                        gameCountMap[ownerId].wins += 1;
                    } else {
                        gameCountMap[ownerId].losses += 1;
                    }
                }
            });
        });
    });

    Object.values(gameCountMap).forEach(count => {
        if (count.gamesPlayed > 0) {
            count.winRate = (count.wins / count.gamesPlayed) * 100;
        }
    });

    console.log('Game Count Map:', gameCountMap);

    return Object.values(gameCountMap)
        .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
        .slice(0, 5);
};

export const countGamesAgainstDecks = (matches: Match[], currentDeckId: number, decks: Deck[]): GameCount[] => {
    const deckMap: { [key: number]: string } = decks.reduce((map, deck) => {
        map[deck.id] = deck.name;
        return map;
    }, {});

    const deckOwnerMap: { [key: number]: number } = decks.reduce((map, deck) => {
        map[deck.id] = deck.owner;
        return map;
    }, {});

    const gameCountMap: { [key: number]: GameCount } = {};

    matches.forEach(match => {
        const currentDeckPlayers = match.players.filter(player => player.deck_id === currentDeckId);
        if (currentDeckPlayers.length === 0) return;

        const currentTeam = currentDeckPlayers[0].team;
        const opponentDeckPlayers = match.players.filter(player => player.deck_id !== currentDeckId && player.team !== currentTeam);

        currentDeckPlayers.forEach(currentDeckPlayer => {
            opponentDeckPlayers.forEach(opponent => {
                const deckId = opponent.deck_id;
                if (deckId) {
                    if (!gameCountMap[deckId]) {
                        gameCountMap[deckId] = {
                            opponentId: deckId,
                            opponentName: deckMap[deckId] || 'Unknown',
                            gamesPlayed: 0,
                            wins: 0,
                            losses: 0,
                            winRate: 0,
                        };
                    }
                    gameCountMap[deckId].gamesPlayed += 1;
                    if (currentDeckPlayer.result === 'winner') {
                        gameCountMap[deckId].wins += 1;
                    } else {
                        gameCountMap[deckId].losses += 1;
                    }
                }
            });
        });
    });

    Object.values(gameCountMap).forEach(count => {
        if (count.gamesPlayed > 0) {
            count.winRate = (count.wins / count.gamesPlayed) * 100;
        }
    });

    return Object.values(gameCountMap)
        .sort((a, b) => b.gamesPlayed - a.gamesPlayed)
        .slice(0, 5);
};

export const calculateTotalGames = (deckStats: DeckStat[]): number => {
    return deckStats.reduce((acc, stat) => {
        const totalWins = stat["1v1_wins"] + stat["3_man_ffa_wins"] + stat["4_man_ffa_wins"] + stat["two_head_giant_wins"] + stat["star_wins"];
        const totalLosses = stat["1v1_losses"] + stat["3_man_ffa_losses"] + stat["4_man_ffa_losses"] + stat["two_head_giant_losses"] + stat["star_losses"];
        return acc + totalWins + totalLosses;
    }, 0);
};

export const calculateTotalWins = (deckStats: DeckStat[]): number => {
    return deckStats.reduce((acc, stat) => {
        return acc + stat["1v1_wins"] + stat["3_man_ffa_wins"] + stat["4_man_ffa_wins"] + stat["two_head_giant_wins"] + stat["star_wins"];
    }, 0);
};

export const calculateTotalLosses = (deckStats: DeckStat[]): number => {
    return deckStats.reduce((acc, stat) => {
        return acc + stat["1v1_losses"] + stat["3_man_ffa_losses"] + stat["4_man_ffa_losses"] + stat["two_head_giant_losses"] + stat["star_losses"];
    }, 0);
};

export const calculateTotalWinPercentage = (deckStats: DeckStat[]): number => {
    const totalGames = calculateTotalGames(deckStats);
    const totalWins = calculateTotalWins(deckStats);

    if (totalGames === 0) {
        return 0;
    }

    const winPercentage = (totalWins / totalGames) * 100;
    return Math.round(winPercentage);
};