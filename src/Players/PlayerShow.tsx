import { FC, useState, useEffect } from 'react';
import { Show, TextField, Form, useGetList, useRecordContext, ReferenceManyCount, List, Datagrid, ReferenceField, RaRecord, useGetOne, ImageField, RecordContextProvider, Link, CreateButton, Count } from 'react-admin';
import Grid from '@mui/material/Grid';
import Card from '@mui/material/Card';
import Box from '@mui/material/Box';
import DeckColors from '../Decks/DeckColors';
import { Typography, useMediaQuery, Theme, IconButton } from '@mui/material';
import { countGamesAgainstPlayers } from '../Helpers/utils';
import { checkRetired } from '../Helpers/checkRetired';

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

interface DeckStatsProps {
    deckStats: DeckStat[];
}

interface PlayerInfoProps {
    type: 'name' | 'deck';
    label?: string;
}

interface TotalGamesFieldProps {
    type: 'games' | 'wins' | 'losses' | 'percentage';
    label?: string;
    aggregate?: boolean;
    sortField?: string;
    sortOrder?: 'ASC' | 'DESC';
}

interface GameCount {
    opponentId: number;
    opponentName: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    winRate: number;
}

const calculateTotalGames = ({ deckStats }: DeckStatsProps): number => {
    return deckStats.reduce((acc, stat) => {
        const totalWins = stat["1v1_wins"] + stat["3_man_ffa_wins"] + stat["4_man_ffa_wins"] + stat["two_head_giant_wins"] + stat["star_wins"];
        const totalLosses = stat["1v1_losses"] + stat["3_man_ffa_losses"] + stat["4_man_ffa_losses"] + stat["two_head_giant_losses"] + stat["star_losses"];
        return acc + totalWins + totalLosses;
    }, 0);
};

const calculateTotalWins = ({ deckStats }: DeckStatsProps): number => {
    return deckStats.reduce((acc, stat) => {
        return acc + stat["1v1_wins"] + stat["3_man_ffa_wins"] + stat["4_man_ffa_wins"] + stat["two_head_giant_wins"] + stat["star_wins"];
    }, 0);
};

const calculateTotalLosses = ({ deckStats }: DeckStatsProps): number => {
    return deckStats.reduce((acc, stat) => {
        return acc + stat["1v1_losses"] + stat["3_man_ffa_losses"] + stat["4_man_ffa_losses"] + stat["two_head_giant_losses"] + stat["star_losses"];
    }, 0);
};

const calculateTotalWinPercentage = ({ deckStats }: DeckStatsProps): number => {
    const totalGames = calculateTotalGames({ deckStats });
    const totalWins = calculateTotalWins({ deckStats });

    if (totalGames === 0) {
        return 0; // Hvis det ikke er noen spill registrert, returner 0%
    }

    const winPercentage = (totalWins / totalGames) * 100;
    return Math.round(winPercentage); // Rund til nærmeste heltall
};

const TotalGamesField: FC<TotalGamesFieldProps> = ({ type, label, aggregate = false }) => {
    const record = useRecordContext<RaRecord>();
    const { data, isLoading, error } = useGetList<DeckStat>(
        'deck_stat',
        {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
            filter: aggregate ? { owner_id: record?.id } : { owner_id: record?.owner_id },
        },
    );

    if (isLoading) return <span>Loading...</span>;
    if (error) return <span>Error loading deck stats</span>;

    const deckStats = data ? (aggregate ? data : data.filter(stat => stat.deck_id === record?.id)) : [];
    let total = 0;
    if (type === 'games') {
        total = calculateTotalGames({ deckStats });
    } else if (type === 'wins') {
        total = calculateTotalWins({ deckStats });
    } else if (type === 'losses') {
        total = calculateTotalLosses({ deckStats });
    } else if (type === 'percentage') {
        total = calculateTotalWinPercentage({ deckStats })
    }

    return <span>{total}{type === 'percentage' ? '%' : null}</span>;
};

const Decks = () => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        <List resource='deck' filter={{ owner: record.id }} className="desktopPlayerDeckList">
            <Datagrid>
                <TextField source="name" />
                <TextField source="card_data.color_identity" />
                <TotalGamesField type="games" label="Total Games" />
                <TotalGamesField type="wins" label="Games Won" />
                <TotalGamesField type="losses" label="Games Lost" />
                <TotalGamesField type="percentage" label="Win percentage" />
            </Datagrid>
        </List>
    );
};


