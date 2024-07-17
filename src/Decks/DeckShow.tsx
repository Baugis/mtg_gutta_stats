import { Show, TabbedShowLayout, useRecordContext, TextField, Form, ReferenceField, useGetList, List, Datagrid, useGetOne, DateField, ImageField, Link, UrlField, Count, EditButton, useGetIdentity } from 'react-admin';
import Grid from '@mui/material/Unstable_Grid2';
import Card from '@mui/material/Card';
import DeckColors from '../Decks/DeckColors';
import { Fragment, useEffect, useState, useMemo } from 'react';
import ManaSymbols from '../Helpers/ManaSymbols';
import { Typography, useMediaQuery, Theme, Box } from '@mui/material';
import { countGamesAgainstDecks } from '../Helpers/utils';
import { checkRetired } from '../Helpers/checkRetired';

interface DeckInfoProps {
    type: 'name' | 'deck';
    label?: string;
}

const DeckInfo = ({ type }: DeckInfoProps) => {
    const record = useRecordContext();
    if (!record) return null;

    return (
        type === 'name' ? (
            <h2 className='mb-0'>{record.name} <ManaSymbols colorIdentity={record.colorIdentity} /></h2>
        ) : null
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

const MatchHistory = () => {
    const record = useRecordContext();
    if (!record) return false;
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const { data: matches } = useGetList(
        'match',
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'id', order: 'DESC' },
        },
    );

    const DeckImage = (deckId: any) => {
        const { data: deckImage } = useGetOne(
            'deck',
            { id: deckId.deckId }
        );

        const image = deckImage?.card_data?.image_uris?.art_crop;
        return (
            <div className="image-container">
                <img className="cropped-image" src={image} />
            </div>
        );
    };

    const MatchField = (type: any) => {
        switch (type.type) {
            case '1v1':
                return '1v1';
            case '3 man ffa':
                return 'Free For All (3 players)';
            case '4 man ffa':
                return 'Free For All (4 players)';
            case 'Two head giant':
                return 'Two Headed Giant';
            case 'Star':
                return 'Star format';
            default:
                return type.type;
        }
    };

    return (
        <>
            {matches?.map((match, index) => (
                match.players.map((player: any, playerIndex: any) => {
                    if (player.deck_id === record.id) {
                        const teams = match.players.reduce((acc: any, player: any) => {
                            if (!acc[player.team]) {
                                acc[player.team] = [];
                            }
                            acc[player.team].push(player);
                            return acc;
                        }, {});

                        const teamOrder = Object.keys(teams).sort((a, b) => a - b);

                        return (
                            <Box key={match.id}>
                                <Box className={`matchHistory ${player.result == 'winner' ? 'winner' : 'loser'}`}>
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
                                            <Fragment key={team}>
                                                {teamIndex > 0 && <Box mx={2}>vs</Box>}
                                                {teams[team].map((item: any, itemIndex: number) => (
                                                    <Box
                                                        className={`matchHistoryDeckImage ${item.result == 'winner' ? (item.deck_id === record.id ? 'winnerBorder' : 'winner') : (item.deck_id === record.id ? 'loserBorder' : 'loser')}`}
                                                        key={item.deck_id}
                                                        sx={{ mr: itemIndex < teams[team].length - 1 ? 1 : 0 }} // Apply margin-right to all but the last deck in the team
                                                    >
                                                        <Link to={`/deck/${item.deck_id}/show`}>
                                                            <DeckImage deckId={item.deck_id} />
                                                        </Link>
                                                    </Box>
                                                ))}
                                            </Fragment>
                                        ))}
                                    </Box>
                                </Box>
                            </Box>
                        );
                    }
                    return null; // Ensure a return value is always provided
                })
            ))}
        </>
    );
}

const DeckBoxLink = () => {
    const record = useRecordContext();
    if (!record) return '404';

    return (
        record.deckbox_link != null ? (
            <Typography mt={3}>
                <UrlField source="deckbox_link" className='deckBoxLink' target='_blank' color='#ffffff' />
            </Typography>
        ) : null
    );
}

