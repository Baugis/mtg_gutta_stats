import { Card, Grid, useMediaQuery, Theme, Box, Typography, IconButton } from "@mui/material";
import { Count, Link, useGetList, useGetMany, useGetIdentity, useGetOne } from "react-admin";
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import { useMemo } from 'react';

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
            pagination: { page: 1, perPage: isSmall ? 5 : 7 },
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

const ConfirmMatches = (identity: any) => {
    /* console.log("Tewster123: ", identity.identity.id) */

    const { data: matches } = useGetList(
        'match'
    )

    let playerMatches: any[] = [];
    matches?.forEach((match) => {
        match.players.forEach((player: any) => {
            /* console.log("Player: ", player) */
            if (player.owner_id == identity.identity.id && match.confirmed == 0) {
                playerMatches.push(match)
            }
        })
    })

    if (playerMatches.length > 0) {
        return (
            <Box bgcolor={'#13182e'} mb={2} py={2} px={2}>
                <Link to="match">
                    <Typography color={'white'} fontSize={17} display={'flex'} alignItems={'center'} justifyContent={'space-between'}>
                        <span>You have an unconfirmed match</span>
                        <img src="public\images\arrow-right-solid.svg" style={{ height: '20px' }} />
                    </Typography>
                </Link>
            </Box>
        )
    }

    return null;
}

export const Dashboard = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const { data: identity, isLoading, error } = useGetIdentity();

    if (isLoading) {
        return <div>Loading...</div>;
    }

    if (error) {
        return <div>Error: {error.message}</div>;
    }

    const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

    return (
        isSmall ? (
            <Grid item xs={12} mt={4} pb={6}>
                <ConfirmMatches identity={identity} />
                <Card className="dashboardCard">
                    <Grid container>
                        <Grid item xs={12} lg={6}>
                            <h1>Hello, {identity?.fullName}</h1>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras rhoncus tempus nunc faucibus auctor. Phasellus non enim sed ante venenatis maximus et vitae mi. Curabitur dui ante, blandit at egestas vitae, lacinia at lectus.</p>
                        </Grid >
                    </Grid >
                </Card >

                <Grid container mt={2} justifyContent={'center'} rowGap={2}>
                    <Grid item xs={6}>
                        <Grid container display="flex">
                            <Box bgcolor="#9efa56" className="dashboardMiniBox" p={2} >
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
                    </Grid>
                    <Grid item xs={6}>
                        <Grid container display="flex">
                            <Box bgcolor="#fda907" className="dashboardMiniBox" p={2} >
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
                    </Grid>
                    <Grid item xs={6}>
                        <Grid container display="flex">
                            <Box bgcolor="#5b58f6" className="dashboardMiniBox" p={2} >
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
                    </Grid>
                    <Grid item xs={6}>
                        <Grid container display="flex">
                            <Box bgcolor="#f65861" className="dashboardMiniBox" p={2} >
                                <img src="images\award-solid.svg" />
                            </Box>
                            <Box ml={1.3} display={'flex'} flexDirection={'column'} justifyContent={'center'}>
                                <Typography variant="h5" color={'#f65861'}>
                                    <Count resource="match" variant="h5" filter={{ data_played_gte: new Date().getMonth() }} />
                                </Typography>
                                <Typography variant="body2" color={'#5d6177'}>
                                    Matches ({month[new Date().getMonth()]})
                                </Typography>
                            </Box>
                        </Grid>
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
                        <Grid container gap={2}>
                            <NewMatches />
                        </Grid>
                    </Grid>

                </Grid>
            </Grid>
        ) : (
            <Grid px={7} py={8}>
                <Card className="dashboardCard">
                    <Grid container>
                        <Grid item xs={12} lg={6}>
                            <h1>MagiGutta</h1>
                            <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras rhoncus tempus nunc faucibus auctor. Phasellus non enim sed ante venenatis maximus et vitae mi. Curabitur dui ante, blandit at egestas vitae, lacinia at lectus. Sed posuere vehicula elit ac blandit. Morbi euismod tempus diam ac suscipit. Praesent placerat velit a faucibus efficitur. Maecenas faucibus leo nec nisl rutrum blandit. Etiam tempus massa magna, vitae malesuada mi ullamcorper id.</p>
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
