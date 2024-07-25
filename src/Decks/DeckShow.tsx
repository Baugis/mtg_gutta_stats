import { Show, TabbedShowLayout, useRecordContext, TextField, Form, ReferenceField, useGetList, List, Datagrid, useGetOne, DateField, ImageField, Link, UrlField, Count, EditButton, useGetIdentity } from 'react-admin';
import { Card, Grid } from '@mui/material';
import DeckColors from '../Decks/DeckColors';
import { Fragment, useEffect, useState, useMemo } from 'react';
import ManaSymbols from '../Helpers/ManaSymbols';
import { Typography, useMediaQuery, Theme, Box } from '@mui/material';
import { countGamesAgainstDecks } from '../Helpers/utils';
import { checkRetired } from '../Helpers/checkRetired';
import DeckArchtypes from './DeckArchtypes';
import axios from 'axios';

interface DeckInfoProps {
    type: 'name' | 'deck';
    label?: string;
}

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
            filter: { confirmed: 1 }
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
            filter: { confirmed: 1 }
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
                    /* toolbar[1].style.display = 'flex'; */
                    toolbar[1].style.display = 'none';
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

const DeckStats = (type: any) => {
    const [games, setGames] = useState(0);
    const [wins, setWins] = useState(0);
    const [losses, setLosses] = useState(0);
    const [winrate, setWinrate] = useState(0);


    const record = useRecordContext();
    if (!record) return false;

    const fetchStats = async () => {
        try {
            const response = await axios({
                method: 'post',
                url: 'https://www.magigutta.no/api',
                data: {
                    action: 'getDeckStats',
                    deck_id: record.id,
                    type: type ? type.type : null
                },
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            console.log("Response: ", response)

            setGames(response?.data?.totalGames);
            setWins(response?.data?.wins);
            setLosses(response?.data?.losses);
            setWinrate(response?.data?.winRate)
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        fetchStats();
    }, [])

    return (
        <Box display={'flex'} mt={0.5}>
            <Box flex={1}>
                <Typography fontSize={18} color={'#F4D144'}>
                    {games}
                </Typography>
                <Typography variant="body2" color={'#707070'}>
                    Games
                </Typography>
            </Box>
            <Box flex={1}>
                <Typography fontSize={18} color={'#F4D144'}>
                    {wins}
                </Typography>
                <Typography variant="body2" color={'#707070'}>
                    Wins
                </Typography>
            </Box>
            <Box flex={1}>
                <Typography fontSize={18} color={'#F4D144'}>
                    {losses}
                </Typography>
                <Typography variant="body2" color={'#707070'}>
                    Losses
                </Typography>
            </Box>
            <Box flex={1}>
                <Typography fontSize={18} color={'#F4D144'}>
                    {winrate.toFixed(0)}%
                </Typography>
                <Typography variant="body2" color={'#707070'}>
                    Winrate
                </Typography>
            </Box>
        </Box>
    )
}


export const DeckShow = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

    return (
        <Show className="form" actions={undefined}>
            <Form>
                {/* <IdentityChecker /> */}
                {isSmall ? (
                    <Box width={'100%'}>
                        <Box position={'relative'}>
                            <ImageField source="card_data.image_uris.art_crop" className="deckShowImage" />
                            <Box position={'absolute'} display={'flex'} justifyContent={'space-between'} width={'100%'} sx={{ top: '32.5px' }} px={1.5}>
                                <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.28)', width: 'auto', height: '56px', borderRadius: '50%', aspectRatio: 1 }} display={'flex'} alignItems={'center'} justifyContent={'center'} position={'relative'}>
                                    <Link to="/deck" display={'flex'} alignItems={'center'}>
                                        <img src="images\icons\arrow-left-light-white.svg" style={{ width: '22px', height: '22px', color: 'white', fill: 'white' }} />
                                    </Link>
                                </Box>
                                <Box sx={{ backgroundColor: 'rgba(255, 255, 255, 0.28)', width: 'auto', height: '56px', borderRadius: '50%', aspectRatio: 1 }} display={'flex'} alignItems={'center'} justifyContent={'center'} position={'relative'}>
                                    <img src="images\icons\ellipsis-light (1).svg" style={{ width: '76px', height: '27px', color: 'white', fill: 'white' }} />
                                </Box>
                            </Box>
                        </Box>

                        <Box bgcolor={'#050B18'} sx={{ transform: 'translateY(-25px)' }} width={'100%'} borderRadius={'40px 40px 0 0'} px={3.5}>
                            <Box sx={{ transform: 'translateY(-40px)' }}>
                                <Box display={'flex'}>
                                    <ImageField source="card_data.image_uris.normal" className="deckShowCardImage" />
                                    <Box mt={6.5} ml={1.5}>
                                        <Typography>
                                            <TextField source="name" fontSize={20} color={'white'} />
                                        </Typography>
                                        <Typography color={'#607095'}>
                                            {/* <DeckColors label="Deck colors" name={true} /> */}
                                            <TextField source="card_data.type_line" />
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box display={'flex'} columnGap={1} mt={1}>
                                    <DeckArchtypes />
                                </Box>
                                <Box mt={2}>
                                    <Typography>
                                        <TextField source="card_data.oracle_text" color={'rgba(238, 242, 251, 0.7)'} />
                                    </Typography>
                                    <Typography>
                                        <TextField source="card_data.flavor_text" color={'rgba(238, 242, 251, 0.4)'} fontStyle={'italic'} />
                                    </Typography>
                                </Box>
                                <Box mt={2}>
                                    <Typography fontSize={16} color={'white'}>
                                        Deck statistics
                                    </Typography>

                                    <Box mt={1}>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Box bgcolor={'#1F2430'} borderRadius={'10px'} p={1.5}>
                                                    <Typography fontSize={15} color={'white'}>
                                                        Head to Head
                                                    </Typography>
                                                    <DeckStats type='1v1' />
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box bgcolor={'#1F2430'} borderRadius={'10px'} p={1.5}>
                                                    <Typography fontSize={15} color={'white'}>
                                                        Free For All (3 player)
                                                    </Typography>
                                                    <DeckStats type='3_man_ffa' />
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box bgcolor={'#1F2430'} borderRadius={'10px'} p={1.5}>
                                                    <Typography fontSize={15} color={'white'}>
                                                        Free For All (4 player)
                                                    </Typography>
                                                    <DeckStats type='4_man_ffa' />
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box bgcolor={'#1F2430'} borderRadius={'10px'} p={1.5}>
                                                    <Typography fontSize={15} color={'white'}>
                                                        Two Headed Giant
                                                    </Typography>
                                                    <DeckStats type='two_head_giant' />
                                                </Box>
                                            </Grid>
                                            <Grid item xs={12}>
                                                <Box bgcolor={'#1F2430'} borderRadius={'10px'} p={1.5}>
                                                    <Typography fontSize={15} color={'white'}>
                                                        Star format
                                                    </Typography>
                                                    <DeckStats type='star' />
                                                </Box>
                                            </Grid>
                                        </Grid>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    </Box>
                ) : (
                    <Box className="deckShowBox" pb={4} mt={5} mx={4}>
                        <Box display={'flex'} alignItems={'center'}>
                            <Box px={3} pt={2} flex={5}>
                                <RetiredText />
                                <Typography mb={1} variant='h5'>
                                    <TextField source="name" variant='h5' /> - (<TextField source="owner_name" variant='h5' fontWeight={300} />)
                                </Typography>
                                <ImageField source='card_data.image_uris.art_crop' className="deckShowDesktop" />
                            </Box>
                            <Box px={3} mt={2} mr={40}>
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
                        </Box>
                        <Box display={'flex'} pt={3} px={3} columnGap={5}>
                            <Box flex={6}>
                                <Box display={'flex'} alignItems={'center'} mb={2}>
                                    <img src="images\swords-solid.svg" style={{ height: "23px" }} />
                                    <Typography fontSize={17} color={'white'} ml={1}>
                                        Match history
                                    </Typography>
                                </Box>
                                <MatchHistory />
                            </Box>
                            <Box flex={6}>
                                <Box display={'flex'} alignItems={'center'} mb={2}>
                                    <img src="images\cards-blank-solid.svg" style={{ height: "23px" }} />
                                    <Typography fontSize={17} color={'white'} ml={1}>
                                        Rival decks
                                    </Typography>
                                </Box>
                                <Rivals />
                            </Box>
                        </Box>
                    </Box>
                )}
            </Form >
        </Show >
    );
};
