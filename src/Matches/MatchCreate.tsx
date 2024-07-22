import * as React from 'react';
import { Create, SimpleForm, AutocompleteInput, DateInput, required, SelectInput, ReferenceInput, useGetOne, useGetList, TextInput, useCreate, useRedirect, useGetIdentity } from 'react-admin';
import { Card, Grid, Typography, Box, TextField, FormControl, FormLabel, RadioGroup, FormControlLabel, Radio } from '@mui/material';
import { useFormContext, useController } from 'react-hook-form';

const validateType = required('Type er påkrevd');
const validateDate = required('Dato er påkrevd');

const DeckOptionText = ({ record }: { record: any }) => {
    const { data: owner, isLoading, error } = useGetOne('player', { id: record?.owner });

    if (isLoading) return 'Loading...';
    if (error) return 'Error';

    return `${record.commander} (${owner ? owner.name : 'Unknown'})`;
};

const CustomHiddenInput = ({ source }: { source: string }) => {
    const { data: identity, isLoading, error } = useGetIdentity();
    const { control } = useFormContext();
    const { field } = useController({ name: source, control });

    React.useEffect(() => {
        if (!isLoading && identity && identity.id !== field.value) {
            field.onChange(identity.id);
        }
    }, [identity, isLoading, field]);

    if (isLoading || error) {
        return null;
    }

    return (
        <input {...field} hidden />
    );
};

