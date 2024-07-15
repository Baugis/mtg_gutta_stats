// myDataProvider.js
import axios from 'axios';
import { CreateParams, CreateResult, GetListResult, GetManyParams, GetManyReferenceParams, GetManyReferenceResult, GetManyResult, GetOneParams, GetOneResult, Resource, UpdateParams, UpdateResult, fetchUtils } from 'react-admin';

const apiUrl = 'https://www.magigutta.no/api';

const handleAxiosError = (error: any) => {
    if (error.response) {
        return {
            status: error.response.status,
            body: error.response.data
        };
    }
    return { status: 500, body: 'Network Error' };
};

const dataProvider = {
    getList: async (resource: any, params: any): Promise<GetListResult> => {
        const request = {
            method: 'post',
            url: apiUrl,
            data: {
                action: 'getList',
                params,
                resource
            }
        };

        try {
            const response = await axios(request);
            const { data, total, pageInfo } = response.data;

            return {
                data,
                total,
                pageInfo
            };
        } catch (error) {
            const axiosError = handleAxiosError(error);
            throw axiosError;
        }
    },
    getOne: async (resource: string, params: GetOneParams): Promise<GetOneResult> => {
        const request = {
            method: 'post',
            url: apiUrl,
            data: {
                action: 'getOne',
                params,
                resource
            }
        };

        try {
            const response = await axios(request);
            const { data } = response.data;

            return {
                data
            };
        } catch (error) {
            const axiosError = handleAxiosError(error);
            throw axiosError;
        }
    },
    getMany: async (resource: string, params: GetManyParams): Promise<GetManyResult> => {
        const request = {
            method: 'post',
            url: apiUrl,
            data: {
                action: 'getMany',
                params,
                resource
            }
        };

        try {
            const response = await axios(request);
            const { data } = response.data;

            return {
                data
            };
        } catch (error) {
            const axiosError = handleAxiosError(error);
            throw axiosError;
        }
    },
    getManyReference: async (resource: string, params: GetManyReferenceParams): Promise<GetManyReferenceResult> => {
        const request = {
            method: 'post',
            url: apiUrl,
            data: {
                action: 'getManyReference',
                resource,
                params
            }
        };

        try {
            const response = await axios(request);
            const { data, total } = response.data;

            return {
                data,
                total
            }
        } catch (error) {
            const axiosError = handleAxiosError(error);
            throw axiosError;
        }
    },
    update: async (resource: string, params: UpdateParams): Promise<UpdateResult> => {
        const request = {
            method: 'post',
            url: apiUrl,
            data: {
                action: 'update',
                resource,
                params
            }
        };

        try {
            const response = await axios(request);
            const { data } = response.data;

            return {
                data
            }
        } catch (error) {
            const axiosError = handleAxiosError(error);
            throw axiosError;
        }
    },
    create: async (resource: string, params: CreateParams): Promise<CreateResult> => {
        const request = {
            method: 'post',
            url: apiUrl,
            data: {
                action: 'create',
                resource,
                params
            }
        };

        try {
            const response = await axios(request);
            const { data } = response.data;

            return {
                data
            }
        } catch (error) {
            const axiosError = handleAxiosError(error);
            throw axiosError;
        }
    }
};

export default dataProvider;