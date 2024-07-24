import { useMemo, useState } from 'react';
import { Count, Link, useGetList, useGetMany, useGetIdentity, useGetOne } from "react-admin";
import { Card, Grid, useMediaQuery, Theme, Box, Typography, IconButton, Icon, Dialog, DialogContent, DialogTitle, DialogActions } from "@mui/material";
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import NotificationsIcon from '@mui/icons-material/Notifications';
import { calculateTotalGames, calculateTotalLosses, calculateTotalWins, calculateTotalWinPercentage } from "../Helpers/utils";

const NewDecks = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const { data: decks } = useGetList(
        'deck',
        {
            pagination: { page: 1, perPage: isSmall ? 3 : 6 },
            sort: { field: 'id', order: 'DESC' },
        }
    );

    return (
        decks?.map((deck) => (
            <Grid item xs={12} md={6} lg={2} mt={3} key={deck.id}>
                <Link to={`/deck/${deck.id}/show`} style={{ textDecoration: 'none', color: 'inherit' }} sx={{ display: "flex", height: "100%" }} >
                    <Box className="newDeckBox" display={'flex'} flexDirection={'column'}>
                        <img src={deck.card_data.image_uris.art_crop} style={{ width: "100%", borderRadius: "3px" }} />
                        <Typography color={'white'} mt={1.4}>
                            {deck.card_data.name}
                        </Typography>
                        <Typography fontSize={'14px'} color={'white'} sx={{ opacity: "50%" }} mb={1}>
                            {deck.card_data.type_line}
                        </Typography>
                        <span className="newDeckType" style={{ marginTop: "auto" }}>
                            {deck.arctype}
                        </span>
                        <Box display={'flex'} mt={1} alignItems={'center'} justifyContent={'space-between'}>
                            <Typography variant="h6" color={'#d0984e'}>
                                {deck.card_data.prices.usd ? (
                                    <span>{deck.card_data.prices.usd}$</span>
                                ) : (
                                    <span>{deck.card_data.prices.usd_foil}$</span>
                                )}

                            </Typography>
                            <IconButton
                                aria-label="delete"
                                href={deck.card_data.purchase_uris.cardmarket}
                                target="_blank"
                                sx={{ backgroundColor: '#423ff8', borderRadius: "4px", padding: "7px", color: 'white', fontSize: "10px" }}
                                onClick={(event) => event.stopPropagation()}
                            >
                                <LocalGroceryStoreIcon />
                            </IconButton>
                        </Box>
                    </Box>
                </Link>
            </Grid >
        ))
    );
};

const NewMatches = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const { data: matches } = useGetList(
        'match',
        {
            pagination: { page: 1, perPage: isSmall ? 3 : 3 },
            sort: { field: 'id', order: 'DESC' },
        }
    );

    const playerIds = useMemo(() => matches?.flatMap(match => match.players.map(player => player.owner_id)) || [], [matches]);
    const deckIds = useMemo(() => matches?.flatMap(match => match.players.map(player => player.deck_id)) || [], [matches]);

    const { data: players } = useGetMany('player', { ids: playerIds });
    const { data: decks } = useGetMany('deck', { ids: deckIds });

    return (
        matches?.map((match) => (
            match.players.map((player: any) => {
                if (player.result === 'winner') {
                    const playerData = players?.find(p => p.id === player.owner_id);
                    const deckData = decks?.find(d => d.id === player.deck_id);
                    return (
                        <Box className="newMatchBox" width={'100%'} key={player.owner_id}>
                            <Box display={'flex'} alignItems={'center'}>
                                <img src={deckData?.card_data.image_uris.art_crop} style={{ height: "100%", width: "60px" }} />
                            </Box>
                            <Box ml={1} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                                <Typography fontSize={'0.95rem'} display={'flex'} alignItems={'center'}>
                                    <img src={playerData?.image} className="playerImage" />
                                    <span style={{ marginLeft: "5px" }}>{playerData?.name}</span>
                                </Typography>
                                <Typography color={'#c4944d'}>
                                    {player.name}
                                </Typography>
                            </Box>
                        </Box>
                    );
                }
                return null;
            })
        ))
    );
};