const MatchCreate = () => {
    const [deckCount, setDeckCount] = React.useState(0);
    const [winnerCount, setWinnerCount] = React.useState(0);
    const [loserCount, setLoserCount] = React.useState(0);
    const [starterCount, setStarterCount] = React.useState(1);

    const [create] = useCreate();
    const redirect = useRedirect();
    const { data: deckChoices, isLoading, error } = useGetList('deck', { pagination: { page: 1, perPage: 200 }, sort: { field: 'name', order: 'ASC' }, filter: { retired: 0 } });

    const handleTypeChange = (event: any) => {
        const selectedType = event.target.value;
        switch (selectedType) {
            case '1v1':
                setDeckCount(2);
                setWinnerCount(1);
                setLoserCount(1);
                setStarterCount(1);
                break;
            case '3 man ffa':
                setDeckCount(3);
                setWinnerCount(1);
                setLoserCount(2);
                setStarterCount(1);
                break;
            case '4 man ffa':
                setDeckCount(4);
                setWinnerCount(1);
                setLoserCount(3);
                setStarterCount(1);
                break;
            case 'Two head giant':
                setDeckCount(4);
                setWinnerCount(2);
                setLoserCount(2);
                setStarterCount(2);
                break;
            case 'Stjerne':
                setDeckCount(5);
                setWinnerCount(1);
                setLoserCount(4);
                setStarterCount(1);
                break;
            case '5 man ffa':
                setDeckCount(5);
                setWinnerCount(1);
                setLoserCount(4);
                setStarterCount(1);
                break;
            default:
                setDeckCount(0);
                setWinnerCount(0);
                setLoserCount(0);
                setStarterCount(0);
        }
    };

    const handleWinnerCountChange = (event: any) => {
        const count = parseInt(event.target.value, 10);
        setWinnerCount(count);
        setLoserCount(deckCount - count);
    };

    const deckOptionText = (record: any) => {
        return <DeckOptionText record={record} />;
    };

    const deckInputText = (record: any) => `${record.commander} (${record.owner_name})`;

    const save = async (data: any) => {
        const formattedDecks = [];
        const type = data.type;

        if (type === '1v1' || type === 'Two head giant') {
            // 1v1 and Two head giant have two teams
            for (let i = 0; i < winnerCount; i++) {
                if (data[`winner${i + 1}`]) {
                    const deck = deckChoices?.find((deck: any) => deck.id === data[`winner${i + 1}`]);
                    if (deck) {
                        formattedDecks.push({ deck_id: deck.id, name: deck.name, result: 'winner', owner_id: deck.owner, team: 1 });
                    }
                }
            }

            for (let i = 0; i < loserCount; i++) {
                if (data[`loser${i + 1}`]) {
                    const deck = deckChoices?.find((deck: any) => deck.id === data[`loser${i + 1}`]);
                    if (deck) {
                        formattedDecks.push({ deck_id: deck.id, name: deck.name, result: 'loser', owner_id: deck.owner, team: 2 });
                    }
                }
            }
        } else {
            // Free-for-all types have each deck in their own team
            for (let i = 0; i < winnerCount; i++) {
                if (data[`winner${i + 1}`]) {
                    const deck = deckChoices?.find((deck: any) => deck.id === data[`winner${i + 1}`]);
                    if (deck) {
                        formattedDecks.push({ deck_id: deck.id, name: deck.name, result: 'winner', owner_id: deck.owner, team: i + 1 });
                    }
                }
            }

            for (let i = 0; i < loserCount; i++) {
                if (data[`loser${i + 1}`]) {
                    const deck = deckChoices?.find((deck: any) => deck.id === data[`loser${i + 1}`]);
                    if (deck) {
                        formattedDecks.push({ deck_id: deck.id, name: deck.name, result: 'loser', owner_id: deck.owner, team: winnerCount + i + 1 });
                    }
                }
            }
        }

        const payload = {
            ...data,
            decks: formattedDecks,
        };

        create('match', { data: payload });
        redirect('/match');
    };

    if (isLoading) return 'Loading...';
    if (error) return 'Error';

    return (
        <Grid container spacing={2}>
            <Grid item xs={12} mt={4} pb={3}>
                <Card className="playersCard">
                    <Grid container>
                        <Grid item xs={12} lg={6}>
                            <h1>New match</h1>
                            <p>Add a new match here</p>
                        </Grid >
                    </Grid >
                </Card >
            </Grid>
            <Grid item xs={12}>
                <Create className="createBox">
                    <SimpleForm onSubmit={save}>
                        <CustomHiddenInput source="registered_by" />
                        <SelectInput
                            source="type"
                            choices={[
                                { id: '1v1', name: '1v1' },
                                { id: '3 man ffa', name: '3 man ffa' },
                                { id: '4 man ffa', name: '4 man ffa' },
                                { id: 'Two head giant', name: 'Two head giant' },
                                { id: 'Stjerne', name: 'Stjerne' },
                                { id: '5 man ffa', name: '5 man ffa' },
                            ]}
                            validate={validateType}
                            onChange={handleTypeChange}
                            fullWidth
                        />
                        <DateInput source="date" validate={validateDate} defaultValue={new Date().toISOString().split('T')[0]} fullWidth className="dateInput" />
                        <TextInput source="notes" defaultValue="" multiline fullWidth />
                        {deckCount > 0 && (
                            <>
                                {deckCount === 5 && (
                                    <Box mb={2}>
                                        <FormControl component="fieldset">
                                            <FormLabel component="legend" sx={{ color: 'white' }}>Number of Winners</FormLabel>
                                            <RadioGroup
                                                aria-label="Number of Winners"
                                                name="number-of-winners"
                                                value={winnerCount}
                                                onChange={handleWinnerCountChange}
                                            >
                                                <FormControlLabel value="1" control={<Radio />} label="1" />
                                                <FormControlLabel value="2" control={<Radio />} label="2" />
                                            </RadioGroup>
                                        </FormControl>
                                    </Box>
                                )}
                                <Box width={'100%'}>
                                    <Typography fontSize={18} color={'white'} mb={1}>
                                        Winners
                                    </Typography>
                                    {Array.from({ length: winnerCount }, (_, index) => (
                                        <ReferenceInput
                                            key={index}
                                            label={`Winner ${index + 1}`}
                                            source={`winner${index + 1}`}
                                            reference="deck"
                                            sort={{ field: 'name', order: 'ASC' }}
                                            perPage={200}
                                            filter={{ retired: 0 }}
                                        >
                                            <AutocompleteInput
                                                optionText={deckOptionText}
                                                inputText={deckInputText}
                                                sx={{ minWidth: "300px" }}
                                                fullWidth
                                            />
                                        </ReferenceInput>
                                    ))}
                                    <Grid xs={12} sm={6}>
                                        <Typography fontSize={18} color={'white'} mb={1}>
                                            Losers
                                        </Typography>
                                        {Array.from({ length: loserCount }, (_, index) => (
                                            <ReferenceInput
                                                key={index}
                                                label={`Loser ${index + 1}`}
                                                source={`loser${index + 1}`}
                                                reference="deck"
                                                sort={{ field: 'name', order: 'ASC' }}
                                                perPage={200}
                                            >
                                                <AutocompleteInput
                                                    optionText={deckOptionText}
                                                    inputText={deckInputText}
                                                    sx={{ minWidth: "300px" }}
                                                />
                                            </ReferenceInput>
                                        ))}
                                    </Grid>
                                    {starterCount === 2 ? (
                                        <Grid xs={12} sm={6}>
                                            <Typography fontSize={18} color={'white'} mb={1}>
                                                Starters
                                            </Typography>
                                            {Array.from({ length: starterCount }, (_, index) => (
                                                <ReferenceInput
                                                    key={index}
                                                    label={`Starter ${index + 1}`}
                                                    source={`starter${index + 1}`}
                                                    reference="deck"
                                                    sort={{ field: 'name', order: 'ASC' }}
                                                    perPage={200}
                                                >
                                                    <AutocompleteInput
                                                        optionText={deckOptionText}
                                                        inputText={deckInputText}
                                                        sx={{ minWidth: "300px" }}
                                                    />
                                                </ReferenceInput>
                                            ))}
                                        </Grid>
                                    ) : (
                                        <Grid xs={12} sm={6}>
                                            <Typography fontSize={18} color={'white'} mb={1}>
                                                Starter
                                            </Typography>
                                            <ReferenceInput
                                                label={`Starter 1`}
                                                source={`starter1`}
                                                reference="deck"
                                                sort={{ field: 'name', order: 'ASC' }}
                                                perPage={200}
                                            >
                                                <AutocompleteInput
                                                    optionText={deckOptionText}
                                                    inputText={deckInputText}
                                                    sx={{ minWidth: "300px" }}
                                                />
                                            </ReferenceInput>
                                        </Grid>
                                    )}
                                </Box>
                            </>
                        )}
                    </SimpleForm>
                </Create>
            </Grid>
        </Grid>
    );
};

export default MatchCreate;
