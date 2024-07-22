import { useMediaQuery, Theme, Grid, Card, Box, Typography, MenuItem, Select, InputLabel, FormControl } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { List, TextInput, SelectInput, TextField, DateField, Datagrid, useGetList, Link, useGetOne, CreateButton, useGetIdentity, useRefresh } from 'react-admin';
import { useRecordContext } from 'react-admin';
import TextField2 from '@mui/material/TextField';
import useDebounce from '../Helpers/useDebounce';
import axios from 'axios';

const DecksWinner = (label: any) => {
    const record = useRecordContext();
    if (!record) return false;

    console.log("recroid, ", record)

    const winners: any = [];
    record.players.map((player: any) => {
        console.log("Player: ", player)

        if (player.result == 'winner') {
            winners.push(player)
        }
    })

    return (
        <>
            {winners?.map((winner: any) => (
                <span>{winner.name}</span>
            ))}
        </>
    )
}

const DecksLoser = (label: any) => {
    const record = useRecordContext();
    if (!record) return false;


    const losers: any = [];
    record.players.map((player: any) => {
        console.log("Player: ", player)

        if (player.result == 'loser') {
            losers.push(player)
        }
    })

    return (
        <>
            {losers?.map((loser: any) => (
                <span>{loser.name} </span>
            ))}
        </>
    )
}

const matchFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <SelectInput source="type" alwaysOn choices={[
        { id: '1v1', name: '1v1' },
        { id: '3 man ffa', name: '3 man ffa' },
        { id: '4 man ffa', name: '4 man ffa' },
        { id: 'Two head giant', name: 'Two head giant' },
        { id: 'Stjerne', name: 'Stjerne' },
    ]} />
];

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

const DeckImage = (deckId: any) => {
    // Check if the data is already in localStorage
    const cachedDeckImage = localStorage.getItem(`deckImage_${deckId.deckId}`);
    const [image, setImage] = React.useState(cachedDeckImage ? JSON.parse(cachedDeckImage) : null);

    // Fetch the data if it's not in localStorage
    const { data: deckImage, loading } = useGetOne(
        'deck',
        { id: deckId.deckId },
        {
            enabled: !cachedDeckImage, // Disable fetching if we have cached data
        }
    );

    React.useEffect(() => {
        if (deckImage && !cachedDeckImage) {
            // Cache the data in localStorage
            localStorage.setItem(`deckImage_${deckId.deckId}`, JSON.stringify(deckImage?.card_data?.image_uris?.art_crop));
            setImage(deckImage?.card_data?.image_uris?.art_crop);
        }
    }, [deckImage, cachedDeckImage, deckId.deckId]);

    if (loading) return <div>Loading...</div>;

    return (
        <div className="image-container">
            <img className="cropped-image" src={image} />
        </div>
    );
};

const acceptMatch = async (matchId: number, match: any, refresh: any) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://www.magigutta.no/api',
            data: {
                action: 'matchAccept',
                match: matchId,
                data: {
                    match: match
                }
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });

        refresh()
    } catch (error) {
        console.log(error);
    }
}

const denyMatch = async (matchId: number, refresh: any) => {
    try {
        const response = await axios({
            method: 'post',
            url: 'https://www.magigutta.no/api',
            data: {
                action: 'matchDeny',
                match: matchId
            },
            headers: {
                'Content-Type': 'application/json'
            }
        });
        refresh()
    } catch (error) {
        console.log(error);
    }
}

