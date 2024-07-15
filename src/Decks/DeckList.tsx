import { Datagrid, List, TextInput, ReferenceField, ReferenceInput, TextField, SelectInput, UrlField, useRecordContext, useGetList, RaRecord, useSortState, RecordContextProvider, ImageField, Link, CreateButton } from 'react-admin';
import DeckColors from './DeckColors';
import { FC, useMemo } from 'react';
import { calculateTotalGames, calculateTotalLosses, calculateTotalWinPercentage, calculateTotalWins, colorCombinations } from '../Helpers/utils';
import { useMediaQuery, Theme, Card, Typography, Grid } from '@mui/material';
import { Box } from '@mui/system';

interface DeckStat {
    id: number;
    deck_id: number;
    owner_id: number;
    '1v1_wins': number;
    '1v1_losses': number;
    '3_man_ffa_wins': number;
    '3_man_ffa_losses': number;
    '4_man_ffa_wins': number;
    '4_man_ffa_losses': number;
    'two_head_giant_wins': number;
    'two_head_giant_losses': number;
    'star_wins': number;
    'star_losses': number;
}

interface TotalGamesFieldProps {
    type: 'games' | 'wins' | 'losses' | 'percentage';
    deckId: any;
    label?: string;
    aggregate?: boolean;
    sortField?: string;
    sortOrder?: 'ASC' | 'DESC';
}

const TotalGamesField: FC<TotalGamesFieldProps> = ({ type, deckId, label, aggregate = false, sortField = 'id', sortOrder = 'ASC' }) => {
    const record = useRecordContext<RaRecord>();
    const { sort, setSort } = useSortState();

    const { data, isLoading, error } = useGetList<DeckStat>(
        'deck_stat',
        {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: sortField, order: sortOrder },
            filter: aggregate ? { owner_id: record?.id } : { deck_id: deckId || record?.id },
        },
    );

    if (isLoading) return <span>Loading...</span>;
    if (error) return <span>Error loading deck stats</span>;

    const deckStats = data || [];
    let total = 0;
    if (type === 'games') {
        total = calculateTotalGames(deckStats);
    } else if (type === 'wins') {
        total = calculateTotalWins(deckStats);
    } else if (type === 'losses') {
        total = calculateTotalLosses(deckStats);
    } else if (type === 'percentage') {
        total = calculateTotalWinPercentage(deckStats)
    }

    return <span>{total}{type === 'percentage' ? '%' : null}</span>;
};

const colorChoices = colorCombinations.map(combo => {
    const [key, value] = Object.entries(combo)[0];
    const keyString = `["${key.split(',').join('","')}"]`;
    return { id: keyString, name: value };
}).sort((a, b) => a.name.localeCompare(b.name));

const deckFilters = [
    <TextInput source="q" label="Search" alwaysOn />,
    <ReferenceInput source="owner" label="Player" reference="player" alwaysOn sort={{ field: 'name', order: 'ASC' }} />,
    <SelectInput source="colorIdentity" choices={colorChoices} alwaysOn />,
];

const MobileGrid = () => {
    const { data, isLoading, error } = useGetList(
        'deck',
        {
            pagination: { page: 1, perPage: 1000 },
            sort: { field: 'name', order: 'ASC' }
        }
    );

    if (isLoading) return <span>Loading...</span>;
    if (error) return <span>Error loading decks</span>;

    return (
        <>
            {data?.map(record => (
                <Link to={`/deck/${record.id}/show`} style={{ textDecoration: 'none', color: 'inherit' }} key={record.id} sx={{ width: "100%" }} mb={1.4}>
                    <Grid>
                        <RecordContextProvider key={record.id} value={record}>
                            <Box display="flex" className="deckListBox">
                                <Box>
                                    <ImageField source="card_data.image_uris.small" className="mobileGridImage" />
                                </Box>
                                <Box pl={2} display={'flex'} flexDirection={'column'} justifyContent={'center'} width={'100%'}>
                                    <Box display={'flex'} justifyContent={'space-between'}>
                                        <Typography component={'span'} gutterBottom color={'white'}>
                                            <TextField source="name" fontSize="1rem" />
                                        </Typography>
                                        {/* <Typography component={'span'} color={'#fda907'}>
                                            <TotalGamesField type="percentage" deckId={record.id} />
                                        </Typography> */}
                                    </Box>
                                    <Typography component={'span'} gutterBottom display="flex" variant='body2' color="rgba(255, 255, 255, 0.5)">
                                        <span style={{ marginRight: "10px" }}>Deck colors:</span> <DeckColors label="Deck colors" />
                                    </Typography>
                                    <Typography component={'span'} gutterBottom display="flex" variant='body2' color="rgba(255, 255, 255, 0.5)">
                                        <span style={{ marginRight: "10px" }}>Archtype:</span> <TextField source="arctype" />
                                    </Typography>
                                    <Typography component={'span'} gutterBottom display="flex" variant='body2' color="rgba(255, 255, 255, 0.5)">
                                        <span style={{ marginRight: "10px" }}>Owner:</span> <ReferenceField source="owner" reference="player">
                                            <TextField source="name" />
                                        </ReferenceField>
                                    </Typography>
                                </Box>
                            </Box>
                        </RecordContextProvider>
                    </Grid>
                </Link>
            ))}
        </>
    );
}

export const DeckList = () => {
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

    return (
        isSmall ? (
            <>
                <Grid item xs={12} mt={4} pb={6}>
                    <Card className="playersCard">
                        <Grid container>
                            <Grid item xs={12} lg={6}>
                                <h1>Decks</h1>
                                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras rhoncus tempus nunc faucibus auctor.</p>
                            </Grid>
                        </Grid>
                    </Card>
                </Grid>

                <Grid container pb={6}>
                    <CreateButton label="Create Deck" />
                    <MobileGrid />
                </Grid>
            </>
        ) : (
            <List filters={isSmall ? undefined : deckFilters} sx={{ backgroundImage: "none" }}>
                <Datagrid rowClick="show">
                    <TextField source="id" />
                    <TextField source="name" />
                    <DeckColors label="Deck colors" />
                    <TextField source="arctype" />
                    <ReferenceField source="owner" reference="player">
                        <TextField source="name" />
                    </ReferenceField>
                    <UrlField source="deckbox_link" target='_blank' />
                    <TotalGamesField type="percentage" label='Win rate' deckId={undefined} />
                </Datagrid>
            </List>
        )
    );
}