// #################### New Design ########################### //
const PlayerDeckCount = (id: any) => {
    return (
        <Count resource="deck" fontSize={14} filter={{ owner: id }} color={'white'} display={'flex'} justifyContent={'center'} mt={0.25} />
    )
}

const TotalGamesField = (id: any) => {
    const { data, isLoading, error } = useGetList(
        'deck_stat',
        {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'id', order: 'ASC' },
            filter: { owner_id: id },
        },
    );

    let totalWins = 0;
    let totalLosses = 0;

    data?.forEach((deck) => {
        totalWins += deck['1v1_wins'] + deck['3_man_ffa_wins'] + deck['4_man_ffa_wins'] + deck['two_head_giant_wins'] + deck['star_wins'];
        totalLosses += deck['1v1_losses'] + deck['3_man_ffa_losses'] + deck['4_man_ffa_losses'] + deck['two_head_giant_losses'] + deck['star_losses'];
    });


    return totalWins + totalLosses;
};

const getTimeOfDayGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) {
        return 'Morning';
    } else if (hour < 18) {
        return 'Good Day';
    } else {
        return 'Good Evening';
    }
};

const RecentEvents = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const { data: matches } = useGetList(
        'match',
        {
            pagination: { page: 1, perPage: isSmall ? 3 : 3 },
            sort: { field: 'id', order: 'DESC' },
        }
    );

    const playerIds = useMemo(() => matches?.flatMap(match => match.players.map(player => player.owner_id)) || [], [matches]);
    const deckIds = useMemo(() => matches?.flatMap(match => match.players.map(player => player.deck_id)) || [], [matches]);

    const { data: players } = useGetMany('player', { ids: playerIds });
    const { data: decks } = useGetMany('deck', { ids: deckIds });

    console.log(matches)

    const DeckImage = (id: any) => {
        const { data: deck } = useGetOne('deck', { id: id.id })

        console.log("Id: ", id)
        console.log("Deck: ", deck)

        return (
            <a href=""><img src={deck?.card_data?.image_uris?.art_crop} /></a>
        )
    }

    return (
        <Box mt={2} pb={6}>
            <Grid container spacing={3}>
                {matches?.map((match) => {

                    return (
                        <Grid item xs={12}>
                            <Box bgcolor={'#1F2430'} sx={{ borderRadius: '14px' }}>
                                <div className="gallery">
                                    <div>
                                        <nav>
                                            {match?.players?.map((player: any) => (
                                                <DeckImage id={player.deck_id} />
                                            ))}
                                        </nav>
                                    </div>
                                </div>
                                <Box pt={1.75} px={1.5} pb={2}>
                                    <Typography fontSize={16} color={'white'}>
                                        New Match - ({match.type})
                                    </Typography>
                                    <Typography fontSize={14} color={'rgba(255, 255, 255, 0.5)'}>
                                        22.04.2001
                                    </Typography>
                                </Box>
                            </Box>
                        </Grid>
                    )
                })}
            </Grid>
        </Box>
    );
}