const ConfirmMatches = (identity: any) => {
    const refresh = useRefresh();
    const { data: matches } = useGetList(
        'match'
    )

    let playerMatches: any[] = [];
    matches?.forEach((match) => {
        match.players.forEach((player: any) => {
            /* console.log("Player: ", player) */
            if (player.owner_id == identity?.identity?.id && match.confirmed == 0 && match.registered_by !== identity?.identity?.id) {
                playerMatches.push(match)
            }
        })
    })

    if (playerMatches.length > 0) {
        return (
            <Box bgcolor={'#13182e'} mb={2.5} py={2} px={2}>
                <Link to="match">
                    <Typography color={'white'} fontSize={17} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                        <span>Confirm {playerMatches.length > 1 ? 'Matches' : 'Match'}</span>
                    </Typography>
                    {playerMatches.map((match) => {
                        let winner = false;
                        match.players.map((player: any) => {
                            if (player?.owner_id == identity?.identity?.id) {
                                if (player.result == 'winner') {
                                    winner = true;
                                }
                            }
                        })

                        return (
                            <Box bgcolor={'rgba(255, 255, 255, 0.05)'} p={2} mt={2}>
                                <Typography color={'white'} fontSize={12}>
                                    {formatDate(match.date_played)}
                                </Typography>

                                <Typography mt={1} color={'white'}>
                                    You {winner ? 'won' : 'lost'} in {match.type} with {match.players.map((player: any) => {
                                        if (player.owner_id == identity?.identity.id) {
                                            return player.name
                                        }
                                    })}
                                </Typography>
                                <Box display={'flex'} gap={1}>
                                    {match.players.map((player: any) => {
                                        if (player?.owner_id != identity?.identity?.id) {
                                            return (
                                                <Box color={'white'} className={`matchHistoryDeckImage ${player.result == 'winner' ? 'winnerBorder' : 'loserBorder'}`}>
                                                    <DeckImage deckId={player.deck_id} />
                                                </Box>
                                            )
                                        } else {
                                            return (
                                                <Box color={'white'} className={`matchHistoryDeckImage ${player.result == 'winner' ? 'winnerBorder' : 'loserBorder'}`}>
                                                    <DeckImage deckId={player.deck_id} />
                                                </Box>
                                            )
                                        }
                                    })}
                                </Box>
                                <Box mt={2}>
                                    <button className="matchResponseButton" style={{ backgroundColor: '#50C878', color: 'white', textTransform: 'none', marginRight: '5px' }} onClick={() => acceptMatch(match.id, match, refresh)}>Accept</button>
                                    <button className="matchResponseButton" style={{ backgroundColor: '#FF5733', color: 'white', textTransform: 'none' }} onClick={() => denyMatch(match.id, refresh)}>Deny</button>
                                </Box>
                            </Box>
                        )
                    })}
                </Link>
            </Box>
        )
    }

    return null;
}

