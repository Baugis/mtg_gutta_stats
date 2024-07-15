import { AuthProvider, fetchUtils, useStore } from "react-admin";

const apiUrl = 'https://www.magigutta.no/api';


export const authProvider: AuthProvider = {
    // called when the user attempts to log in
    login: ({ username, password }) => {
        const request = new Request(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                username: username,
                password,
                action: 'login'
            }),
            headers: new Headers({ 'Content-Type': 'application/json' }),
        });

        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(auth => {
                localStorage.setItem('auth', auth.token);
            })
            .catch(() => {
                throw new Error('Network error')
            });
    },
    // called when the user clicks on the logout button
    logout: () => {
        localStorage.removeItem("username");
        return Promise.resolve();
    },
    // called when the API returns an error
    checkError: (error) => {
        const status = error.status;
        if (status === 401 || status === 403) {
            localStorage.removeItem('auth');
            return Promise.reject();
        }
        // other error code (404, 500, etc): no need to log out
        return Promise.resolve();
    },
    // called when the user navigates to a new location, to check for authentication
    checkAuth: () => {
        const auth = localStorage.getItem("auth");
        if (!auth) throw new Error('Token has expired')
        const request = new Request(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                action: 'checkAuth'
            }),
            headers: new Headers({
                'Authorization': `Bearer ${auth}`
            }),
        })

        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .catch(() => {
                throw new Error('Network error');
            });
    },
    // called when the user navigates to a new location, to check for permissions / roles
    getPermissions: () => Promise.resolve(),

    getIdentity: () => {
        const auth = localStorage.getItem("auth");
        if (!auth) return Promise.reject(new Error('No auth token found'));

        const request = new Request(apiUrl, {
            method: 'POST',
            body: JSON.stringify({
                action: 'getIdentity'
            }),
            headers: new Headers({
                'Authorization': `Bearer ${auth}`
            }),
        });

        return fetch(request)
            .then(response => {
                if (response.status < 200 || response.status >= 300) {
                    throw new Error(response.statusText);
                }
                return response.json();
            })
            .then(({ id, fullName, avatar }) => {
                return { id, fullName, avatar };
            })
            .catch(error => {
                return Promise.reject(new Error('Error fetching identity: ' + error.message));
            });
    }
}