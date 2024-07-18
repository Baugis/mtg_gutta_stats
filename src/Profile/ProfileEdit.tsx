import React from 'react';
import { useNotify, useRedirect, useRefresh, useGetIdentity, useUpdate, Form, ImageInput, ImageField, FileInput, FileField } from 'react-admin';
import { TextInput, SimpleForm, SaveButton, Toolbar, useRecordContext } from 'react-admin';
import { Box, Card, CardContent, CardHeader, Grid, Typography, useMediaQuery, Theme } from '@mui/material';

const ProfileEdit = () => {
    const { data: identity, isLoading } = useGetIdentity();
    const notify = useNotify();
    const redirect = useRedirect();
    const refresh = useRefresh();
    const [update] = useUpdate();
    const isSmall = useMediaQuery<Theme>(theme => theme.breakpoints.down('md'));

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
        isSmall ? (
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
                        <FileInput source="avatar" label="Avatar" accept="image/*">
                            <FileField source="src" title="title" className="fileUploadText" />
                        </FileInput>
                    </SimpleForm>
                </Grid>
            </Grid>
        ) : (
            <Grid container justifyContent={'center'}>
                <Grid item xs={12} mt={7} pb={6} mx={4}>
                    <Card className="playersCard">
                        <Grid container>
                            <Grid item xs={12} lg={6}>
                                <h1>Edit profile</h1>
                                <p>Edit your profile here</p>
                            </Grid >
                        </Grid >
                    </Card >
                </Grid>

                <Grid item xs={4} mx={4}>
                    <SimpleForm onSubmit={save} className="profileEdit" mb={5}>
                        <TextInput source="fullName" label="Name" defaultValue={identity?.fullName} fullWidth />
                        <FileInput source="avatar" label="Avatar" accept="image/*">
                            <FileField source="src" title="title" className="fileUploadText" />
                        </FileInput>
                    </SimpleForm>
                </Grid>
            </Grid>
        )

    );
};

export default ProfileEdit;