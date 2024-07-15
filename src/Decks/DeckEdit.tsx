import React, { useState, useEffect, useRef } from 'react';
import { Edit, SimpleForm, TextInput, required, SelectInput, ReferenceInput, useInput, useGetOne, NumberInput, Toolbar, SaveButton, useGetIdentity, useRecordContext } from 'react-admin';
import axios from 'axios';
import { Autocomplete, TextField, ListItem, ListItemText, Grid, Card, CardMedia, Typography } from '@mui/material';
import DeckColors from './DeckColors';
import { useFormContext, useController } from 'react-hook-form';
import Box from '@mui/material/Box';

interface CardData {
    object: string;
    id: string;
    oracle_id: string;
    multiverse_ids: number[];
    mtgo_id: number;
    tcgplayer_id: number;
    cardmarket_id: number;
    name: string;
    lang: string;
    released_at: string;
    uri: string;
    scryfall_uri: string;
    layout: string;
    highres_image: boolean;
    image_status: string;
    image_uris: {
        small: string;
        normal: string;
        large: string;
        png: string;
        art_crop: string;
        border_crop: string;
    };
    mana_cost: string;
    cmc: number;
    type_line: string;
    oracle_text: string;
    power: string;
    toughness: string;
    colors: string[];
    color_identity: string[];
    keywords: string[];
    all_parts: {
        object: string;
        id: string;
        component: string;
        name: string;
        type_line: string;
        uri: string;
    }[];
    legalities: {
        standard: string;
        future: string;
        historic: string;
        timeless: string;
        gladiator: string;
        pioneer: string;
        explorer: string;
        modern: string;
        legacy: string;
        pauper: string;
        vintage: string;
        penny: string;
        commander: string;
        oathbreaker: string;
        standardbrawl: string;
        brawl: string;
        alchemy: string;
        paupercommander: string;
        duel: string;
        oldschool: string;
        premodern: string;
        predh: string;
    };
    games: string[];
    reserved: boolean;
    foil: boolean;
    nonfoil: boolean;
    finishes: string[];
    oversized: boolean;
    promo: boolean;
    reprint: boolean;
    variation: boolean;
    set_id: string;
    set: string;
    set_name: string;
    set_type: string;
    set_uri: string;
    set_search_uri: string;
    scryfall_set_uri: string;
    rulings_uri: string;
    prints_search_uri: string;
    collector_number: string;
    digital: boolean;
    rarity: string;
    card_back_id: string;
    artist: string;
    artist_ids: string[];
    illustration_id: string;
    border_color: string;
    frame: string;
    frame_effects: string[];
    security_stamp: string;
    full_art: boolean;
    textless: boolean;
    booster: boolean;
    story_spotlight: boolean;
    edhrec_rank: number;
    prices: {
        usd: string | null;
        usd_foil: string | null;
        usd_etched: string | null;
        eur: string | null;
        eur_foil: string | null;
        tix: string | null;
    };
    related_uris: {
        gatherer: string;
        tcgplayer_infinite_articles: string;
        tcgplayer_infinite_decks: string;
        edhrec: string;
    };
    purchase_uris: {
        tcgplayer: string;
        cardmarket: string;
        cardhoarder: string;
    };
}

const validateName = required('Navn er påkrevd');
const validateArctype = required('Arctype er påkrevd');
const validatePlayer = required('Spiller er påkrevd');

