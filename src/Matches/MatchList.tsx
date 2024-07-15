import { useMediaQuery, Theme, Grid, Card, Box, Typography } from '@mui/material';
import React, { useState, useEffect } from 'react';
import { List, TextInput, SelectInput, TextField, DateField, ReferenceManyField, SingleFieldList, ChipField, ReferenceField, BooleanField, Datagrid, useGetList, Link, useGetOne, CreateButton } from 'react-admin';
import { useRecordContext } from 'react-admin';

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

const MatchHistory = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));
    const { data } = useGetList(
        'match',
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'id', order: 'DESC' },
        },
    );

    const winners = [];
    const losers = [];

    data?.map((item) => {
        item.players.map((player) => {
            if (player.result == 'winner') {
                winners.push(player)
            } else {
                losers.push(player)
            }
        })
    })

    const DeckImage = (deckId: any) => {
        const { data: deckImage } = useGetOne(
            'deck',
            { id: deckId.deckId }
        )

        const image = deckImage?.card_data?.image_uris?.art_crop;
        return (
            <div className="image-container">
                <img className="cropped-image" src={image} />
            </div>
        )
    }

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
            case 'star':
                return 'Star format'
            default:
                return null
        }
    }

    console.log("Data: ", data)

    return (
        <>
            {data?.map((match, index) => {
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
                        <Box className={`matchesBox`}>
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
                );
            })}
        </>
    )
}

export const MatchList = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

    return (
        isSmall ? (
            <>
                <Grid item xs={12} mt={4} pb={3}>
                    <Card className="playersCard">
                        <Grid container>
                            <Grid item xs={12} lg={6}>
                                <h1>Matches</h1>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras rhoncus tempus nunc faucibus auctor. </p>
                            </Grid >
                        </Grid >
                    </Card >
                </Grid>

                <Box px={1}>
                    <CreateButton label="Create Match" />
                    <MatchHistory />
                </Box>
            </>
        ) : (
            <List filters={matchFilters}>
                <Datagrid rowClick="show">
                    <TextField source="id" />
                    <TextField source="type" />
                    <DateField source="date_played" label="Date" />
                    <DecksWinner label="Winner" />
                    <DecksLoser label="Loser" />
                    <TextField source="notes" />
                </Datagrid >
            </List >
        )
    )
}