const formatDate = (inputDate: any) => {
    const date = new Date(inputDate);
    const day = date.getDate();
    const month = date.getMonth(); // Month indexes are zero-based
    const year = date.getFullYear();

    // Array of month names
    const monthNames = [
        "Jan", "Feb", "Mar", "Apr", "Mai", "Jun",
        "Jul", "Aug", "Sep", "Okt", "Nov", "Des"
    ];

    const formattedDay = day; // No need to pad day with leading zeros
    const formattedMonth = monthNames[month];

    return `${formattedDay}. ${formattedMonth} ${year}`;
};

const Rivals = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const [gameCounts, setGameCounts] = useState<GameCount[]>([]);
    const record = useRecordContext();

    const { data: matches, isLoading: matchesLoading, error: matchesError } = useGetList(
        'match',
        {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'DESC' },
        },
    );
    const { data: players, isLoading: playersLoading, error: playersError } = useGetList(
        'player',
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'id', order: 'DESC' },
        },
    );
    const { data: decks, isLoading: decksLoading, error: decksError } = useGetList(
        'deck',
        {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'DESC' },
        },
    );

    useEffect(() => {
        if (!matchesLoading && !playersLoading && !decksLoading && matches && players && decks && record) {
            const counts = countGamesAgainstPlayers(matches, record.id, players, decks);
            setGameCounts(counts);
        }
    }, [matchesLoading, playersLoading, decksLoading, matches, players, decks, record]);

    if (matchesLoading || playersLoading || decksLoading) return <div>Loading...</div>;
    if (matchesError) return <div>Error loading matches: {matchesError.message}</div>;
    if (playersError) return <div>Error loading players: {playersError.message}</div>;
    if (decksError) return <div>Error loading decks: {decksError.message}</div>;

    const OpponentImage = (playerId: any) => {
        const { data: opponent } = useGetOne('player', { id: playerId.playerId })

        return <img src={opponent?.image} style={{ width: "25px", height: "25px", aspectRatio: 1, objectFit: "cover", borderRadius: "3px" }} />
    }

    return (
        gameCounts.map(item => (
            <Box key={item.opponentId} mb={2} className="rivalBox">
                <Link to={`/player/${item.opponentId}/show`}>
                    <Box display={'flex'} alignItems={'center'}>
                        <OpponentImage playerId={item.opponentId} />
                        <Typography ml={1} color={'white'}>
                            {item.opponentName}
                        </Typography>
                    </Box>
                    <Box display={'flex'} mt={1} mx={1}>
                        <Box flex={1}>
                            <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                                <Typography fontSize={18} color={'#fda907'}>
                                    {item.gamesPlayed}
                                </Typography>
                                <Typography variant="body2" color={'#5d6177'}>
                                    Games
                                </Typography>
                            </Box>
                        </Box>
                        <Box flex={1}>
                            <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                                <Typography fontSize={18} color={'#fda907'}>
                                    {item.wins}
                                </Typography>
                                <Typography variant="body2" color={'#5d6177'}>
                                    Wins
                                </Typography>
                            </Box>
                        </Box>
                        <Box flex={1}>
                            <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                                <Typography fontSize={18} color={'#fda907'}>
                                    {item.losses}
                                </Typography>
                                <Typography variant="body2" color={'#5d6177'}>
                                    Losses
                                </Typography>
                            </Box>
                        </Box>
                        <Box flex={1}>
                            <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                                <Typography fontSize={18} color={'#fda907'}>
                                    {item.winRate.toFixed(0)}%
                                </Typography>
                                <Typography variant="body2" color={'#5d6177'}>
                                    Win rate
                                </Typography>
                            </Box>
                        </Box>
                    </Box>
                </Link>
            </Box>
        ))
    );
};

const PlayerDeckCount = () => {
    const record = useRecordContext();
    if (!record) return '404';

    return <Count resource="deck" fontSize={16} filter={{ owner: record.id }} />
}