const CommanderInput = ({ source, setCardData }: { source: any, setCardData: any }) => {
    const [inputValue, setInputValue] = useState("");
    const [cards, setCards] = useState<CardData[]>([]);
    const { field } = useInput({ source });

    useEffect(() => {
        const delayDebounceFn = setTimeout(() => {
            if (inputValue) {
                const fetchCards = async () => {
                    try {
                        const response = await axios.get(`https://api.scryfall.com/cards/search?q=${inputValue}&unique=prints`);
                        const cardsWithImages = response.data.data.filter((card: CardData) => {
                            if (card.image_uris && card.image_uris.normal) {
                                return true;
                            } else if (card.card_faces) {
                                return card.card_faces.some(face => face.image_uris && face.image_uris.normal);
                            }
                            return false;
                        }).map(card => {
                            if (card.image_uris && card.image_uris.normal) {
                                return card;
                            } else if (card.card_faces) {
                                const faceWithImage = card.card_faces.find(face => face.image_uris && face.image_uris.normal);
                                return {
                                    ...card,
                                    image_uris: faceWithImage.image_uris
                                };
                            }
                            return card;
                        });

                        setCards(cardsWithImages);
                        console.log("Cards: ", cardsWithImages);
                    } catch (error) {
                        console.error(error);
                    }
                }

                fetchCards();
            }
        }, 300);

        return () => clearTimeout(delayDebounceFn);
    }, [inputValue]);

    return (
        <Autocomplete
            options={cards}
            getOptionLabel={(option) => option.name}
            onInputChange={(event, newInputValue) => {
                setInputValue(newInputValue);
            }}
            onChange={(event, newValue) => {
                field.onChange(newValue ? newValue.name : "");
                setCardData(newValue ? newValue : null);
            }}
            renderOption={(props, option) => {
                const { key, ...rest } = props;
                return (
                    <ListItem key={option.id} {...rest} style={{ alignItems: 'flex-start' }}>
                        <CardMedia
                            component="img"
                            image={option.image_uris.normal}
                            alt={option.name}
                            style={{ width: 100, height: 150, marginRight: 10 }}
                        />
                        <ListItemText primary={option.name} secondary={option.set_name} />
                    </ListItem>
                );
            }}
            renderInput={(params) => (
                <TextField
                    {...params}
                    label="Commander"
                    variant="outlined"
                    fullWidth
                />
            )}
            fullWidth
            sx={{ marginBottom: "24px" }}
        />
    );
};

const CustomHiddenInput = ({ source, value }: { source: string, value: any }) => {
    const { control } = useFormContext();
    const { field } = useController({ name: source, control });
    const prevValue = useRef(value);

    useEffect(() => {
        if (prevValue.current !== value) {
            field.onChange(value);
            prevValue.current = value;
        }
    }, [value, field]);

    return (
        <input {...field} hidden />
    );
};

const CustomToolbar = (props) => (
    <Toolbar {...props}>
        <SaveButton />
    </Toolbar>
);

const IdentityChecker = () => {
    const { data: identity, isLoading, error } = useGetIdentity();
    const record = useRecordContext();

    useEffect(() => {
        if (!isLoading && identity && record) {
            console.log('Identity:', identity);
            console.log('Record:', record);
            const form = document.getElementById('createAccess');
            const deniedMessage = document.getElementById('accessDenied');

            if (identity.id === record.owner) {
                console.log('Identity ID matches Deck ID');

                if (form && deniedMessage) {
                    form.style.display = 'block'
                    deniedMessage.style.display = 'none'
                }
            } else {
                console.log('Identity ID does not match Deck ID');
                if (form && deniedMessage) {
                    form.style.display = 'none'
                    deniedMessage.style.display = 'block'
                }
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

export const DeckEdit = () => {
    const [cardData, setCardData] = useState<Partial<CardData> | null>(null);
    const [playerId, setPlayerId] = useState(1);
    const [ownerName, setOwnerName] = useState('');
    const { data: player } = useGetOne('player', { id: playerId });

    const handlePlayerChange = (event: any) => {
        const selectedPlayerId = event.target.value; // Assuming event.target.value contains the player ID
        setPlayerId(selectedPlayerId);
    };

    useEffect(() => {
        setOwnerName(player?.name);
    }, [playerId])

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} mt={4} pb={3}>
                <Card className="playersCard">
                    <Grid container>
                        <Grid item xs={12} lg={6}>
                            <h1>Edit your deck</h1>
                            <p>Edit your deck here</p>
                        </Grid >
                    </Grid >
                </Card >
            </Grid>

            <Grid item xs={12} id="accessDenied">
                <Typography mx={3} textAlign={'center'} color={'white'} fontSize={20}>
                    You dont have permission to edit this deck
                </Typography>
            </Grid>

            <Grid item xs={12} id="createAccess">
                <Edit className="createBox" redirect="show">
                    <IdentityChecker />
                    <SimpleForm toolbar={<CustomToolbar />}>
                        <TextInput source="name" validate={validateName} fullWidth />
                        <TextInput source="commander" fullWidth label="Current commander" readOnly />
                        <CommanderInput source="commander" setCardData={setCardData} />
                        <CustomHiddenInput source="cardData" value={JSON.stringify(cardData)} />
                        <TextInput source="arctype" validate={validateArctype} fullWidth />
                        <ReferenceInput source="owner" reference="player">
                            <SelectInput source="name" validate={validatePlayer} fullWidth onChange={handlePlayerChange} />
                        </ReferenceInput>
                        <TextInput source="deckbox_link" fullWidth />
                        <CustomHiddenInput source="owner_name" value={ownerName} />
                    </SimpleForm>
                </Edit>
            </Grid>
        </Grid>
    )
};