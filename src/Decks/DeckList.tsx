import { Datagrid, List, TextInput, ReferenceField, ReferenceInput, TextField, SelectInput, UrlField, useRecordContext, useGetList, RaRecord, useSortState, RecordContextProvider, ImageField, Link, CreateButton } from 'react-admin';
import DeckColors from './DeckColors';
import { FC, useEffect, useMemo, useState } from 'react';
import { calculateTotalGames, calculateTotalLosses, calculateTotalWinPercentage, calculateTotalWins, colorCombinations } from '../Helpers/utils';
import { useMediaQuery, Theme, Card, Typography, Grid, FormControl, InputLabel, Select, MenuItem } from '@mui/material';
import { Box } from '@mui/system';
import TextField2 from '@mui/material/TextField';
import useDebounce from '../Helpers/useDebounce';
import { checkRetired } from '../Helpers/checkRetired';

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

const MobileDeckList = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const [tmpSearchQuery, setTmpSearchQuery] = useState('');
    const [filterColor, setFilterColor] = useState('');

    const debouncedSearchQuery = useDebounce(tmpSearchQuery, 300);

    const { data, isLoading, error } = useGetList(
        'deck',
        {
            pagination: { page: 1, perPage: 100 },
            sort: { field: 'name', order: 'ASC' },
            filter: { q: searchQuery ? searchQuery : null, colors: filterColor ? filterColor : null }
        }
    );

    const sortedDecks = data?.sort((a, b) => {
        const aRetired = checkRetired(a) ? 1 : 0;
        const bRetired = checkRetired(b) ? 1 : 0;
        if (aRetired !== bRetired) {
            return aRetired - bRetired;
        } else {
            return a.name.localeCompare(b.name);
        }
    });

    const handleSearchChange = (event: any) => {
        setTmpSearchQuery(event.target.value);
    };

    const handleFilterColorChange = (event: any) => {
        setFilterColor(event.target.value);
    };

    useEffect(() => {
        setSearchQuery(debouncedSearchQuery);
    }, [debouncedSearchQuery]);

    return (
        <>
            <Box mb={2} className="matchHistoryBox" sx={{ width: "100%" }}>
                <TextField2
                    label="Search"
                    variant="outlined"
                    value={tmpSearchQuery}
                    onChange={handleSearchChange}
                    fullWidth
                />
                <FormControl fullWidth variant="outlined" margin="normal">
                    <InputLabel>Colors</InputLabel>
                    <Select
                        value={filterColor}
                        onChange={handleFilterColorChange}
                        label="Type"
                        className="colorsSelect"
                    >
                        <MenuItem value="" className="colorsSelectItem"><div>All</div></MenuItem>
                        <MenuItem value='["B"]' className="colorsSelectItem">Black<div className="mana-b"></div></MenuItem>
                        <MenuItem value='["G"]' className="colorsSelectItem">Green<div className="mana-g"></div></MenuItem>
                        <MenuItem value='["R"]' className="colorsSelectItem">Red<div className="mana-r"></div></MenuItem>
                        <MenuItem value='["U"]' className="colorsSelectItem">Blue<div className="mana-u"></div></MenuItem>
                        <MenuItem value='["W"]' className="colorsSelectItem">White<div className="mana-w"></div></MenuItem>
                        <MenuItem value='["U","W"]' className="colorsSelectItem">Azorius<div className="mana-u"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["R","W"]' className="colorsSelectItem">Boros<div className="mana-r"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["B","U"]' className="colorsSelectItem">Dimir<div className="mana-b"></div><div className="mana-u"></div></MenuItem>
                        <MenuItem value='["B","G"]' className="colorsSelectItem">Golgari<div className="mana-b"></div><div className="mana-g"></div></MenuItem>
                        <MenuItem value='["G","R"]' className="colorsSelectItem">Gruul<div className="mana-g"></div><div className="mana-r"></div></MenuItem>
                        <MenuItem value='["R","U"]' className="colorsSelectItem">Izzet<div className="mana-r"></div><div className="mana-u"></div></MenuItem>
                        <MenuItem value='["B","W"]' className="colorsSelectItem">Orzhov<div className="mana-b"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["B","R"]' className="colorsSelectItem">Rakdos<div className="mana-b"></div><div className="mana-r"></div></MenuItem>
                        <MenuItem value='["G","W"]' className="colorsSelectItem">Selesnya<div className="mana-g"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["G","U"]' className="colorsSelectItem">Simic<div className="mana-g"></div><div className="mana-u"></div></MenuItem>
                        <MenuItem value='["B","G","W"]' className="colorsSelectItem">Abzan<div className="mana-b"></div><div className="mana-g"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["G","U","W"]' className="colorsSelectItem">Bant<div className="mana-g"></div><div className="mana-u"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["B","U","W"]' className="colorsSelectItem">Esper<div className="mana-b"></div><div className="mana-u"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["B","R","U"]' className="colorsSelectItem">Grixis<div className="mana-b"></div><div className="mana-r"></div><div className="mana-u"></div></MenuItem>
                        <MenuItem value='["R","U","W"]' className="colorsSelectItem">Jeskai<div className="mana-r"></div><div className="mana-u"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["B","G","R"]' className="colorsSelectItem">Jund<div className="mana-b"></div><div className="mana-g"></div><div className="mana-r"></div></MenuItem>
                        <MenuItem value='["B","R","W"]' className="colorsSelectItem">Mardu<div className="mana-b"></div><div className="mana-r"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["G","R","W"]' className="colorsSelectItem">Naya<div className="mana-g"></div><div className="mana-r"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["B","G","U"]' className="colorsSelectItem">Sultai<div className="mana-b"></div><div className="mana-g"></div><div className="mana-u"></div></MenuItem>
                        <MenuItem value='["G","R","U"]' className="colorsSelectItem">Temur<div className="mana-g"></div><div className="mana-r"></div><div className="mana-u"></div></MenuItem>
                        <MenuItem value='["B","G","R","U"]' className="colorsSelectItem">Glint<div className="mana-b"></div><div className="mana-g"></div><div className="mana-r"></div><div className="mana-u"></div></MenuItem>
                        <MenuItem value='["B","G","R","W"]' className="colorsSelectItem">Dune<div className="mana-b"></div><div className="mana-g"></div><div className="mana-r"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["G","R","U","W"]' className="colorsSelectItem">Ink<div className="mana-g"></div><div className="mana-r"></div><div className="mana-u"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["B","G","U","W"]' className="colorsSelectItem">Witch<div className="mana-b"></div><div className="mana-g"></div><div className="mana-u"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["B","R","U","W"]' className="colorsSelectItem">Yore<div className="mana-b"></div><div className="mana-r"></div><div className="mana-u"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='["B","G","R","U","W"]' className="colorsSelectItem">Rainbow<div className="mana-b"></div><div className="mana-g"></div><div className="mana-r"></div><div className="mana-u"></div><div className="mana-w"></div></MenuItem>
                        <MenuItem value='[]' className="colorsSelectItem">Colorless<div className="mana-colorless"></div></MenuItem>
                    </Select>
                </FormControl>
            </Box>
            {sortedDecks?.map(record => (
                <Link to={`/deck/${record.id}/show`} style={{ textDecoration: 'none', color: 'inherit' }} key={record.id} sx={{ width: "100%" }} mb={1.4}>
                    <Grid>
                        <RecordContextProvider key={record.id} value={record}>
                            <Box display="flex" className="deckListBox">
                                <Box display={'flex'} justifyContent={'center'} alignItems={'center'}>
                                    <ImageField source="card_data.image_uris.small" className={`mobileGridImage ${checkRetired(record) ? 'retiredOverlay' : null}`} />
                                </Box>
                                <Box pl={2} display={'flex'} flexDirection={'column'} justifyContent={'center'} width={'100%'}>
                                    <Box display={'flex'} justifyContent={'space-between'} alignItems={'center'} mb={0.4}>
                                        <Typography component={'span'} gutterBottom mb={0} color={checkRetired(record) ? '#999999' : 'white'}>
                                            <TextField source="name" fontSize="1rem" />
                                        </Typography>
                                        {checkRetired(record) ? (
                                            <span className="retiredMark">Retired</span>
                                        ) : null}
                                    </Box>
                                    <Typography component={'span'} gutterBottom display="flex" variant='body2' color="rgba(255, 255, 255, 0.5)">
                                        <span style={{ marginRight: "10px" }}>Deck colors:</span> <DeckColors label="Deck colors" />
                                    </Typography>
                                    <Typography component={'span'} gutterBottom display="flex" variant='body2' color="rgba(255, 255, 255, 0.5)">
                                        <span style={{ marginRight: "10px" }}>Archtype:</span> <TextField source="arctype" />
                                    </Typography>
                                    <Typography component={'span'} gutterBottom display="flex" variant='body2' color="rgba(255, 255, 255, 0.5)">
                                        <span style={{ marginRight: "10px" }}>Owner:</span>
                                        <ReferenceField source="owner" reference="player">
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
    )
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
                    <MobileDeckList />
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
