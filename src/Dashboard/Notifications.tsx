import { Box, Grid, Typography, Button } from '@mui/material';
import { Link, useGetIdentity, useGetList, useGetOne, useRefresh } from 'react-admin';
import { formatDate } from '../Helpers/formatDate';
import axios from 'axios';

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

    const DeckImage = (id: any) => {
        const { data: deck } = useGetOne('deck', { id: id.id })

        console.log("Id: ", id)
        console.log("Deck: ", deck)

        return (
            <a href={`/#/deck/${id.id}/show`}><img src={deck?.card_data?.image_uris?.art_crop} /></a>
        )
    }

    if (playerMatches.length > 0) {
        return (
            <Box mb={2.5} py={2}>
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
                        <Box mt={2} borderRadius={'14px'} bgcolor={'#1F2430'}>
                            <div className="gallery">
                                <div>
                                    <nav>
                                        {match?.players?.map((player: any) => (
                                            <DeckImage id={player.deck_id} className={`${player.result == 'winner' ? 'winner-border' : 'looser-border'}`} />
                                        ))}
                                    </nav>
                                </div>
                            </div>
                            <Box p={2}>
                                <Typography color={'white'} fontSize={12} sx={{ marginBottom: '-5px' }}>
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
                                                    {/* <DeckImage deckId={player.deck_id} /> */}
                                                </Box>
                                            )
                                        } else {
                                            return (
                                                <Box color={'white'} className={`matchHistoryDeckImage ${player.result == 'winner' ? 'winnerBorder' : 'loserBorder'}`}>
                                                    {/* <DeckImage deckId={player.deck_id} /> */}
                                                </Box>
                                            )
                                        }
                                    })}
                                </Box>
                                <Box display={'flex'} columnGap={2} mt={1}>
                                    <Box flex={6}>
                                        <Button fullWidth className="matchResponseButton" style={{ backgroundColor: '#50C878', color: 'white', textTransform: 'none', marginRight: '5px', padding: "10px 0" }} onClick={() => acceptMatch(match.id, match, refresh)}>Accept</Button>
                                    </Box>
                                    <Box flex={6}>
                                        <Button fullWidth className="matchResponseButton" style={{ backgroundColor: '#FF5733', color: 'white', textTransform: 'none', padding: "10px 0" }} onClick={() => denyMatch(match.id, refresh)}>Deny</Button>
                                    </Box>
                                </Box>
                            </Box>
                        </Box>
                    )
                })}
            </Box>
        )
    }

    return (
        <Box px={5} textAlign={'center'} mt={20}>
            <img src="images\icons\JOYSTICK.svg" />
            <Typography color={'white'} fontSize={21}>
                You don't have any notifications
            </Typography>
        </Box>
    );
}

export const Notifications = () => {
    const { data: identity, isLoading, error } = useGetIdentity();

    return (
        <Grid container mt={4} px={1.5}>
            <Grid item xs={12} display={'flex'} justifyContent={'space-between'} alignItems={'center'}>
                <Box sx={{ backgroundColor: '#1F2430', width: '56px', height: '56px', borderRadius: '50%' }} display={'flex'} alignItems={'center'} justifyContent={'center'} position={'relative'}>
                    <Link to="/" display={'flex'} alignItems={'center'}>
                        <img src="images\icons\arrow-left-light (1).svg" style={{ width: '22px', height: '22px', color: 'white', fill: 'white' }} />
                    </Link>
                </Box>
                <Typography fontSize={16} color={'white'} textAlign={'center'}>
                    Notifications
                </Typography>
                <Box width={'56px'}>
                </Box>
            </Grid>

            <Grid item xs={12} mt={5}>
                <ConfirmMatches identity={identity} />
            </Grid>
        </Grid>
    )
}