const Rivals = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const [gameCounts, setGameCounts] = useState([]);
    const record = useRecordContext();

    const { data: matches, isLoading: matchesLoading, error: matchesError } = useGetList(
        'match',
        {
            pagination: { page: 1, perPage: 1000 },
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
        if (!matchesLoading && !decksLoading && matches && decks && record) {
            const counts = countGamesAgainstDecks(matches, record.id, decks);
            setGameCounts(counts);
        }
    }, [matchesLoading, decksLoading, matches, decks, record]);

    if (matchesLoading || decksLoading) return <div>Loading...</div>;
    if (matchesError) return <div>Error loading matches: {matchesError.message}</div>;
    if (decksError) return <div>Error loading decks: {decksError.message}</div>;

    const OpponentImage = ({ deckId }) => {
        const { data: deck } = useGetOne('deck', { id: deckId });
        const { data: owner } = useGetOne('player', { id: deck?.owner });

        return owner ? (
            <img src={deck.card_data.image_uris.art_crop} style={{ width: "25px", height: "25px", aspectRatio: 1, objectFit: "cover", borderRadius: "3px" }} alt={owner.name} />
        ) : null;
    }

    return (
        isSmall ? (
            gameCounts.map(item => (
                <Box key={item.opponentId} mb={2} className="rivalBox">
                    <Link to={`/deck/${item.opponentId}/show`}>
                        <Box display={'flex'} alignItems={'center'}>
                            <OpponentImage deckId={item.opponentId} />
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
                            {/* <Box flex={1}>
                                <Box display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                                    <Typography fontSize={18} color={'#fda907'}>
                                        {item.winRate.toFixed(0)}%
                                    </Typography>
                                    <Typography variant="body2" color={'#5d6177'}>
                                        Win rate
                                    </Typography>
                                </Box>
                            </Box> */}
                        </Box>
                    </Link>
                </Box>
            ))
        ) : (
            <div>
                <Typography variant='h5' fontWeight={400} mb={2}>
                    Rivals
                </Typography >
                {gameCounts.map(count => (
                    <Box key={count.opponentId} mb={2}>
                        <Typography fontSize="1.1rem">
                            {count.opponentName}
                        </Typography>
                        <Grid container>
                            <Grid xs={6}>
                                <Typography fontSize="0.9rem" >
                                    Games: <span style={{ fontWeight: 400 }}>{count.gamesPlayed}</span>
                                </Typography>
                            </Grid>
                            <Grid xs={6}>
                                <Typography fontSize="0.9rem">
                                    Wins: <span style={{ fontWeight: 400 }}>{count.wins}</span>
                                </Typography>
                            </Grid>
                            <Grid xs={6}>
                                <Typography fontSize="0.9rem">
                                    Win rate: <span style={{ fontWeight: 400 }}>{count.winRate.toFixed(0)}%</span>
                                </Typography>
                            </Grid>
                            <Grid xs={6}>
                                <Typography fontSize="0.9rem">
                                    Losses: <span style={{ fontWeight: 400 }}>{count.losses}</span>
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                ))}
            </div >
        )
    );
};

const IdentityChecker = () => {
    const { data: identity, isLoading, error } = useGetIdentity();
    const record = useRecordContext();

    useEffect(() => {
        if (!isLoading && identity && record) {
            console.log('Identity:', identity);
            console.log('Record:', record);

            if (identity.id === record.owner) {
                console.log('Identity ID matches Deck ID');
                const toolbar = document.getElementsByClassName('MuiToolbar-root');
                if (toolbar.length > 0) {
                    toolbar[1].style.display = 'flex';
                    console.log("Element: ", toolbar[1]);
                }
            } else {
                console.log('Identity ID does not match Deck ID');
            }
        }
    }, [identity, isLoading, record]);

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    return (
        null
    )
}

const RetiredText = () => {
    const record = useRecordContext();
    if (!record) return false;

    if (record.retired) {
        return (
            <Typography className='retiredMark' sx={{ backgroundColor: '#13182e' }} textAlign={'center'} py={2} mb={2} fontSize={16}>
                This deck is retired
            </Typography>
        )
    }

    return null;
}

