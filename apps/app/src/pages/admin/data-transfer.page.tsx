import { useEffect, useMemo } from 'react';

import type {
  NextPage, GetServerSideProps, GetServerSidePropsContext,
} from 'next';
import { useTranslation } from 'next-i18next';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import type { Container } from 'unstated';
import { Provider } from 'unstated';

import type { CommonProps } from '~/pages/utils/commons';
import { useCurrentUser } from '~/stores/context';

import { retrieveServerSideProps } from '../../utils/admin-page-util';

const AdminLayout = dynamic(() => import('~/components-universal/Layout/AdminLayout'), { ssr: false });
const G2GDataTransferPage = dynamic(() => import('~/components/Admin/G2GDataTransfer'), { ssr: false });
const ForbiddenPage = dynamic(() => import('~/components/Admin/ForbiddenPage').then(mod => mod.ForbiddenPage), { ssr: false });


type Props = CommonProps;


const DataTransferPage: NextPage<Props> = (props) => {
  const { t } = useTranslation('commons');
  useCurrentUser(props.currentUser ?? null);

  const title = t('g2g_data_transfer.data_transfer');

  const injectableContainers: Container<any>[] = useMemo(() => [], []);

  useEffect(() => {
    (async() => {
      const AdminAppContainer = (await import('~/client/services/AdminAppContainer')).default;
      const adminAppContainer = new AdminAppContainer();
      injectableContainers.push(adminAppContainer);
    })();
  }, [injectableContainers]);

  if (props.isAccessDeniedForNonAdminUser) {
    return <ForbiddenPage />;
  }

  return (
    <Provider inject={[...injectableContainers]}>
      <AdminLayout componentTitle={title}>
        <Head>
          <title>{title}</title>
        </Head>
        <G2GDataTransferPage />
      </AdminLayout>
    </Provider>
  );
};


export const getServerSideProps: GetServerSideProps = async(context: GetServerSidePropsContext) => {
  const props = await retrieveServerSideProps(context);
  return props;
};


export default DataTransferPage;
