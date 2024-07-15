import { DateField, Show, SimpleShowLayout, TextField } from 'react-admin';

export const MatchShow = () => (
    <Show>
        <SimpleShowLayout>
            <TextField source="id" />
            <TextField source="type" />
            <DateField source="date_played" />
            <TextField source="notes" />
        </SimpleShowLayout>
    </Show>
);