const MatchHistory = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

    // State for filters and search
    const [searchQuery, setSearchQuery] = useState('');
    const [tmpSearchQuery, setTmpSearchQuery] = useState('');
    const [filterType, setFilterType] = useState('');
    const [filterDate, setFilterDate] = useState('');

    const debouncedSearchQuery = useDebounce(tmpSearchQuery, 300);

    const { data } = useGetList(
        'match',
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'id', order: 'DESC' },
            filter: {
                q: searchQuery,
                type: filterType ? filterType : null,
                date_played: filterDate ? filterDate : null,
                confirmed: 1
            }
        },
    );

    const winners = [];
    const losers = [];

    data?.map((item) => {
        item.players.map((player: any) => {
            if (player.result == 'winner') {
                winners.push(player)
            } else {
                losers.push(player)
            }
        })
    })

    const MatchField = (type: any) => {
        switch (type.type) {
            case '1v1':
                return '1v1'
            case '3 man ffa':
                return 'Free For All (3 players)'
            case '4 man ffa':
                return 'Free For All (4 players)'
            case 'Two head giant':
                return 'Two Headed Giant'
            case 'Stjerne':
                return 'Star format'
            case '5 man ffa':
                return 'Free For All (5 players)'
            default:
                return null
        }
    }

    const handleSearchChange = (event: any) => {
        setTmpSearchQuery(event.target.value);
    };

    const handleFilterTypeChange = (event: any) => {
        setFilterType(event.target.value);
    };

    const handleFilterDateChange = (event: any) => {
        setFilterDate(event.target.value);
    };

    useEffect(() => {
        setSearchQuery(debouncedSearchQuery);
    }, [debouncedSearchQuery]);

    return (
        <>
            <Box mb={4} className="matchHistoryBox" display={'flex'} flexDirection={isSmall ? 'column' : 'row'} rowGap={2} columnGap={3}>
                <Box>
                    <TextField2
                        label="Search"
                        variant="outlined"
                        value={tmpSearchQuery}
                        onChange={handleSearchChange}
                        fullWidth={isSmall ? true : false}
                        sx={{ minWidth: !isSmall ? '500px' : null }}
                    />
                </Box>
                <Box>
                    <FormControl fullWidth={isSmall ? true : false} sx={{ minWidth: !isSmall ? '500px' : null }} variant="outlined" margin="none">
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={filterType}
                            onChange={handleFilterTypeChange}
                            label="Type"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="1v1">1v1</MenuItem>
                            <MenuItem value="3 man ffa">Free For All (3 players)</MenuItem>
                            <MenuItem value="4 man ffa">Free For All (4 players)</MenuItem>
                            <MenuItem value="5 man ffa">Free For All (5 players)</MenuItem>
                            <MenuItem value="Two head giant">Two Headed Giant</MenuItem>
                            <MenuItem value="star">Star format</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
                <Box>
                    <FormControl fullWidth={isSmall ? true : false} sx={{ minWidth: !isSmall ? '500px' : null }} variant='outlined' margin="none">
                        <InputLabel>Date</InputLabel>
                        <Select
                            value={filterDate}
                            onChange={handleFilterDateChange}
                            label="Date"
                        >
                            <MenuItem value="">All</MenuItem>
                            <MenuItem value="last_7_days">Last 7 days</MenuItem>
                            <MenuItem value="this_month">This month</MenuItem>
                            <MenuItem value="last_month">Last month</MenuItem>
                            <MenuItem value="this_year">This Year</MenuItem>
                            <MenuItem value="last_year">Last Year</MenuItem>
                        </Select>
                    </FormControl>
                </Box>
            </Box>
            <Grid container spacing={2}>
                {data?.map((match, index) => {
                    const teams = match.players.reduce((acc: any, player: any) => {
                        if (!acc[player.team]) {
                            acc[player.team] = [];
                        }
                        acc[player.team].push(player);
                        return acc;
                    }, {});

                    const teamOrder = Object.keys(teams).sort((a: any, b: any) => a - b);

                    return (
                        <Grid item xs={12} lg={4}>
                            <Box key={match.id} height={'100%'}>
                                <Box className={`matchesBox`} height={'100%'}>
                                    <Box>
                                        <Typography>
                                            <MatchField type={match.type} />
                                        </Typography>
                                        <Typography fontSize={'0.75rem'} sx={{ opacity: "60%" }}>
                                            {formatDate(match.date_played)}
                                        </Typography>
                                    </Box>
                                    <Box className="content" mt={1}>
                                        {teamOrder.map((team, teamIndex) => (
                                            <React.Fragment key={team}>
                                                {teamIndex > 0 && <Box mx={2}>vs</Box>}
                                                {teams[team].map((item: any, itemIndex: number) => (
                                                    <Box
                                                        className={`matchHistoryDeckImage ${item.result == 'winner' ? 'winnerBorder' : 'loserBorder'}`}
                                                        key={item.deck_id}
                                                        sx={{ mr: itemIndex < teams[team].length - 1 ? 1 : 0 }} // Apply margin-right to all but the last deck in the team
                                                    >
                                                        <Link to={`/deck/${item.deck_id}/show`}>
                                                            <DeckImage deckId={item.deck_id} />
                                                        </Link>
                                                    </Box>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                    </Box>
                                    {match.notes != '' ? (
                                        <Box mt={1}>
                                            <Typography fontWeight={300} fontSize={14} sx={{ opacity: "50%" }}>
                                                {match.notes}
                                            </Typography>

                                        </Box>
                                    ) : null}
                                </Box>
                            </Box>
                        </Grid>
                    );
                })}
            </Grid>
        </>
    )
}

export const MatchList = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const { data: identity, isLoading, error } = useGetIdentity();

    return (
        isSmall ? (
            <>
                <Grid item xs={12} mt={4} pb={3}>
                    <Card className="playersCard">
                        <Grid container>
                            <Grid item xs={12} lg={6}>
                                <h1>Matches</h1>
                                <p>Overview off all played matches</p>
                            </Grid >
                        </Grid >
                    </Card >
                </Grid>

                <ConfirmMatches identity={identity} />

                <Box px={1}>
                    <CreateButton label="Create Match" />
                    <MatchHistory />
                </Box>
            </>
        ) : (
            <>
                <Grid item xs={12} mt={7} pb={6} mx={4}>
                    <Card className="playersCard">
                        <Grid container>
                            <Grid item xs={12} lg={6}>
                                <h1>Matches</h1>
                                <p>Overview off all played matches</p>
                            </Grid >
                        </Grid >
                    </Card >
                </Grid>

                <ConfirmMatches identity={identity} />

                <Box px={4}>
                    <CreateButton label="Create Match" />
                    <MatchHistory />
                </Box>
            </>
        )
    )
}