export const Dashboard = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const { data: identity, isLoading, error } = useGetIdentity();
    const greeting = getTimeOfDayGreeting();

    return (
        isSmall ? (
            <Grid container mt={4} px={1.5}>
                <Box display={'flex'} alignItems={'center'} width={'100%'}>
                    <img src={identity?.avatar} style={{ width: '56px', height: '56px', objectFit: 'cover', borderRadius: '50%' }} />
                    <Box ml={2} mr={'auto'}>
                        <Typography fontSize={12} color={'rgba(255, 255, 255, 0.5)'}>
                            {greeting}
                        </Typography>
                        <Typography fontSize={22} color={'#FFFFFF'} sx={{ marginTop: '-2px' }}>
                            {identity?.fullName}
                        </Typography>
                    </Box>
                    <Box sx={{ backgroundColor: '#1F2430', width: '56px', height: '56px', borderRadius: '50%' }} display={'flex'} alignItems={'center'} justifyContent={'center'} position={'relative'}>
                        <Link to="/notifications" display={'flex'} alignItems={'center'}>
                            <img src="images\bell-light.svg" style={{ width: '24px', height: '24px' }} />
                            <Box sx={{ position: 'absolute', top: '-2px', right: '-2px' }} bgcolor={'#FF4040'} width={'20px'} height={'20px'} borderRadius={'50%'} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                <Typography color={'white'} fontSize={13}>
                                    1
                                </Typography>
                            </Box>
                        </Link>
                    </Box>
                </Box >

                <Grid item xs={12} mt={5}>
                    <Box display={'flex'} columnGap={3}>
                        <Box flex={2} sx={{ border: '1px solid #1F2430', borderRadius: '16px' }} width={'100%'} p={2} justifyContent={'center'}>
                            <Typography fontSize={12} color={'rgba(255, 255, 255, 0.5)'} textAlign={'center'}>
                                Decks
                            </Typography>

                            <PlayerDeckCount id={identity?.id} />

                            <Box width={'100%'} bgcolor={'#1F2430'} height={'1px'} my={2}></Box>
                            <Typography fontSize={12} color={'rgba(255, 255, 255, 0.5)'} textAlign={'center'}>
                                Matches
                            </Typography>
                            <Typography fontSize={12} color={'white'} textAlign={'center'}>
                                <TotalGamesField id={identity?.id} type="games" aggregate={true} label={''} />
                            </Typography>
                        </Box>
                        <Box flex={10} mb={0} height={'139px'}>
                            <img src="https://www.magigutta.no/assets/images/c4fd5799-4e56-4d95-bc3a-fb4b3273283c_1721327069.jpg" style={{ height: '100%', width: '100%', objectFit: 'cover', borderRadius: '16px' }} />
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} mt={5}>
                    <Box display={'flex'} columnGap={3}>
                        <Box flex={1} display={'flex'} justifyContent={'center'}>
                            <Link to="match/create" width={'100%'}>
                                <Box >
                                    <Box sx={{ backgroundColor: '#1F2430', width: '100%', maxWidth: '65px', height: 'auto', aspectRatio: 1, borderRadius: '50%' }} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                        <img src="images\icons\AIM.png" style={{ width: '37px', height: '37px' }} />
                                    </Box>
                                    <Typography fontSize={12} color={'white'} textAlign={'center'} mt={1}>
                                        New match
                                    </Typography>
                                </Box>
                            </Link>
                        </Box>
                        <Box flex={1} display={'flex'} justifyContent={'center'}>
                            <Link to="deck" width={'100%'}>
                                <Box>
                                    <Box sx={{ backgroundColor: '#1F2430', width: '100%', maxWidth: '65px', height: 'auto', aspectRatio: 1, borderRadius: '50%' }} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                        <img src="images\icons\SPELLBOOK.png" style={{ width: '37px', height: '37px', marginRight: '2px' }} />
                                    </Box>
                                    <Typography fontSize={12} color={'white'} textAlign={'center'} mt={1}>
                                        Decks
                                    </Typography>
                                </Box>
                            </Link>
                        </Box>
                        <Box flex={1} display={'flex'} justifyContent={'center'}>
                            <Link to="player" width={'100%'}>
                                <Box >
                                    <Box sx={{ backgroundColor: '#1F2430', width: '100%', maxWidth: '65px', height: 'auto', aspectRatio: 1, borderRadius: '50%' }} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                        <img src="images\icons\GHOST.png" style={{ width: '37px', height: '37px' }} />
                                    </Box>
                                    <Typography fontSize={12} color={'white'} textAlign={'center'} mt={1}>
                                        Players
                                    </Typography>
                                </Box>
                            </Link>
                        </Box>
                        <Box flex={1} display={'flex'} justifyContent={'center'}>
                            <Link to="match" width={'100%'}>
                                <Box >
                                    <Box sx={{ backgroundColor: '#1F2430', width: '100%', maxWidth: '65px', height: 'auto', aspectRatio: 1, borderRadius: '50%' }} display={'flex'} alignItems={'center'} justifyContent={'center'}>
                                        <img src="images\icons\ROCKET.png" style={{ width: '37px', height: '37px' }} />
                                    </Box>
                                    <Typography fontSize={12} color={'white'} textAlign={'center'} mt={1}>
                                        Matches
                                    </Typography>
                                </Box>
                            </Link>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} mt={5}>
                    <Typography fontSize={16} color={'white'}>
                        Recent Events
                    </Typography>

                    <Box>
                        <RecentEvents />
                    </Box>
                </Grid>
            </Grid>
        ) : (
            <Grid px={7} py={8}>
                <Card className="dashboardCard">
                    <Grid container>
                        <Grid item xs={12} lg={6}>
                            <h1>MagiGutta</h1>
                            <p>Set out on a new kind of adventure filled with tiny—but mighty—woodland creatures. The animal folk on Bloomburrow must stand together to defend against the Calamity Beasts—massive elemental predators that threaten the land and its tiny denizens.</p>
                        </Grid >
                        <Grid item xs={0} lg={6} className="dashboardImage">
                            <img src="images\magic-the-gathering-logo-121CFC67AF-seeklogo.com.png" />
                        </Grid>
                    </Grid >
                </Card >

                <Grid display={'flex'} mt={4}>
                    <Grid container display="flex">
                        <Box bgcolor="#9efa56" className="dashboardMiniBox" p={1.3} >
                            <img src="images\users-solid (1).svg" />
                        </Box>
                        <Box ml={1.3} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                            <Typography variant="h5" color={'#9efa55'}>
                                <Count resource="player" variant="h5" />
                            </Typography>
                            <Typography variant="body2" color={'#5d6177'}>
                                Players
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid container display="flex">
                        <Box bgcolor="#fda907" className="dashboardMiniBox" p={1.3} >
                            <img src="images\cards-blank-solid.svg" />
                        </Box>
                        <Box ml={1.3} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                            <Typography variant="h5" color={'#fda907'}>
                                <Count resource="deck" variant="h5" />
                            </Typography>
                            <Typography variant="body2" color={'#5d6177'}>
                                Decks
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid container display="flex">
                        <Box bgcolor="#5b58f6" className="dashboardMiniBox" p={1.6} >
                            <img src="images\swords-solid.svg" />
                        </Box>
                        <Box ml={1.3} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                            <Typography variant="h5" color={'#5b58f6'}>
                                <Count resource="match" variant="h5" />
                            </Typography>
                            <Typography variant="body2" color={'#5d6177'}>
                                Matches
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid container display="flex">
                        <Box bgcolor="#f65861" className="dashboardMiniBox" p={2} >
                            <img src="images\award-solid.svg" />
                        </Box>
                        <Box ml={1.3} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                            <Typography variant="h5" color={'#f65861'}>
                                <Count resource="player" variant="h5" />
                            </Typography>
                            <Typography variant="body2" color={'#5d6177'}>
                                Best winrate
                            </Typography>
                        </Box>
                    </Grid>
                    <Grid container display="flex">
                        <Box bgcolor="#c455fa" className="dashboardMiniBox" p={1.3} >
                            <img src="images\star-solid.svg" />
                        </Box>
                        <Box ml={1.3} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                            <Typography variant="h5" color={'#c455fa'}>
                                <Count resource="player" variant="h5" />
                            </Typography>
                            <Typography variant="body2" color={'#5d6177'}>
                                Most played
                            </Typography>
                        </Box>
                    </Grid>
                </Grid>

                <Grid container mt={4}>
                    <Grid item xs={12}>
                        <Box display={'flex'}>
                            <img src="images\fire-solid.svg" style={{ height: "30px" }} />
                            <Typography variant="h6" color={'white'} ml={1}>
                                New decks
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12}>
                        <Grid container columnSpacing={2}>
                            <NewDecks />
                        </Grid>
                    </Grid>
                </Grid>

                <Grid container mt={4}>
                    <Grid item xs={12}>
                        <Box display={'flex'}>
                            <Box bgcolor="#9df954" className="dashboardMiniBox small" p={0.5} >
                                <img src="images\list-ul-solid.svg" style={{ height: "16px" }} />
                            </Box>
                            <Typography variant="h6" color={'white'} ml={1}>
                                Recent winners
                            </Typography>
                        </Box>
                    </Grid>

                    <Grid item xs={12} mt={2}>
                        <Box display={'flex'} gap={2}>
                            <NewMatches />
                        </Box>
                    </Grid>

                </Grid>
            </Grid >
        )
    );
};