const PlayerDecks = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const record = useRecordContext();
    if (!record) return '404';
    const { data: decks } = useGetList(
        'deck',
        {
            sort: { field: 'id', order: 'DESC' },
            filter: { owner: record.id }
        }
    )

    const sortedDecks = decks?.sort((a, b) => {
        const aRetired = checkRetired(a) ? 1 : 0;
        const bRetired = checkRetired(b) ? 1 : 0;
        if (aRetired !== bRetired) {
            return aRetired - bRetired;
        } else {
            return a.name.localeCompare(b.name);
        }
    });

    return (
        sortedDecks?.map((record) => (
            <Grid item xs={12} md={6} lg={2} key={record.id} mt={1}>
                <Link to={`/deck/${record.id}/show`} style={{ textDecoration: 'none', color: 'inherit' }} >
                    <RecordContextProvider key={record.id} value={record}>
                        <Box className="newDeckBox" display={'flex'} p={1.4}>
                            <img src={record.card_data.image_uris.small} style={{ width: "50px", height: "auto", borderRadius: "3px" }} />
                            <Box ml={1.5} mt={0.5} width={'100%'}>
                                <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} width={'100%'}>
                                    <Typography color={checkRetired(record) ? '#999999' : 'white'}>
                                        {record.name}
                                    </Typography>
                                    {checkRetired(record) ? (
                                        <span className="retiredMark">Retired</span>
                                    ) : null}
                                </Box>
                                <Typography fontSize={12} fontWeight={300} sx={{ opacity: "50%" }}>
                                    {record.card_data.name}
                                </Typography>
                            </Box>
                        </Box>
                    </RecordContextProvider>
                </Link>

            </Grid >
        ))
    )
}