export const DeckShow = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

    return (
        <Show className="form">
            <Form>
                <IdentityChecker />
                {isSmall ? (
                    <Box className="deckShowBox" pb={4} mt={3}>
                        <Box px={1} pt={2}>
                            <RetiredText />
                            <Typography mb={1} variant='h5'>
                                <TextField source="name" variant='h5' /> - (<TextField source="owner_name" variant='h5' fontWeight={300} />)
                            </Typography>
                            <ImageField source='card_data.image_uris.art_crop' className="deckShowMobile" />
                        </Box>
                        <Box px={1} mt={0.3}>
                            <Typography>
                                <TextField source="card_data.name" variant='h6' fontWeight={400} />
                            </Typography>
                            <Typography>
                                <TextField source="card_data.type_line" fontSize={16} fontWeight={400} sx={{ opacity: "80%" }} />
                            </Typography>
                            <Typography variant='body1'>
                                <TextField source="card_data.oracle_text" fontWeight={300} sx={{ opacity: "60%" }} />
                            </Typography>
                            <Typography variant='body1' fontStyle="italic">
                                <TextField source="card_data.flavor_text" sx={{ opacity: "60%" }} />
                            </Typography>
                            <Typography variant='h6' mb={2} >
                                <TextField source="card_data.power" variant='h6' />/<TextField source="card_data.toughness" variant='h6' />
                            </Typography>
                            <span className="newDeckType">
                                <TextField source="arctype" />
                            </span>
                            <DeckBoxLink />
                        </Box>
                        <Box mt={5} px={1}>
                            <Box display={'flex'} alignItems={'center'} mb={2}>
                                <img src="images\swords-solid.svg" style={{ height: "23px" }} />
                                <Typography fontSize={17} color={'white'} ml={1}>
                                    Match history
                                </Typography>
                            </Box>
                            <MatchHistory />
                        </Box>
                        <Box mt={5} px={1}>
                            <Box display={'flex'} alignItems={'center'} mb={2}>
                                <img src="images\cards-blank-solid.svg" style={{ height: "23px" }} />
                                <Typography fontSize={17} color={'white'} ml={1}>
                                    Rival decks
                                </Typography>
                            </Box>
                            <Rivals />
                        </Box>
                    </Box>
                ) : (
                    <Grid container p={3} columnSpacing={3} rowSpacing={3}>
                        <Grid xs={12}>
                            <DeckInfo type="name" />
                        </Grid>
                        <Grid xs={12} lg={8}>
                            <Grid container rowGap={3}>
                                <Grid xs={12} width="100%">
                                    <Card className="p-4">
                                        <Grid display="flex" flexWrap="nowrap" container width="70%" alignItems="center">
                                            <div>
                                                <ImageField source="card_data.image_uris.small" className="deckCommanderImage" />
                                            </div>
                                            <div className="mb-5 mx-5">
                                                <Typography>
                                                    <TextField source="commander" variant='h5' />
                                                </Typography>
                                                <Typography>
                                                    <TextField source="card_data.type_line" variant='h6' />
                                                </Typography>
                                                <Typography variant='body1'>
                                                    <TextField source="card_data.oracle_text" />
                                                </Typography>
                                                <Typography variant='body1' fontStyle="italic">
                                                    <TextField source="card_data.flavor_text" />
                                                </Typography>
                                                <Typography variant='h6'>
                                                    <TextField source="card_data.power" variant='h6' />/<TextField source="card_data.toughness" variant='h6' />
                                                </Typography>
                                                <Typography mt={3}>
                                                    <UrlField source="deckbox_link" target='_blank' />
                                                </Typography>
                                            </div>
                                        </Grid>
                                    </Card>
                                </Grid>

                                <Grid xs={12} width="100%">
                                    <Card className="p-4">
                                        <h2>Deck stats</h2>
                                        <TabbedShowLayout>
                                            <TabbedShowLayout.Tab label="Overall" sx={{ flex: 1 }}>
                                                <p>Her kommer overall stats</p>
                                            </TabbedShowLayout.Tab>
                                            <TabbedShowLayout.Tab label="1v1" sx={{ flex: 1 }}>
                                                <p>Her kommer 1v1 stats</p>
                                            </TabbedShowLayout.Tab>
                                            <TabbedShowLayout.Tab label="3 man ffa" sx={{ flex: 1 }}>
                                                <p>Her kommer 3 man ffa stats</p>
                                            </TabbedShowLayout.Tab>
                                            <TabbedShowLayout.Tab label="4 man ffa" sx={{ flex: 1 }}>
                                                <p>Her kommer 4 man ffa stats</p>
                                            </TabbedShowLayout.Tab>
                                            <TabbedShowLayout.Tab label="Two headed giant" sx={{ flex: 1 }}>
                                                <p>Her kommer two headed giant stats</p>
                                            </TabbedShowLayout.Tab>
                                            <TabbedShowLayout.Tab label="Star format" sx={{ flex: 1 }}>
                                                <p>Her kommer stjerne stats</p>
                                            </TabbedShowLayout.Tab>
                                        </TabbedShowLayout>
                                    </Card>
                                </Grid>
                            </Grid>
                        </Grid>

                        <Grid xs={4}>
                            <Card className="p-4">
                                <h2 className=''>Match history</h2>
                                <MatchHistory />
                            </Card>

                        </Grid>

                    </Grid>
                )
                }

            </Form >

        </Show >
    );
};
