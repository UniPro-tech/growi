import React, { FC, useState } from 'react';

import { useTranslation } from 'react-i18next';
import PropTypes from 'prop-types';
import AppContainer from '~/client/services/AppContainer';
import { withUnstatedContainers } from '../UnstatedUtils';
import InAppNotificationList from './InAppNotificationList';
import { useSWRxInAppNotifications } from '../../stores/in-app-notification';
import PaginationWrapper from '../PaginationWrapper';
import CustomNavAndContents from '../CustomNavigation/CustomNavAndContents';
import { InAppNotificationStatuses } from '~/interfaces/in-app-notification';
import { apiv3Put } from '~/client/util/apiv3-client';


type Props = {
  appContainer: AppContainer
}

const InAppNotificationPageBody: FC<Props> = (props) => {
  const { appContainer } = props;
  const { t } = useTranslation();

  const limit = appContainer.config.pageLimitationXL;


  // commonize notification lists by 81953
  const InAppNotificationCategoryByStatus = (status?) => {
    const [activePage, setActivePage] = useState(1);
    const offset = (activePage - 1) * limit;
    const { data: notificationData, mutate } = useSWRxInAppNotifications(limit, offset);

    const setAllNotificationPageNumber = (selectedPageNumber): void => {
      setActivePage(selectedPageNumber);
    };


    if (notificationData == null) {
      return (
        <div className="wiki">
          <div className="text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        </div>
      );
    }

    const updateUnopendNotificationStatusesToOpened = async() => {
      await apiv3Put('/in-app-notification/all-statuses-open');
      mutate();
    };


    return (
      <>
        {status === 'UNOPENED'
      && (
        <div className="mb-2 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={updateUnopendNotificationStatusesToOpened}
          >
            {t('in_app_notification.mark_all_as_read')}
          </button>
        </div>
      )
        }

        <InAppNotificationList inAppNotificationData={notificationData} />
        <PaginationWrapper
          activePage={activePage}
          changePage={setAllNotificationPageNumber}
          totalItemsCount={notificationData.totalDocs}
          pagingLimit={notificationData.limit}
          align="center"
          size="sm"
        />
      </>
    );
  };


  // commonize notification lists by 81953
  const UnopenedInAppNotificationList = () => {
    const [activePageOfUnopenedNotificationCat, setActiveUnopenedNotificationPage] = useState(1);
    const offsetOfUnopenedNotificationCat = (activePageOfUnopenedNotificationCat - 1) * limit;
    const {
      data: unopendNotificationData, mutate,
    } = useSWRxInAppNotifications(limit, offsetOfUnopenedNotificationCat, InAppNotificationStatuses.STATUS_UNOPENED);

    const setUnopenedPageNumber = (selectedPageNumber): void => {
      setActiveUnopenedNotificationPage(selectedPageNumber);
    };

    const updateUnopendNotificationStatusesToOpened = async() => {
      await apiv3Put('/in-app-notification/all-statuses-open');
      mutate();
    };

    if (unopendNotificationData == null) {
      return (
        <div className="wiki">
          <div className="text-muted text-center">
            <i className="fa fa-2x fa-spinner fa-pulse mr-1"></i>
          </div>
        </div>
      );
    }

    return (
      <>
        <div className="mb-2 d-flex justify-content-end">
          <button
            type="button"
            className="btn btn-outline-primary"
            onClick={updateUnopendNotificationStatusesToOpened}
          >
            {t('in_app_notification.mark_all_as_read')}
          </button>
        </div>
        <InAppNotificationList inAppNotificationData={unopendNotificationData} />
        <PaginationWrapper
          activePage={activePageOfUnopenedNotificationCat}
          changePage={setUnopenedPageNumber}
          totalItemsCount={unopendNotificationData.totalDocs}
          pagingLimit={unopendNotificationData.limit}
          align="center"
          size="sm"
        />
      </>
    );
  };

  const navTabMapping = {
    user_infomation: {
      Icon: () => <></>,
      Content: () => InAppNotificationCategoryByStatus(),
      i18n: t('in_app_notification.all'),
      index: 0,
    },
    external_accounts: {
      Icon: () => <></>,
      Content: () => InAppNotificationCategoryByStatus('UNOPENED'),
      i18n: t('in_app_notification.unopend'),
      index: 1,
    },
  };

  return (
    <CustomNavAndContents navTabMapping={navTabMapping} />
  );
};

const InAppNotificationPage = withUnstatedContainers(InAppNotificationPageBody, [AppContainer]);
export default InAppNotificationPage;

InAppNotificationPageBody.propTypes = {
  appContainer: PropTypes.instanceOf(AppContainer).isRequired,
};