export const PlayerShow = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

    return (
        <Show className="form">
            <Form>
                {isSmall ? (
                    <Grid container className="playerProfile" mt={2} pb={4}>
                        <Grid item xs={12} display={'flex'}>
                            <Box display={'flex'} alignItems={'center'}>
                                <Box>
                                    <ImageField source="image" className="playerProfileImage" />
                                </Box>
                                <Box>
                                    <Typography ml={1.3} mb={1}>
                                        <TextField source="name" fontSize={16} />
                                        <Typography fontSize={'0.75rem'} sx={{ opacity: '50%' }}>
                                            Last played: 21. jun 2024
                                        </Typography>
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>

                        <Grid item xs={12}>
                            <Grid container columnSpacing={1.5}>
                                <Grid item xs={6} mt={3}>
                                    <Box className="playerSectionBox decks">
                                        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                            <div className="playerSectionBoxIcon" style={{ backgroundColor: "#fda907" }}>
                                                <img src="images\cards-blank-solid.svg" />
                                            </div>
                                            <PlayerDeckCount />
                                        </Box>
                                        <Box mt={2}>
                                            <Typography fontSize={'0.85rem'}>
                                                Decks
                                            </Typography>
                                        </Box>
                                    </Box>
                                </Grid>
                                <Grid item xs={6} mt={3}>
                                    <Box className="playerSectionBox matches">
                                        <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                            <div className="playerSectionBoxIcon" style={{ backgroundColor: "#5b58f6" }}>
                                                <img src="images\swords-solid.svg" />
                                            </div>
                                            <TotalGamesField type="games" aggregate={true} />
                                        </Box>
                                        <Box mt={2}>
                                            <Typography fontSize={'0.85rem'}>
                                                Matches
                                            </Typography>
                                        </Box>
                                    </Box>

                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid item xs={12} mt={5}>
                            <Box display={'flex'} alignItems={'center'}>
                                <img src="images\cards-blank-solid (2).svg" style={{ height: "23px" }} />
                                <Typography fontSize={17} color={'white'} ml={1}>
                                    Decks
                                </Typography>
                            </Box>
                            <Box mt={2}>
                                <PlayerDecks />
                            </Box>
                        </Grid>

                        <Grid item xs={12} mt={5}>
                            <Box display={'flex'} alignItems={'center'}>
                                <img src="images\fire-solid.svg" style={{ height: "25px" }} />
                                <Typography fontSize={17} color={'white'} ml={1}>
                                    Rivals
                                </Typography>
                            </Box>
                            <Box mt={2}>
                                <Rivals />
                            </Box>
                        </Grid>
                    </Grid>

                ) : (
                    <Box mx={4} className="playerProfile">
                        <Grid container mt={2} pb={4}>
                            <Grid xs={9}>
                                <Grid container>
                                    <Grid item xs={12} display={'flex'}>
                                        <Box display={'flex'} alignItems={'center'}>
                                            <Box>
                                                <ImageField source="image" className="playerProfileImage" />
                                            </Box>
                                            <Box>
                                                <Typography ml={1.3} mb={1}>
                                                    <TextField source="name" fontSize={16} />
                                                    <Typography fontSize={'0.75rem'} sx={{ opacity: '50%' }}>
                                                        Last played: 21. jun 2024
                                                    </Typography>
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Grid>

                                    <Grid item xs={12} >
                                        <Grid container columnSpacing={1.5}>
                                            <Grid item mt={3} flex={1}>
                                                <Box className="playerSectionBox decks" >
                                                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                                        <div className="playerSectionBoxIcon" style={{ backgroundColor: "#fda907" }}>
                                                            <img src="images\cards-blank-solid.svg" />
                                                        </div>
                                                        <PlayerDeckCount />
                                                    </Box>
                                                    <Box mt={2}>
                                                        <Typography fontSize={'0.85rem'}>
                                                            Decks
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item mt={3} flex={1}>
                                                <Box className="playerSectionBox matches" >
                                                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                                        <div className="playerSectionBoxIcon" style={{ backgroundColor: "#5b58f6" }}>
                                                            <img src="images\swords-solid.svg" />
                                                        </div>
                                                        <TotalGamesField type="games" aggregate={true} />
                                                    </Box>
                                                    <Box mt={2}>
                                                        <Typography fontSize={'0.85rem'}>
                                                            Matches
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item mt={3} flex={1}>
                                                <Box className="playerSectionBox matches" >
                                                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                                        <div className="playerSectionBoxIcon" style={{ backgroundColor: "#5b58f6" }}>
                                                            <img src="images\swords-solid.svg" />
                                                        </div>
                                                        <TotalGamesField type="wins" aggregate={true} />
                                                    </Box>
                                                    <Box mt={2}>
                                                        <Typography fontSize={'0.85rem'}>
                                                            Wins
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item mt={3} flex={1}>
                                                <Box className="playerSectionBox matches" >
                                                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                                        <div className="playerSectionBoxIcon" style={{ backgroundColor: "#5b58f6" }}>
                                                            <img src="images\swords-solid.svg" />
                                                        </div>
                                                        <TotalGamesField type="losses" aggregate={true} />
                                                    </Box>
                                                    <Box mt={2}>
                                                        <Typography fontSize={'0.85rem'}>
                                                            Losses
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                            <Grid item mt={3} flex={1}>
                                                <Box className="playerSectionBox matches" >
                                                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                                                        <div className="playerSectionBoxIcon" style={{ backgroundColor: "#5b58f6" }}>
                                                            <img src="images\swords-solid.svg" />
                                                        </div>
                                                        <TotalGamesField type="percentage" aggregate={true} />
                                                    </Box>
                                                    <Box mt={2}>
                                                        <Typography fontSize={'0.85rem'}>
                                                            Winrate
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Grid>
                                    <Grid item xs={12} mt={5}>
                                        <Box display={'flex'} alignItems={'center'}>
                                            <img src="images\cards-blank-solid (2).svg" style={{ height: "23px" }} />
                                            <Typography fontSize={17} color={'white'} ml={1}>
                                                Decks
                                            </Typography>
                                        </Box>
                                        <Box mt={2}>
                                            <Decks />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                            <Grid xs={3}>
                                <Grid container mx={4} pr={4}>
                                    <Grid item xs={12} mt={9.6}>
                                        <Box display={'flex'} alignItems={'center'}>
                                            <img src="images\fire-solid.svg" style={{ height: "25px" }} />
                                            <Typography fontSize={17} color={'white'} ml={1}>
                                                Rivals
                                            </Typography>
                                        </Box>
                                        <Box mt={2}>
                                            <Rivals />
                                        </Box>
                                    </Grid>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Box>
                )}
            </Form >
        </Show >
    )
};
