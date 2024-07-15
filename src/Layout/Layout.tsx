// in src/MyLayout.js
import { Layout } from 'react-admin';

import { MyAppBar } from './MyAppBar';
import { MyMenu } from './MyMenu';

export const MyLayout = ({ children }: { children: any }) => (
    <Layout appBar={MyAppBar} menu={MyMenu}>
        {children}
    </Layout>
);