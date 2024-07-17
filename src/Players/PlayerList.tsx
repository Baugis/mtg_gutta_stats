import { FC, useState } from 'react';
import { Avatar, Box, Card, Grid, Typography, useMediaQuery, Theme } from '@mui/material';
import { List, SimpleList, Count, useGetList, useRecordContext, RaRecord, Link } from 'react-admin';

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

const Players = () => {
    const { data: players } = useGetList(
        'player',
        {
            sort: { field: 'name', order: 'ASC' },
        }
    )

    return (
        players?.map((player) => (
            <Grid item xs={12} className="playerBox" mx={4}>
                <Link to={`/player/${player.id}/show`} style={{ textDecoration: 'none', color: 'inherit' }} >
                    <Grid container display={'flex'} justifyContent={'space-between'}>
                        <Box display={'flex'} alignItems={'center'}>
                            <img src={player.image} />
                            <Typography ml={1}>
                                {player.name}
                            </Typography>
                        </Box>
                        <Box display={'flex'} alignItems={'center'} mr={2}>
                            <img src="images\chevron-right-light.svg" style={{ height: "15px", width: "auto" }} />
                        </Box>
                    </Grid>
                </Link>
            </Grid>
        ))
    )
}

export const PlayerList = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

    return (
        isSmall ? (
            <>
                <Grid item xs={12} mt={4} pb={6}>
                    <Card className="playersCard">
                        <Grid container>
                            <Grid item xs={12} lg={6}>
                                <h1>Players</h1>
                                <p>See list of all players</p>
                            </Grid >
                        </Grid >
                    </Card >
                </Grid>

                <Grid container pb={6}>
                    <Players />
                </Grid>
            </>
        ) : (
            <>
                <Grid item xs={12} mt={7} pb={6} mx={4}>
                    <Card className="playersCard">
                        <Grid container>
                            <Grid item xs={12} lg={6}>
                                <h1>Players</h1>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras rhoncus tempus nunc faucibus auctor. </p>
                            </Grid >
                        </Grid >
                    </Card >
                </Grid>

                <Grid container pb={6}>
                    <Players />
                </Grid>
            </>
        )
    );
}