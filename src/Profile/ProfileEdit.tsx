import React from 'react';
import { useNotify, useRedirect, useRefresh, useGetIdentity, useUpdate, Form, ImageInput } from 'react-admin';
import { TextInput, SimpleForm, SaveButton, Toolbar, useRecordContext } from 'react-admin';
import { Box, Card, CardContent, CardHeader, Grid, Typography } from '@mui/material';

const ProfileEdit = () => {
    const { data: identity, isLoading } = useGetIdentity();
    const notify = useNotify();
    const redirect = useRedirect();
    const refresh = useRefresh();
    const [update, { isLoading: isUpdating }] = useUpdate();

    const save = async (data) => {
        const { avatar, ...rest } = data;

        if (avatar && avatar.rawFile) {
            const reader = new FileReader();
            reader.readAsDataURL(avatar.rawFile);
            reader.onload = () => {
                const base64Image = reader?.result?.split(',')[1]; // Get base64 part
                const avatarData = {
                    title: avatar.src,
                    base64: base64Image
                };

                const updateData = {
                    ...rest,
                    avatar: avatarData
                };

                update('player', { id: identity?.id, data: updateData }, {
                    onSuccess: () => {
                        notify('Profile updated successfully');
                        redirect('/profile');
                        refresh();
                    },
                    onError: ({ message }) => {
                        notify(`Error: ${message}`, { type: 'warning' });
                    }
                });
            };
        } else {
            update('player', { id: identity?.id, data: rest }, {
                onSuccess: () => {
                    notify('Profile updated successfully');
                    redirect('/profile');
                    refresh();
                },
                onError: ({ message }) => {
                    notify(`Error: ${message}`, { type: 'warning' });
                }
            });
        }
    };

    return (
        <Grid container className="profileEdit">
            <Grid item xs={12} mt={4} pb={3}>
                <Card className="playersCard">
                    <Grid container>
                        <Grid item xs={12} lg={6}>
                            <h1>Edit profile</h1>
                            <p>Edit your profile here</p>
                        </Grid >
                    </Grid >
                </Card >
            </Grid>

            <Grid item xs={12}>
                <SimpleForm onSubmit={save}>
                    <TextInput source="fullName" label="Name" defaultValue={identity?.fullName} fullWidth />
                    <ImageInput source="avatar" accept="image/*" />
                </SimpleForm>
            </Grid>
        </Grid>
    );
};

export default ProfileEdit;