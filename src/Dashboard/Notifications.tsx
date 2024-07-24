import { Box, Grid, Typography } from '@mui/material';
import { Link, useGetIdentity, useGetList } from 'react-admin';

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

export const Notifications = () => {
    const { data: identity, isLoading, error } = useGetIdentity();

    return (
        <Grid container mt={3} px={1.5}>
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
                    <ConfirmMatches identity={identity} />
                </Box>
            </Grid>
        </Grid>
    )
}